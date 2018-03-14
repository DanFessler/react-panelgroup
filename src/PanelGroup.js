import React from 'react';
import ReactDOM from 'react-dom';

import Panel from './Panel';
import Divider from './Divider';

class PanelGroup extends React.Component {

  // Load initial panel configuration from props
  constructor () {
    super(...arguments);

    this.state = this.loadPanels(this.props)
  }

  // reload panel configuration if props update
  componentWillReceiveProps (nextProps) {

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
            this.state.panels[i].maxSize !== nextPanels[i].maxSize ||
            this.state.panels[i].resize !== nextPanels[i].resize
          ) {
            this.setState(this.loadPanels(nextProps));
            break;
          }
        }
      }

    }

  }

  // load provided props into state
  loadPanels = (props) => {
    var panels = []

    if (props.children) {

      // Default values if none were provided
      var defaultSize = 256;
      var defaultMinSize = 48;
      var defaultMaxSize = 0;
      var defaultResize = "stretch";

      var stretchIncluded = false;
      var children = React.Children.toArray(props.children);

      for (var i=0; i<children.length; i++) {

        if (i < props.panelWidths.length && props.panelWidths[i]) {
          var widthObj = {
            size:    props.panelWidths[i].size !== undefined ? props.panelWidths[i].size : defaultSize,
            minSize: props.panelWidths[i].minSize !== undefined ? props.panelWidths[i].minSize : defaultMinSize,
            maxSize: props.panelWidths[i].maxSize !== undefined ? props.panelWidths[i].maxSize : defaultMaxSize,
            resize:  props.panelWidths[i].resize? props.panelWidths[i].resize :
                     props.panelWidths[i].size? "dynamic" : defaultResize,
            snap:    props.panelWidths[i].snap !== undefined ? props.panelWidths[i].snap : []
          }
          panels.push(widthObj);
        } else {
          // default values if no props are given
          panels.push({size: defaultSize, resize: defaultResize, minSize: defaultMinSize, maxSize: defaultMaxSize, snap:[]})
        }

        // if none of the panels included was stretchy, make the last one stretchy
        if (panels[i].resize === "stretch") stretchIncluded = true;
        if (!stretchIncluded && i === children.length-1) panels[i].resize = "stretch";
      }
    }

    return {
      panels: panels
    }
  };

  // Pass internal state out if there's a callback for it
  // Useful for saving panel configuration
  onUpdate = (panels, isComplete) => {
    if (this.props.onUpdate) {
      this.props.onUpdate(panels.slice(), !!isComplete)
    }
  };

  // For styling, track which direction to apply sizing to
  getSizeDirection = (caps) => {
    if (caps)
      return this.props.direction === "column" ? "Height" : "Width";
    else
      return this.props.direction === "column" ? "height" : "width";
  };

  // Render component
  render () {

    var style = {
      container: {
        width: "100%",
        height: "100%",
        ["min" + this.getSizeDirection(true)]: this.getPanelGroupMinSize(this.props.spacing),
        // Don't set max width, since max size is typically 0 [PDF 2018/03/13]
        // ["max"+this.getSizeDirection(true)]: this.getPanelGroupMaxSize(this.props.spacing),
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
        newChildren.push(<Divider borderColor={this.props.borderColor} key={"divider"+i} panelID={i} handleResize={this.handleResize} onResizeComplete={this.onResizeComplete} dividerWidth={this.props.spacing} direction={this.props.direction} showHandles={this.props.showHandles}/>);
      }
    }

    return <div className="panelGroup" style={style.container}>{newChildren}</div>
  }

  // Entry point for resizing panels.
  // We clone the panel array and perform operations on it so we can
  // setState after the recursive operations are finished
  handleResize = (i, delta) => {
    var tempPanels = this.state.panels.slice();
    var returnDelta = this.resizePanel(i, this.props.direction === "row" ? delta.x : delta.y, tempPanels);
    this.setState({panels: tempPanels});
    this.onUpdate(tempPanels)
    return returnDelta;
  };

  onResizeComplete = (i) => {
    var tempPanels = this.state.panels.slice();
    
    tempPanels[i].updated = true;
    this.onUpdate(tempPanels, true);
  }

  // Recursive panel resizing so we can push other panels out of the way
  // if we've exceeded the target panel's extents
  resizePanel = (panelIndex, delta, panels) => {

    // 1) first let's calculate and make sure all the sizes add up to be correct.
    let masterSize = 0
    for (let iti = 0; iti < panels.length; iti += 1) {
      masterSize += panels[iti].size
    }
    let boundingRect =  ReactDOM.findDOMNode(this).getBoundingClientRect();
    let boundingSize = (this.props.direction == "column" ? boundingRect.height : boundingRect.width) - (this.props.spacing * (this.props.children.length - 1))
    if (masterSize != boundingSize) {
      console.log(panels[0], panels[1])
      console.log("ERROR! SIZES DON'T MATCH!: ", masterSize, boundingSize)
      // 2) Rectify the situation by adding all the unacounted for space to the first panel
      panels[panelIndex].size += boundingSize - masterSize
    }

    var minsize;
    var maxsize;

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
      let delta = minsize - panels[panelIndex].size;

      if (panelIndex === 0)
        resultDelta = this.resizePanel(panelIndex, delta, panels);
      else
        resultDelta = this.resizePanel(panelIndex-1, -delta, panels);
    };

    // if we made the left panel too big
    if (maxsize !== 0 && panels[panelIndex].size > maxsize) {
      let delta = panels[panelIndex].size - maxsize;

      if (panelIndex === 0)
        resultDelta = this.resizePanel(panelIndex, -delta, panels);
      else
        resultDelta = this.resizePanel(panelIndex-1, delta, panels);
    };


    // Min and max for RIGHT panel
    minsize = this.getPanelMinSize(panelIndex+1, panels);
    maxsize = this.getPanelMaxSize(panelIndex+1, panels);

    // if we made the right panel too small
    if (panels[panelIndex+1].size < minsize) {
      let delta = minsize - panels[panelIndex+1].size;

      if (panelIndex+1 === panels.length-1)
        resultDelta = this.resizePanel(panelIndex, -delta, panels);
      else
        resultDelta = this.resizePanel(panelIndex+1, delta, panels);
    };

    // if we made the right panel too big
    if (maxsize !== 0 && panels[panelIndex+1].size > maxsize) {
      let delta = panels[panelIndex+1].size - maxsize;

      if (panelIndex+1 === panels.length-1)
        resultDelta = this.resizePanel(panelIndex, delta, panels);
      else
        resultDelta = this.resizePanel(panelIndex+1, -delta, panels);
    };

    // Iterate through left panel's snap positions
    for (let i=0; i<panels[panelIndex].snap.length; i++) {
      if (Math.abs(panels[panelIndex].snap[i] - panels[panelIndex].size) < 20) {

        let delta = panels[panelIndex].snap[i] - panels[panelIndex].size;

        if (
          delta !== 0 &&
          panels[panelIndex].size  +  delta >= this.getPanelMinSize(panelIndex, panels) &&
          panels[panelIndex+1].size - delta >= this.getPanelMinSize(panelIndex+1, panels)
        )
          resultDelta = this.resizePanel(panelIndex, delta, panels);
      }
    }

    // Iterate through right panel's snap positions
    for (let i=0; i<panels[panelIndex+1].snap.length; i++) {
      if (Math.abs(panels[panelIndex+1].snap[i] - panels[panelIndex+1].size) < 20) {

        let delta = panels[panelIndex+1].snap[i] - panels[panelIndex+1].size;

        if (
          delta !== 0 &&
          panels[panelIndex].size  +  delta >= this.getPanelMinSize(panelIndex, panels) &&
          panels[panelIndex+1].size - delta >= this.getPanelMinSize(panelIndex+1, panels)
        )
          resultDelta = this.resizePanel(panelIndex, -delta, panels);
      }
    }

    // return how much this panel actually resized
    return resultDelta;
  };

  // Utility function for getting min pixel size of panel
  getPanelMinSize = (panelIndex, panels) => {
    if (panels[panelIndex].resize === "fixed") {
      if (!panels[panelIndex].fixedSize) {
        panels[panelIndex].fixedSize = panels[panelIndex].size;
      }
      return panels[panelIndex].fixedSize;
    }
    return panels[panelIndex].minSize;
  };

  // Utility function for getting max pixel size of panel
  getPanelMaxSize = (panelIndex, panels) => {
    if (panels[panelIndex].resize === "fixed") {
      if (!panels[panelIndex].fixedSize) {
        panels[panelIndex].fixedSize = panels[panelIndex].size;
      }
      return panels[panelIndex].fixedSize;
    }
    return panels[panelIndex].maxSize;
  };

  // Utility function for getting min pixel size of the entire panel group
  getPanelGroupMinSize = (spacing) => {
    var size = 0;
    for (var i = 0; i < this.state.panels.length; i++) {
      size += this.getPanelMinSize(i, this.state.panels);
    }
    return size + ((this.state.panels.length-1) * spacing)
  };

  // Utility function for getting max pixel size of the entire panel group
  getPanelGroupMaxSize = (spacing) => {
    var size = 0;
    for (var i = 0; i < this.state.panels.length; i++) {
      size += this.getPanelMaxSize(i, this.state.panels);
    }
    return size + ((this.state.panels.length-1) * spacing)
  };

  // Hard-set a panel's size
  // Used to recalculate a stretchy panel when the window is resized
  setPanelSize = (panelIndex, size, callback) => {
    size = this.props.direction === "column"? size.y : size.x;
    if (size !== this.state.panels[panelIndex].size){
      var tempPanels = this.state.panels;
      //make sure we can actually resize this panel this small
      if (size < tempPanels[panelIndex].minSize) {
        let diff = tempPanels[panelIndex].minSize - size
        tempPanels[panelIndex].size = tempPanels[panelIndex].minSize

        // 1) Find all of the dynamic panels that we can resize and
        // decrease them until the difference is gone
        for (let i = 0; i < tempPanels.length; i = i + 1) {
          if (i != panelIndex && tempPanels[i].resize === "dynamic") {
            let available = tempPanels[i].size - tempPanels[i].minSize
            let cut = Math.min(diff, available)
            tempPanels[i].size = tempPanels[i].size - cut
            // if the difference is gone then we are done!
            diff = diff - cut
            if (diff == 0) {
              break
            }
          }
        }
      } else {
        tempPanels[panelIndex].size = size
      }
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
  };
}

PanelGroup.defaultProps = {
  spacing: 1,
  direction: "row",
  panelWidths: []
};

export default PanelGroup;
