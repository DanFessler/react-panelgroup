import React from 'react';
import ReactDOM from 'react-dom';



class Divider extends React.Component {

    constructor () {
      super(...arguments);
  
      this.state = {
        dragging: false,
        initPos: {x:null,y:null},
      };
    }
  
    // Add/remove event listeners based on drag state
    componentDidUpdate (props, state) {
      if (this.state.dragging && !state.dragging) {
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
      } else if (!this.state.dragging && state.dragging) {
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
      }
    }
  
    // Start drag state and set initial position
    onMouseDown = (e) => {
  
      // only left mouse button
      if (e.button !== 0) return
  
      this.setState({
        dragging: true,
        initPos: {
          x: e.pageX,
          y: e.pageY
        },
      })
  
      e.stopPropagation()
      e.preventDefault()
    };
  
    // End drag state
    onMouseUp = (e) => {
      this.setState({dragging: false})
      e.stopPropagation()
      e.preventDefault()
  
      return this.onResizeComplete(this.props.panelID)
    };
  
    // Call resize handler if we're dragging
    onMouseMove = (e) => {
      if (!this.state.dragging) return;
  
      let initDelta = {
        x: e.pageX - this.state.initPos.x,
        y: e.pageY - this.state.initPos.y
      }
  
      let flowMask = {
        x: (this.props.direction === "row"    ? 1 : 0),
        y: (this.props.direction === "column" ? 1 : 0)
      }
  
      let flowDelta = (initDelta.x * flowMask.x) + (initDelta.y * flowMask.y);
  
      // Resize the panels
      var resultDelta = this.handleResize(
        this.props.panelID,
        initDelta
      );
  
      // if the divider moved, reset the initPos
      if (resultDelta + flowDelta !== 0) {
  
        // Did we move the expected amount? (snapping will result in a larger delta)
        let expectedDelta = (resultDelta === flowDelta);
  
        this.setState({
          initPos: {
            // if we moved more than expected, add the difference to the Position
            x: e.pageX + (expectedDelta? 0 : resultDelta * flowMask.x),
            y: e.pageY + (expectedDelta? 0 : resultDelta * flowMask.y)
          },
        })
      }
  
      e.stopPropagation()
      e.preventDefault()
    };
  
    // Handle resizing
    handleResize =(i, delta) => {
      return this.props.handleResize(i, delta);
    };

    onResizeComplete = (i) => {
        return this.props.onResizeComplete(i);
    }
  
    // Utility functions for handle size provided how much bleed
    // we want outside of the actual divider div
    getHandleWidth = () => {
      return (this.props.dividerWidth + (this.props.handleBleed * 2));
    };
    getHandleOffset = () => {
      return (this.props.dividerWidth/2) - (this.getHandleWidth()/2);
    };
  
    // Render component
    render () {
      var style = {
        divider: {
          width:    this.props.direction === "row" ? this.props.dividerWidth : "auto",
          minWidth: this.props.direction === "row" ? this.props.dividerWidth : "auto",
          maxWidth: this.props.direction === "row" ? this.props.dividerWidth : "auto",
          height:    this.props.direction === "column" ? this.props.dividerWidth : "auto",
          minHeight: this.props.direction === "column" ? this.props.dividerWidth : "auto",
          maxHeight: this.props.direction === "column" ? this.props.dividerWidth : "auto",
          flexGrow: 0,
          position: "relative",
        },
        handle: {
          position: "absolute",
          width:  this.props.direction === "row"    ? this.getHandleWidth() : "100%",
          height: this.props.direction === "column" ? this.getHandleWidth() : "100%",
          left:   this.props.direction === "row"    ? this.getHandleOffset() : 0,
          top:    this.props.direction === "column" ? this.getHandleOffset() : 0,
          backgroundColor: this.props.showHandles? "rgba(0,128,255,0.25)" : "auto",
          cursor: this.props.direction === "row" ? "col-resize" : "row-resize",
          zIndex: 100,
        }
      }
      Object.assign(style.divider, {backgroundColor: this.props.borderColor});
  
      // Add custom class if dragging
      var className = "divider";
      if (this.state.dragging) {
        className += " dragging";
      }
  
      return (
        <div className={className} style={style.divider} onMouseDown={this.onMouseDown}>
          <div style={style.handle}></div>
        </div>
      );
    }
  }
  
  Divider.defaultProps = {
    dividerWidth: 1,
    handleBleed: 4,
  };

export default Divider;