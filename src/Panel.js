import React from 'react';
import PropTypes from 'prop-types';

export default class Panel extends React.Component {
  static propTypes = {
    resize: PropTypes.string,
    onWindowResize: PropTypes.func,
    panelID: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
  };

  static defaultProps = {
    resize: undefined,
    onWindowResize: undefined
  };

  constructor(props) {
    super(props);
    this.resizeObject = React.createRef();
  }

  // Find the resizeObject if it has one
  componentDidMount() {
    if (this.props.resize === 'stretch') {
      this.resizeObject.current.addEventListener('load', () => this.onResizeObjectLoad());
      this.resizeObject.current.data = 'about:blank';
      this.calculateStretchWidth(); // this.onNextFrame(this.calculateStretchWidth);
    }
  }

  // Attach resize event listener to resizeObject
  onResizeObjectLoad = () => {
    this.resizeObject.current.contentDocument.defaultView.addEventListener('resize', () =>
      this.calculateStretchWidth()
    );
  };

  // Utility function to wait for next render before executing a function
  onNextFrame = (callback) => {
    setTimeout(() => {
      window.requestAnimationFrame(callback);
    }, 0);
  };

  // Recalculate the stretchy panel if it's container has been resized
  calculateStretchWidth = () => {
    if (this.props.onWindowResize !== null) {
      const rect = this.node.getBoundingClientRect();

      this.props.onWindowResize(
        this.props.panelID,
        { x: rect.width, y: rect.height },
        undefined,
        this.node.parentElement
        // recalcalculate again if the width is below minimum
        // Kinda hacky, but for large resizes like fullscreen/Restore
        // it can't solve it in one pass.
        // function() {this.onNextFrame(this.calculateStretchWidth)}.bind(this)
      );
    }
  };

  createResizeObject() {
    const style = {
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
    return this.props.resize === 'stretch' ? (
      <object aria-label="panel" style={style.resizeObject} ref={this.resizeObject} type="text/html" />
    ) : null;
  }

  // Render component
  render() {
    const resizeObject = this.createResizeObject();

    return (
      <div
        ref={(node) => {
          this.node = node;
        }}
        className="panelWrapper"
        style={this.props.style}
      >
        {resizeObject}
        {this.props.children}
      </div>
    );
  }
}
