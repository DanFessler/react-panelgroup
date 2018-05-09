'use strict';

exports.__esModule = true;
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Divider = function (_React$Component) {
  _inherits(Divider, _React$Component);

  function Divider() {
    _classCallCheck(this, Divider);

    var _this = _possibleConstructorReturn(this, _React$Component.apply(this, arguments));

    _this.onMouseDown = function (e) {

      // only left mouse button
      if (e.button !== 0) return;

      _this.setState({
        dragging: true,
        initPos: {
          x: e.pageX,
          y: e.pageY
        }
      });

      e.stopPropagation();
      e.preventDefault();
    };

    _this.onMouseUp = function (e) {
      _this.setState({ dragging: false });
      e.stopPropagation();
      e.preventDefault();
    };

    _this.onMouseMove = function (e) {
      if (!_this.state.dragging) return;

      var initDelta = {
        x: e.pageX - _this.state.initPos.x,
        y: e.pageY - _this.state.initPos.y
      };

      var flowMask = {
        x: _this.props.direction === "row" ? 1 : 0,
        y: _this.props.direction === "column" ? 1 : 0
      };

      var flowDelta = initDelta.x * flowMask.x + initDelta.y * flowMask.y;

      // Resize the panels
      var resultDelta = _this.handleResize(_this.props.panelID, initDelta);

      // if the divider moved, reset the initPos
      if (resultDelta + flowDelta !== 0) {

        // Did we move the expected amount? (snapping will result in a larger delta)
        var expectedDelta = resultDelta === flowDelta;

        _this.setState({
          initPos: {
            // if we moved more than expected, add the difference to the Position
            x: e.pageX + (expectedDelta ? 0 : resultDelta * flowMask.x),
            y: e.pageY + (expectedDelta ? 0 : resultDelta * flowMask.y)
          }
        });
      }

      e.stopPropagation();
      e.preventDefault();
    };

    _this.handleResize = function (i, delta) {
      return _this.props.handleResize(i, delta);
    };

    _this.getHandleWidth = function () {
      return _this.props.dividerWidth + _this.props.handleBleed * 2;
    };

    _this.getHandleOffset = function () {
      return _this.props.dividerWidth / 2 - _this.getHandleWidth() / 2;
    };

    _this.state = {
      dragging: false,
      initPos: { x: null, y: null }
    };
    return _this;
  }

  // Add/remove event listeners based on drag state


  Divider.prototype.componentDidUpdate = function componentDidUpdate(props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  };

  // Start drag state and set initial position


  // End drag state


  // Call resize handler if we're dragging


  // Handle resizing


  // Utility functions for handle size provided how much bleed
  // we want outside of the actual divider div


  // Render component
  Divider.prototype.render = function render() {
    var style = {
      divider: {
        width: this.props.direction === "row" ? this.props.dividerWidth : "auto",
        minWidth: this.props.direction === "row" ? this.props.dividerWidth : "auto",
        maxWidth: this.props.direction === "row" ? this.props.dividerWidth : "auto",
        height: this.props.direction === "column" ? this.props.dividerWidth : "auto",
        minHeight: this.props.direction === "column" ? this.props.dividerWidth : "auto",
        maxHeight: this.props.direction === "column" ? this.props.dividerWidth : "auto",
        flexGrow: 0,
        position: "relative"
      },
      handle: {
        position: "absolute",
        width: this.props.direction === "row" ? this.getHandleWidth() : "100%",
        height: this.props.direction === "column" ? this.getHandleWidth() : "100%",
        left: this.props.direction === "row" ? this.getHandleOffset() : 0,
        top: this.props.direction === "column" ? this.getHandleOffset() : 0,
        backgroundColor: this.props.showHandles ? "rgba(0,128,255,0.25)" : "auto",
        cursor: this.props.direction === "row" ? "col-resize" : "row-resize",
        zIndex: 100
      }
    };
    Object.assign(style.divider, { backgroundColor: this.props.borderColor });

    // Add custom class if dragging
    var className = "divider";
    if (this.state.dragging) {
      className += " dragging";
    }

    return _react2.default.createElement(
      'div',
      { className: className, style: style.divider, onMouseDown: this.onMouseDown },
      _react2.default.createElement('div', { style: style.handle })
    );
  };

  return Divider;
}(_react2.default.Component);

exports.default = Divider;


Divider.defaultProps = {
  dividerWidth: 1,
  handleBleed: 4
};
module.exports = exports['default'];