'use strict';

exports.__esModule = true;
exports.default = undefined;

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Panel = (_temp2 = _class = function (_React$Component) {
  _inherits(Panel, _React$Component);

  function Panel() {
    var _temp, _this, _ret;

    _classCallCheck(this, Panel);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.onResizeObjectLoad = function () {
      _this.refs.resizeObject.contentDocument.defaultView.addEventListener('resize', function () {
        return _this.calculateStretchWidth();
      });
    }, _this.onNextFrame = function (callback) {
      setTimeout(function () {
        window.requestAnimationFrame(callback);
      }, 0);
    }, _this.calculateStretchWidth = function () {
      if (_this.props.onWindowResize !== null) {
        var rect = _this.node.getBoundingClientRect();

        _this.props.onWindowResize(_this.props.panelID, { x: rect.width, y: rect.height

          // recalcalculate again if the width is below minimum
          // Kinda hacky, but for large resizes like fullscreen/Restore
          // it can't solve it in one pass.
          // function() {this.onNextFrame(this.calculateStretchWidth)}.bind(this)
        });
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // Find the resizeObject if it has one
  Panel.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    if (this.props.resize === 'stretch') {
      this.refs.resizeObject.addEventListener('load', function () {
        return _this2.onResizeObjectLoad();
      });
      this.refs.resizeObject.data = 'about:blank';
      this.calculateStretchWidth();
    }
  };

  // Attach resize event listener to resizeObject


  // Utility function to wait for next render before executing a function


  // Recalculate the stretchy panel if it's container has been resized


  Panel.prototype.createResizeObject = function createResizeObject() {
    var style = {
      resizeObject: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 0
      }
    };

    // only attach resize object if panel is stretchy.  Others dont need it
    return this.props.resize === 'stretch' ? _react2.default.createElement('object', { 'aria-label': 'panel', style: style.resizeObject, ref: 'resizeObject', type: 'text/html' }) : null;
  };

  // Render component


  Panel.prototype.render = function render() {
    var _this3 = this;

    var resizeObject = this.createResizeObject();

    return _react2.default.createElement(
      'div',
      {
        ref: function ref(node) {
          _this3.node = node;
        },
        className: 'panelWrapper',
        style: this.props.style
      },
      resizeObject,
      this.props.children
    );
  };

  return Panel;
}(_react2.default.Component), _class.defaultProps = {
  resize: undefined,
  onWindowResize: undefined
}, _temp2);
exports.default = Panel;
Panel.propTypes = process.env.NODE_ENV !== "production" ? {
  resize: _propTypes2.default.string,
  onWindowResize: _propTypes2.default.func,
  panelID: _propTypes2.default.string.isRequired,
  style: _propTypes2.default.string.isRequired,
  children: _propTypes2.default.object.isRequired
} : {};
module.exports = exports['default'];