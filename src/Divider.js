import React from 'react';
import PropTypes from 'prop-types';

export default class Divider extends React.Component {
  static propTypes = {
    dividerWidth: PropTypes.number,
    handleBleed: PropTypes.number,
    direction: PropTypes.string,
    panelID: PropTypes.number.isRequired,
    handleResize: PropTypes.func.isRequired,
    showHandles: PropTypes.bool,
    borderColor: PropTypes.string
  };

  static defaultProps = {
    dividerWidth: 1,
    handleBleed: 4,
    direction: undefined,
    showHandles: false,
    borderColor: undefined
  };

  constructor(...args) {
    super(...args);

    this.state = {
      dragging: false,
      initPos: { x: null, y: null }
    };
  }

  // Add/remove event listeners based on drag state
  componentDidUpdate(props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('touchmove', this.onTouchMove, {
        passive: false
      });
      document.addEventListener('mouseup', this.handleDragEnd);
      document.addEventListener('touchend', this.handleDragEnd, {
        passive: false
      });
      // maybe move it to setState callback ?
      this.props.onResizeStart();
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('touchmove', this.onTouchMove, {
        passive: false
      });
      document.removeEventListener('mouseup', this.handleDragEnd);
      document.removeEventListener('touchend', this.handleDragEnd, {
        passive: false
      });
      this.props.onResizeEnd();
    }
  }

  // Start drag state and set initial position
  handleDragStart = (e, x, y) => {
    this.setState({
      dragging: true,
      initPos: {
        x,
        y
      }
    });

    e.stopPropagation();
    e.preventDefault();
  };

  // End drag state
  handleDragEnd = (e) => {
    this.setState({ dragging: false });
    e.stopPropagation();
    e.preventDefault();
  };

  // Call resize handler if we're dragging
  handleDragMove = (e, x, y) => {
    if (!this.state.dragging) return;

    const initDelta = {
      x: x - this.state.initPos.x,
      y: y - this.state.initPos.y
    };

    const flowMask = {
      x: this.props.direction === 'row' ? 1 : 0,
      y: this.props.direction === 'column' ? 1 : 0
    };

    const flowDelta = initDelta.x * flowMask.x + initDelta.y * flowMask.y;

    // Resize the panels
    const resultDelta = this.handleResize(this.props.panelID, initDelta);

    // if the divider moved, reset the initPos
    if (resultDelta + flowDelta !== 0) {
      // Did we move the expected amount? (snapping will result in a larger delta)
      const expectedDelta = resultDelta === flowDelta;

      this.setState({
        initPos: {
          // if we moved more than expected, add the difference to the Position
          x: x + (expectedDelta ? 0 : resultDelta * flowMask.x),
          y: y + (expectedDelta ? 0 : resultDelta * flowMask.y)
        }
      });
    }

    e.stopPropagation();
    e.preventDefault();
  };

  // Call resize on mouse events
  // Event onMosueDown
  onMouseDown = (e) => {
    // only left mouse button
    if (e.button !== 0) return;
    this.handleDragStart(e, e.pageX, e.pageY);
  };
  // Event onMouseMove
  onMouseMove = (e) => {
    this.handleDragMove(e, e.pageX, e.pageY);
  };

  // Call resize on Touch events (mobile)
  // Event ontouchstart
  onTouchStart = (e) => {
    this.handleDragStart(e, e.touches[0].clientX, e.touches[0].clientY);
  };

  // Event ontouchmove
  onTouchMove = (e) => {
    this.handleDragMove(e, e.touches[0].clientX, e.touches[0].clientY);
  };

  // Handle resizing
  handleResize = (i, delta) => this.props.handleResize(i, delta);

  // Utility functions for handle size provided how much bleed
  // we want outside of the actual divider div
  getHandleWidth = () => this.props.dividerWidth + this.props.handleBleed * 2;
  getHandleOffset = () => this.props.dividerWidth / 2 - this.getHandleWidth() / 2;

  // Render component
  render() {
    const style = {
      divider: {
        width: this.props.direction === 'row' ? this.props.dividerWidth : 'auto',
        minWidth: this.props.direction === 'row' ? this.props.dividerWidth : 'auto',
        maxWidth: this.props.direction === 'row' ? this.props.dividerWidth : 'auto',
        height: this.props.direction === 'column' ? this.props.dividerWidth : 'auto',
        minHeight: this.props.direction === 'column' ? this.props.dividerWidth : 'auto',
        maxHeight: this.props.direction === 'column' ? this.props.dividerWidth : 'auto',
        flexGrow: 0,
        position: 'relative'
      },
      handle: {
        position: 'absolute',
        width: this.props.direction === 'row' ? this.getHandleWidth() : '100%',
        height: this.props.direction === 'column' ? this.getHandleWidth() : '100%',
        left: this.props.direction === 'row' ? this.getHandleOffset() : 0,
        top: this.props.direction === 'column' ? this.getHandleOffset() : 0,
        backgroundColor: this.props.showHandles ? 'rgba(0,128,255,0.25)' : 'auto',
        cursor: this.props.direction === 'row' ? 'col-resize' : 'row-resize',
        zIndex: 100
      }
    };
    Object.assign(style.divider, { backgroundColor: this.props.borderColor });

    // Add custom class if dragging
    let className = 'divider';
    if (this.state.dragging) {
      className += ' dragging';
    }

    return (
      <div
        className={className}
        style={style.divider}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
      >
        <div style={style.handle} />
      </div>
    );
  }
}
