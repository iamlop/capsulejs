'use strict';

const fs = require('fs');
const _ = require('underscore');
const async = require('async');
const SSH2Promise = require('ssh2-promise');
const colors = require('colors');
const dayjs = require('dayjs');
const ora = require('ora');

module.exports = class Capsule {
  constructor () {}

  init() {
    var targetFile = process.cwd() + '/capsule.json',
      sourceFile = __dirname + '/../templates/capsule.json';

    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
  };

  async parseConfig(target) {
    return new Promise(async function (resolve, reject) {
      let config = require(process.cwd() + '/capsule.json');
      let params = {};

      if (typeof config[target] === 'undefined') {
        process.exit('Error undefined server');
      }

      let currentdate = new Date();
      let formatDir = dayjs().format('YYYY-MM-DD_HH-mm-ss');

      params.server = config[target].server;
      params.git_server = config[target].repository;
      params.directory = formatDir;
      params.full_path = params.server.location + '/' + params.directory;
      params.git_branch = config[target].repository.branch || 'master';
      params.prepare_config = config[target].command.prepare_config || null;
      params.post_command = config[target].command.post || null;

      resolve(params);
    });
  }

  async connect(server) {
    return new Promise(async function (resolve, reject) {
      let options = {
        host: server.host,
        port: server.port || 22,
        username: server.user,
        baseDir: server.location
      };

      if (typeof server.password === 'undefined' && typeof server.private_key !== 'undefined') {
        options.identity = server.private_key;
      } else if (typeof server.password !== 'undefined') {
        options.password = server.password;
      }

      const ssh = new SSH2Promise(options);
      await ssh.connect();
      console.log('Connected'.blue);

      resolve(ssh);
    });
  }

  async deploy(target, ip = []) {
    let params = await this.parseConfig(target);
    let currentServer = (ip.length > 0) ? ip : params.server.host;
    let capsule = this;
    let textMsg = null;
    let output = null;
    let ssh = null;

    if (Array.isArray(currentServer) == false) {
      currentServer = [params.server.host];
    }

    async.eachSeries(currentServer, async function (s) {
      params.server.host = s;

      textMsg = 'Start deploy ' + target + ' [' + s + '] ';
      console.log(textMsg.green.bold);

      ssh = await capsule.connect(params.server);
      await ssh.exec('mkdir ' + params.full_path);
      console.log('Created destination directory'.green);

      console.log('Cloning git'.yellow);
      let spinner = ora('Pulling').start();
      await ssh.exec('git clone', [params.git_server.host, params.full_path, '-b ' + params.git_branch + ' --depth 1 --quiet --single-branch']);
      await ssh.exec('rm -rf', [params.full_path + '/.git', params.full_path + '/.gitignore']);
      spinner.stop();
      console.log('Cloning git DONE'.yellow);

      if (params.post_command) {
        await capsule.execCommand(ssh, params.post_command, params.full_path);
      }

      await capsule.createSimlink(ssh, params.server.simlink, params.full_path);

      if (params.server.user_group) {
        await ssh.exec('chown', ['-R', params.server.user_group, params.full_path]);
      }

      if (params.server.version_limit) {
        await capsule.limitVersion(ssh, params.server.version_limit, params.server.location);
      }

      await ssh.close();
      console.log('Close: ' + s);
    }, function (err) {
      if (err) {
        ssh.close();
        console.log(('<<<<<< ' + err).red);
      } else {
        ssh.close();
        console.log('DONE'.rainbow.bold);
      }
    });
  }

  async execCommand(ssh, commands, fullPath) {
    return new Promise(async function (resolve, reject) {
      let output = null;
      console.log(' Start Post-Command'.blue);

      async.eachSeries(Object.keys(commands), async function (cmdName) {
        let cmd = commands[cmdName];
        let cmdWithPullPath = cmd.replace(/{dir}/g, fullPath);

        output = await ssh.exec(cmdWithPullPath, ['>/dev/null 2>&1']);
        console.log('   ' + cmdName + ': DONE'.magenta);

      }, function (err) {
        if (err) {
          console.log(('   <<<<<< ' + err).red);
          reject();
        } else {
          console.log(' End Post-Command'.blue);
          resolve();
        }
      });
    })
  }

  async createSimlink(ssh, shortCut, fullPath) {
    return new Promise(async function (resolve, reject) {
      let output = null;

      output = await ssh.exec('ln -nfs', [fullPath, shortCut]);
      console.log('Create Simlink: ' + 'DONE'.blue);
      resolve();
    });
  }

  async limitVersion(ssh, versionLimit, sourcePath) {
    let output = null;
    let capsule = this;

    return new Promise(async function (resolve, reject) {
      output = await ssh.exec('ls -t', [sourcePath]);

      let dirList = output.split("\n");
      dirList = _.compact(dirList);

      if (dirList.length < versionLimit) {
        resolve();
        return;
      }

      console.log(' Start Delete Olded version'.blue);

      dirList = dirList.slice(versionLimit);

      async.eachSeries(dirList, async function (d) {
        let dirWithPath = sourcePath + '/' + d;
        await capsule.deleteDirectory(ssh, dirWithPath);
        console.log('   ' + dirWithPath + ': Deleted'.magenta);

      }, function (err) {
        if (err) {
          console.log(('<<<<<< ' + err).red);
          reject();
        } else {
          console.log(' End Delete Olded version'.blue);
          resolve();
        }
      });
    });
  }

  async rollback(target) {
    let params = await this.parseConfig(target);
    let currentServer = params.server.host;
    let capsule = this;
    let textMsg = null;
    let output = null;
    let ssh = null;

    if (Array.isArray(currentServer) == false) {
      currentServer = [currentServer];
    }

    async.eachSeries(currentServer, async function (s) {
      params.server.host = s;

      textMsg = 'Start rollback ' + target + ' [' + s + '] ';
      console.log(textMsg.green.bold);

      ssh = await capsule.connect(params.server);
      output = await ssh.exec('ls -tr', [params.server.location]);

      let dirList = output.split("\n");
      dirList = _.compact(dirList);

      let current = dirList[dirList.length - 1];
      let prev = dirList[dirList.length - 2];

      let currentPath = (current) ? params.server.location + '/' + current : null;
      let prevPath = (prev) ? params.server.location + '/' + prev : null;

      if (currentPath && prevPath) {
        await capsule.createSimlink(ssh, params.server.simlink, prevPath);
        await capsule.deleteDirectory(ssh, currentPath);
      } else {
        console.log('Current version is olded'.red);
      }

      ssh.close();
    }, function (err) {
      if (err) {
        ssh.close();
        console.log(('<<<<<< ' + err).red);
      } else {
        ssh.close();
        console.log('DONE'.rainbow.bold);
      }
    });
  }

  async deleteDirectory(ssh, dir) {
    return new Promise(async function (resolve, reject) {
      await ssh.exec('rm -rf', [dir, '>/dev/null 2>&1']);
      resolve();
    });
  }
}
