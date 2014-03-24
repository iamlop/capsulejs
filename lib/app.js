'use strict';

var argv = require('optimist').argv;
var capsule = require('./capsule');
var args = argv._;
var c = new capsule.capsule();

switch (args[0]) {
    case 'init':
        c.init();
        break;
    case 'deploy':
        c.deploy(args[1]);
        break;
    case 'rollback':
        c.rollback(args[1]);
        break;
}
