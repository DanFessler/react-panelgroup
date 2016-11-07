import React from 'react';
import ReactDOM from 'react-dom';


var PanelGroup = React.createClass({

  // Default props
  getDefaultProps: function() {
    return {
      spacing: 1,
      direction: "row",
      panelWidths: []
    };
  },

  // Load initial panel configuration from props
  getInitialState: function() {
    return this.loadPanels(this.props)
  },

  // reload panel configuration if props update
  componentWillReceiveProps: function(nextProps) {

    var nextPanels = nextProps.panelWidths;

    // Only update from props if we're supplying the props in the first place
    if (nextPanels.length) {

      // if the panel array is a different size we know to update
      if (this.state.panels.length !== nextPanels.length) {
        this.setState(this.loadPanels(nextProps));
      }
      // otherwise we need to iterate to spot any difference
      else {
        for (var i=0; i<nextPanels.length; i++) {
          if (
            this.state.panels[i].size !== nextPanels[i].size ||
            this.state.panels[i].minSize !== nextPanels[i].minSize ||
            this.state.panels[i].resize !== nextPanels[i].resize
          ) {
            this.setState(this.loadPanels(nextProps));
            break;
          }
        }
      }

    }

  },

  // load provided props into state
  loadPanels: function(props) {
    var panels = []

    if (props.children) {

      // Default values if none were provided
      var defaultSize = 256;
      var defaultMinSize = 48;
      var defaultResize = "stretch";

      var stretchIncluded = false;
      var children = React.Children.toArray(props.children);

      for (var i=0; i<children.length; i++) {

        if (i < props.panelWidths.length && props.panelWidths[i]) {
          var widthObj = {
            size:    props.panelWidths[i].size !== null ? props.panelWidths[i].size : defaultSize,
            minSize: props.panelWidths[i].minSize !== null ? props.panelWidths[i].minSize : defaultMinSize,
            resize:  props.panelWidths[i].resize? props.panelWidths[i].resize :
                     props.panelWidths[i].size? "dynamic" : defaultResize,
          }
          panels.push(widthObj);
        } else {
          // default values if no props are given
          panels.push({size: defaultSize, resize: defaultResize, minSize: defaultMinSize})
        }

        // if none of the panels included was stretchy, make the last one stretchy
        if (panels[i].resize === "stretch") stretchIncluded = true;
        if (!stretchIncluded && i === children.length-1) panels[i].resize = "stretch";
      }
    }

    return {
      panels: panels
    }
  },

  // Pass internal state out if there's a callback for it
  // Useful for saving panel configuration
  onUpdate: function(panels) {
    if (this.props.onUpdate) {
      this.props.onUpdate(panels.slice())
    }
  },

  // For styling, track which direction to apply sizing to
  getSizeDirection: function(caps) {
    if (caps)
      return this.props.direction === "column" ? "Height" : "Width";
    else
      return this.props.direction === "column" ? "height" : "width";
  },

  // Render component
  render: function() {

    var style = {
      container: {
        width: "100%",
        height: "100%",
        ["min"+this.getSizeDirection(true)]: this.getPanelGroupMinSize(this.props.spacing),
        display: "flex",
        flexDirection: this.props.direction,
        flexGrow: 1,
      },
      panel: {
        flexGrow: 0,
        display: "flex",
      },
    }

    // lets build up a new children array with added resize borders
    var initialChildren = React.Children.toArray(this.props.children);
    var newChildren = [];
    var stretchIncluded = false;

    for (var i=0; i < initialChildren.length; i++) {

      // setting up the style for this panel.  Should probably be handled
      // in the child component, but this was easier for now
      var panelStyle = {
        [this.getSizeDirection()]: this.state.panels[i].size,
        [this.props.direction === "row"? "height" : "width"]: "100%",
        ["min"+this.getSizeDirection(true)]: this.state.panels[i].resize === "stretch"? 0 : this.state.panels[i].size,

        flexGrow: this.state.panels[i].resize === "stretch"? 1 : 0,
        flexShrink: this.state.panels[i].resize === "stretch"? 1 : 0,
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }

      // patch in the background color if it was supplied as a prop
      Object.assign(panelStyle, {backgroundColor: this.props.panelColor});

      // give position info to children
      var metadata = {
        isFirst: (i === 0 ? true : false),
        isLast: (i === initialChildren.length-1 ? true : false),
        resize: this.state.panels[i].resize,

        // window resize handler if this panel is stretchy
        onWindowResize: this.state.panels[i].resize === "stretch"? this.setPanelSize : null,
      }

      // if none of the panels included was stretchy, make the last one stretchy
      if (this.state.panels[i].resize === "stretch") stretchIncluded = true;
      if (!stretchIncluded && metadata.isLast) metadata.resize = "stretch";

      // push children with added metadata
      newChildren.push(
        <Panel style={panelStyle} key={"panel"+i} panelID={i} {...metadata}>{initialChildren[i]}</Panel>
      );

      // add a handle between panels
      if (i < initialChildren.length-1) {
        newChildren.push(<Divider borderColor={this.props.borderColor} key={"divider"+i} panelID={i} handleResize={this.handleResize} dividerWidth={this.props.spacing} direction={this.props.direction} showHandles={this.props.showHandles}/>);
      }
    }

    return <div className="panelGroup" style={style.container}>{newChildren}</div>
  },

  // Entry point for resizing panels.
  // We clone the panel array and perform operations on it so we can
  // setState after the recursive operations are finished
  handleResize: function(i, delta) {
    var tempPanels = this.state.panels.slice();
    var returnDelta = this.resizePanel(i, this.props.direction === "row" ? delta.x : delta.y, tempPanels);
    this.setState({panels: tempPanels});
    this.onUpdate(tempPanels)
    return returnDelta;
  },

  // Recursive panel resizing so we can push other panels out of the way
  // if we've exceeded the target panel's extents
  resizePanel: function(panelIndex, delta, panels) {

    var minsize; var maxsize;

    // track the progressive delta so we can report back how much this panel
    // actually moved after all the adjustments have been made
    var resultDelta = delta;

    // make the changes and deal with the consequences later
    panels[panelIndex].size += delta;
    panels[panelIndex+1].size -= delta;

    // Min and max for LEFT panel
    minsize = this.getPanelMinSize(panelIndex, panels);
    maxsize = this.getPanelMaxSize(panelIndex, panels);

    // if we made the left panel too small
    if (panels[panelIndex].size < minsize) {
      delta = minsize - panels[panelIndex].size;

      if (panelIndex === 0)
        resultDelta += this.resizePanel(panelIndex, delta, panels);
      else
        resultDelta += this.resizePanel(panelIndex-1, -delta, panels);
    };

    // if we made the left panel too big
    if (maxsize !== 0 && panels[panelIndex].size > maxsize) {
      delta = panels[panelIndex].size - maxsize;

      if (panelIndex === 0)
        resultDelta += this.resizePanel(panelIndex, -delta, panels);
      else
        resultDelta += this.resizePanel(panelIndex-1, delta, panels);
    };


    // Min and max for RIGHT panel
    minsize = this.getPanelMinSize(panelIndex+1, panels);
    maxsize = this.getPanelMaxSize(panelIndex+1, panels);

    // if we made the right panel too small
    if (panels[panelIndex+1].size < minsize) {
      delta = minsize - panels[panelIndex+1].size;

      if (panelIndex+1 === panels.length-1)
        resultDelta += this.resizePanel(panelIndex, -delta, panels);
      else
        resultDelta += this.resizePanel(panelIndex+1, delta, panels);
    };

    // if we made the right panel too big
    if (maxsize !== 0 && panels[panelIndex+1].size > maxsize) {
      delta = panels[panelIndex+1].size - maxsize;

      if (panelIndex+1 === panels.length-1)
        resultDelta += this.resizePanel(panelIndex, delta, panels);
      else
        resultDelta += this.resizePanel(panelIndex+1, -delta, panels);
    };

    // return how much this panel actually resized
    return resultDelta;
  },

  // Utility function for getting min pixel size of panel
  getPanelMinSize: function(panelIndex, panels) {
    if (panels[panelIndex].resize === "fixed") {
      if (!panels[panelIndex].fixedSize) {
        panels[panelIndex].fixedSize = panels[panelIndex].size;
      }
      return panels[panelIndex].fixedSize;
    }
    return panels[panelIndex].minSize;
  },

  // Utility function for getting max pixel size of panel
  getPanelMaxSize: function(panelIndex, panels) {
    if (panels[panelIndex].resize === "fixed") {
      if (!panels[panelIndex].fixedSize) {
        panels[panelIndex].fixedSize = panels[panelIndex].size;
      }
      return panels[panelIndex].fixedSize;
    }
    return 0;
  },

  // Utility function for getting min pixel size of the entire panel group
  getPanelGroupMinSize: function(spacing) {
    var size = 0;
    for (var i = 0; i < this.state.panels.length; i++) {
      size += this.getPanelMinSize(i, this.state.panels);
    }
    return size + ((this.state.panels.length-1) * spacing)
  },

  // Hard-set a panel's size
  // Used to recalculate a stretchy panel when the window is resized
  setPanelSize: function(panelIndex, size, callback) {
    size = this.props.direction === "column"? size.y : size.x;

    if (size !== this.state.panels[panelIndex].size){
      var tempPanels = this.state.panels;
      tempPanels[panelIndex].size = size;
      this.setState({panels:tempPanels});

      if (panelIndex > 0) {
        this.handleResize(panelIndex-1, {x:0, y:0});
      }
      else if (this.state.panels.length > 2) {
        this.handleResize(panelIndex+1, {x:0, y:0});
      }

      if (callback) {
        callback();
      }
    }
  },
})


var Panel = React.createClass({

  // Find the resizeObject if it has one
  componentDidMount: function() {
    if (this.props.resize === "stretch") {
      this.refs.resizeObject.addEventListener("load", () => this.onResizeObjectLoad());
      this.refs.resizeObject.data = "about:blank";
      this.calculateStretchWidth();
    }
  },

  // Attach resize event listener to resizeObject
  onResizeObjectLoad() {
    this.refs.resizeObject.contentDocument.defaultView.addEventListener(
    "resize", () => this.calculateStretchWidth());
  },

  // Utility function to wait for next render before executing a function
  onNextFrame: function(callback) {
    setTimeout(function () {
        window.requestAnimationFrame(callback)
    }, 0)
  },

  // Recalculate the stretchy panel if it's container has been resized
  calculateStretchWidth: function() {
    if (this.props.onWindowResize !== null) {
      var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();

      this.props.onWindowResize(
        this.props.panelID,
        {x:rect.width, y:rect.height},

        // recalcalculate again if the width is below minimum
        // Kinda hacky, but for large resizes like fullscreen/Restore
        // it can't solve it in one pass.
        function() {this.onNextFrame(this.calculateStretchWidth)}.bind(this)
      );
    }
  },

  // Render component
  render: function() {

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
    const resizeObject = this.props.resize === "stretch" ? <object style={style.resizeObject} ref="resizeObject" type="text/html"></object> : null;

    return (
      <div className="panelWrapper" style={this.props.style}>
        {resizeObject}
        {this.props.children}
      </div>
    )
  }
})


var Divider = React.createClass({

  getDefaultProps: function() {
    return {
      dividerWidth: 1,
      handleBleed: 4,
    };
  },

  getInitialState: function () {
    return {
      dragging: false,
      initPos: {x:null,y:null},
    }
  },

  // Add/remove event listeners based on drag state
  componentDidUpdate: function (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

  // Start drag state and set initial position
  onMouseDown: function (e) {

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
  },

  // End drag state
  onMouseUp: function (e) {
    this.setState({dragging: false})
    e.stopPropagation()
    e.preventDefault()
  },

  // Call resize handler if we're dragging
  onMouseMove: function (e) {
    if (!this.state.dragging) return

    var resultDelta = this.handleResize(
      this.props.panelID,
      {x: e.pageX - this.state.initPos.x, y: e.pageY - this.state.initPos.y}
    );

    // if we've resized the panel like intended, reset the initPos
    if (resultDelta !== 0) {
      this.setState({
        initPos: {
          x: e.pageX,
          y: e.pageY
        },
      })
    }

    e.stopPropagation()
    e.preventDefault()
  },

  // Handle resizing
  handleResize(i, delta) {
    return this.props.handleResize(i, delta);
  },

  // Utility functions for handle size provided how much bleed
  // we want outside of the actual divider div
  getHandleWidth: function() {
    return (this.props.dividerWidth + (this.props.handleBleed * 2));
  },
  getHandleOffset: function() {
    return (this.props.dividerWidth/2) - (this.getHandleWidth()/2);
  },

  // Render component
  render: function() {
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
        cursor: this.props.direction === "row" ? "ew-resize" : "ns-resize",
        zIndex: 100,
      }
    }
    Object.assign(style.divider, {backgroundColor: this.props.borderColor});

    return (
      <div className="divider" style={style.divider} onMouseDown={this.onMouseDown}>
        <div style={style.handle}></div>
      </div>
    );
  }
})


export default PanelGroup;
