import React from 'react';
import ReactDOM from 'react-dom';

export default class Panel extends React.Component {

  // Find the resizeObject if it has one
  componentDidMount () {
    if (this.props.resize === "stretch") {
      this.refs.resizeObject.addEventListener("load", () => this.onResizeObjectLoad());
      this.refs.resizeObject.data = "about:blank";
      this.calculateStretchWidth();
    }
  }

  // Attach resize event listener to resizeObject
  onResizeObjectLoad = () => {
    this.refs.resizeObject.contentDocument.defaultView.addEventListener(
    "resize", () => this.calculateStretchWidth());
  };

  // Utility function to wait for next render before executing a function
  onNextFrame = (callback) => {
    setTimeout(function () {
        window.requestAnimationFrame(callback)
    }, 0)
  };

  // Recalculate the stretchy panel if it's container has been resized
  calculateStretchWidth = () => {
    if (this.props.onWindowResize !== null) {
      var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();

      this.props.onWindowResize(
        this.props.panelID,
        {x:rect.width, y:rect.height},

        // recalcalculate again if the width is below minimum
        // Kinda hacky, but for large resizes like fullscreen/Restore
        // it can't solve it in one pass.
        // function() {this.onNextFrame(this.calculateStretchWidth)}.bind(this)
      );
    }
  };

  createResizeObject(){
    var style = {
      resizeObject: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        opacity: 0,
      }
    }

    // only attach resize object if panel is stretchy.  Others dont need it
    return this.props.resize === "stretch" ? <object style={style.resizeObject} ref="resizeObject" type="text/html"></object> : null;
  }

  // Render component
  render () {
    const resizeObject = this.createResizeObject();

    return (
      <div className="panelWrapper" style={this.props.style}>
        {resizeObject}
        {this.props.children}
      </div>
    )
  }
}
