'use strict';

const argv = require('optimist').argv;
const Capsule = require('./capsule');
const _ = require('underscore');
const info = require('../package.json');

const args = argv._;
const c = new Capsule();
let ip = argv.ip;
let config = argv.config;

ip = (typeof(ip) !== 'object' && typeof(ip) !== 'string') ? [] : ip;
ip = _.uniq(ip);
config = (typeof(config) === 'string') ? config : null;

switch (args[0]) {
  case 'init':
      c.init(config);
      break;
  case 'deploy':
      if (args.length > 1) {
        c.deploy(args[1], ip, config);
      }
      break;
  case 'rollback':
      c.rollback(args[1], config);
      break;
  case 'version':
    console.log((`Capsulejs version: ${info.version}`).green.bold);
      break;
}
