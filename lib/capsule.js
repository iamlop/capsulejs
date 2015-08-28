'use strict';

var fs = require('fs');
var SSH = require('simple-ssh');
var _ = require('underscore');
var colors = require('colors');

var capsule = function() {};

capsule.prototype.init = function() {
    var targetFile = process.cwd() + '/capsule.json',
        sourceFile = __dirname + '/../templates/capsule.json';

    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
};

capsule.prototype.connect = function(server) {
    var options = {
        host: server.host,
        port: server.port || 22,
        user: server.user,
        baseDir: server.location
    };

    if (typeof server.password === 'undefined' && typeof server.private_key !== 'undefined') {
        options.key = this.readPrivateKey(server.private_key);
        if (typeof server.passphrase !== 'undefined') {
            options.passphrase = server.passphrase;
        }
    } else if(typeof server.password !== 'undefined') {
        options.pass = server.password;
    }

    var ssh = new SSH(options);
    ssh.on('error', function(err) {
        var message = err.toString();
        console.log(message.red);
        ssh.end();
        process.exit('Break.......');
    });

    ssh.on('ready', function() {
        var message = 'Connected';
        console.log(message.green);
    });

    return ssh;
};

capsule.prototype.parseConfig  = function(target) {
    var config = require(process.cwd() + '/capsule.json');

    if (typeof config[target] === 'undefined') {
        process.exit('Error undefined server');
    }

    var params = {};
    params.server = config[target].server;
    params.git_server = config[target].repository;
    params.directory = _.now();
    params.full_path =  params.server.location + '/' +   params.directory;
    params.git_branch = config[target].repository.branch || 'master';
    params.post_command = config[target].command.post;

    return params;
};

capsule.prototype.readPrivateKey = function(file) {
    var fileContent = fs.readFileSync(file);
    var content = fileContent.toString();
    return content;
}

capsule.prototype.deploy = function(target) {
    var params = this.parseConfig(target),
        ssh = this.connect(params.server),
        capsule = this;

    console.log('Start deploy'.green);

    ssh
        .exec('mkdir', {
            args: [params.directory],
            out: console.log,
        })
        .exec('git clone', {
            args: [params.git_server.host, params.directory, '-b ' + params.git_branch + ' --depth 1'],
            out: console.log,
            exit: function() {
                capsule.simlink(params.server, params);
            }
        })
        .start();
};

capsule.prototype.postCommand = function(server, params) {
    var ssh = this.connect(server)

    console.log('Start create run post comment'.green);

    for (var command in params.post_command) {
        var cmd = params.post_command[command];
        var cmd_with_pull_path = cmd.replace(/{dir}/g, params.full_path);

        ssh
            .exec(cmd_with_pull_path, {
                out: console.log
            });
    };
    ssh.start();
};

capsule.prototype.simlink = function(server, params) {
    var ssh = this.connect(server),
        capsule = this;

    console.log('Start create simlink'.green);

    ssh
        .exec('ln -nfs', {
            args: [params.full_path, server.simlink],
            out: console.log,
            exit: function() {
                capsule.postCommand(server, params);
            }
        })
        .start();
};

capsule.prototype.rollback = function(target) {
    var params = this.parseConfig(target),
        ssh = this.connect(params.server),
        capsule = this;

    console.log('Start rollback'.green);

    ssh
        .exec('ls', {
            out: function(lists) {
                var files = lists.split('\n');
                files = _.compact(files);
                files.sort(function(a, b) {
                    return a < b;
                });

                var current = (files[0]) ? params.server.location + '/' + files[0] : null;
                var prev = (files[1]) ? params.server.location + '/' +  files[1] : null;

                capsule.simlink(params.server, prev);
                capsule.deleteDir(params.server, current);
            }
        })
        .start();
};

capsule.prototype.deleteDir = function(server, target) {
    var ssh = this.connect(server);

    console.log('Start clean directory'.green);

    ssh
        .exec('rm -rf', {
            args: [target],
            out: console.log
        })
        .start();
};

module.exports.capsule = capsule;
