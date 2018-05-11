'use strict';

exports.__esModule = true;
exports.Divider = exports.Panel = undefined;

var _Panel = require('./Panel');

Object.defineProperty(exports, 'Panel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Panel).default;
  }
});

var _Divider = require('./Divider');

Object.defineProperty(exports, 'Divider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Divider).default;
  }
});

var _PanelGroup = require('./PanelGroup');

var _PanelGroup2 = _interopRequireDefault(_PanelGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _PanelGroup2.default;
// ultimatley created this file due to
// https://github.com/insin/nwb/issues/449