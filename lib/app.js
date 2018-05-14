'use strict';

const argv = require('optimist').argv;
const _ = require('underscore');
const async = require('async');
const Capsule = require('./capsule');
const args = argv._;
const colors = require('colors');
const c = new Capsule();

switch (args[0]) {
  case 'init':
      c.init();
      break;
  case 'deploy':
      if (args.length > 1) {
        c.deploy(args[1]);
      }
      break;
  case 'rollback':
      c.rollback(args[1]);
      break;
}
