import React from 'react';
import PropTypes from 'prop-types';

import Panel from './Panel';
import Divider from './Divider';
import Debug from '../debug';

export { Divider, Panel };

const debug = Debug.spawn('PanelGroup');

export default class PanelGroup extends React.Component {
  static defaultProps = {
    spacing: 1,
    direction: 'row',
    panelWidths: [],
    onUpdate: undefined,
    panelColor: undefined,
    borderColor: undefined,
    showHandles: false
  };

  static propTypes = {
    spacing: PropTypes.number,
    direction: PropTypes.string,
    panelWidths: PropTypes.array,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    onUpdate: PropTypes.func,
    panelColor: PropTypes.string,
    borderColor: PropTypes.string,
    showHandles: PropTypes.bool
  };
  // Load initial panel configuration from props
  constructor(...args) {
    super(...args);

    this.state = this.loadPanels(this.props);
  }

  // reload panel configuration if props update
  componentWillReceiveProps(nextProps) {
    const nextPanels = nextProps.panelWidths;

    // Only update from props if we're supplying the props in the first place
    if (nextPanels.length) {
      // if the panel array is a different size we know to update
      if (this.state.panels.length !== nextPanels.length) {
        this.setState(this.loadPanels(nextProps));
      } else {
        // otherwise we need to iterate to spot any difference
        for (let i = 0; i < nextPanels.length; i++) {
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
  }
  defaultResize = (props, index, defaultResize) => {
    let resize = defaultResize;
    if (props.panelWidths[index].resize) {
      resize = props.panelWidths[index].resize; // eslint-disable-line
    } else {
      resize = props.panelWidths[index].size ? 'dynamic' : resize;
    }
    return resize;
  };
  // load provided props into state
  loadPanels = (props) => {
    const panels = [];

    if (props.children) {
      // Default values if none were provided
      const defaultSize = 256;
      const defaultMinSize = 48;
      const defaultResize = 'stretch';

      let stretchIncluded = false;
      const children = React.Children.toArray(props.children);

      for (let i = 0; i < children.length; i++) {
        if (i < props.panelWidths.length && props.panelWidths[i]) {
          const widthObj = {
            size: props.panelWidths[i].size !== undefined ? props.panelWidths[i].size : defaultSize,
            minSize:
              props.panelWidths[i].minSize !== undefined
                ? props.panelWidths[i].minSize
                : defaultMinSize,
            resize: this.defaultResize(props, i, defaultResize),
            snap: props.panelWidths[i].snap !== undefined ? props.panelWidths[i].snap : [],
            style: {
              // making the ability to not have to be so terse for style settings on panel
              ...this.getPanelClass().defaultProps.style,
              ...(props.panelWidths[i].style || {})
            }
          };
          panels.push(widthObj);
        } else {
          // default values if no props are given
          panels.push({
            size: defaultSize,
            resize: defaultResize,
            minSize: defaultMinSize,
            snap: [],
            style: {}
          });
        }

        // if none of the panels included was stretchy, make the last one stretchy
        if (panels[i].resize === 'stretch') stretchIncluded = true;
        if (!stretchIncluded && i === children.length - 1) panels[i].resize = 'stretch';
      }
    }

    return {
      panels
    };
  };

  // Pass internal state out if there's a callback for it
  // Useful for saving panel configuration
  onUpdate = (panels) => {
    if (this.props.onUpdate) {
      this.props.onUpdate(panels.slice());
    }
  };

  // For styling, track which direction to apply sizing to
  getSizeDirection = (caps) => {
    if (caps) {
      return this.props.direction === 'column' ? 'Height' : 'Width';
    }
    return this.props.direction === 'column' ? 'height' : 'width';
  };

  getStyle() {
    const container = {
      width: '100%',
      height: '100%',
      [`min${this.getSizeDirection(true)}`]: this.getPanelGroupMinSize(this.props.spacing),
      display: 'flex',
      flexDirection: this.props.direction,
      flexGrow: 1
    };

    return {
      container,
      panel: {
        flexGrow: 0,
        display: 'flex'
      }
    };
  }

  getPanelStyle(index) {
    const { direction, panelColor } = this.props;

    const panel = this.state.panels[index];
    const { style } = panel;

    // setting up the style for this panel.  Should probably be handled
    // in the child component, but this was easier for now
    let newPanelStyle = {
      [this.getSizeDirection()]: panel.size,
      [direction === 'row' ? 'height' : 'width']: '100%',
      [`min${this.getSizeDirection(true)}`]: panel.resize === 'stretch' ? 0 : panel.size,

      flexGrow: panel.resize === 'stretch' ? 1 : 0,
      flexShrink: panel.resize === 'stretch' ? 1 : 0,
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
      ...style
    };
    if (panelColor !== null) {
      // patch in the background color if it was supplied as a prop
      newPanelStyle = {
        ...newPanelStyle,
        backgroundColor: panelColor
      };
    }

    return newPanelStyle;
  }

  createPanelProps({ panelStyle, index, initialChildren }) {
    const panelState = this.state.panels[index];
    let stretchIncluded = false;
    // give position info to children
    const metadata = {
      isFirst: index === 0,
      isLast: index === initialChildren.length - 1,
      resize: panelState.resize,

      // window resize handler if this panel is stretchy
      onWindowResize: panelState.resize === 'stretch' ? this.setPanelSize : null
    };

    // if none of the panels included was stretchy, make the last one stretchy
    if (panelState.resize === 'stretch') stretchIncluded = true;
    if (!stretchIncluded && metadata.isLast) metadata.resize = 'stretch';

    return {
      style: panelStyle,
      key: index,
      panelID: index,
      ...metadata
    };
  }

  createPanel({ panelStyle, index, initialChildren }) {
    const Klass = this.getPanelClass();
    return (
      <Klass {...this.createPanelProps({ panelStyle, index, initialChildren })}>
        {initialChildren[index]}
      </Klass>
    );
  }
  // eslint-disable-next-line class-methods-use-this
  getPanelClass() {
    // mainly for accessing default props of panels
    return Panel;
  }

  maybeDivide({ initialChildren, newChildren, index }) {
    // add a handle between panels
    if (index < initialChildren.length - 1) {
      newChildren.push(
        <Divider
          borderColor={this.props.borderColor}
          key={`divider${index}`}
          panelID={index}
          handleResize={this.handleResize}
          dividerWidth={this.props.spacing}
          direction={this.props.direction}
          showHandles={this.props.showHandles}
        />
      );
    }
  }

  // Entry point for resizing panels.
  // We clone the panel array and perform operations on it so we can
  // setState after the recursive operations are finished
  handleResize = (i, delta) => {
    const tempPanels = this.state.panels.slice();
    const returnDelta = this.resizePanel(
      i,
      this.props.direction === 'row' ? delta.x : delta.y,
      tempPanels
    );
    this.setState({ panels: tempPanels });
    this.onUpdate(tempPanels);
    return returnDelta;
  };

  // Recursive panel resizing so we can push other panels out of the way
  // if we've exceeded the target panel's extents
  resizePanel = (panelIndex, delta, panels) => {
    // 1) first let's calculate and make sure all the sizes add up to be correct.
    let masterSize = 0;
    for (let iti = 0; iti < panels.length; iti += 1) {
      masterSize += panels[iti].size;
    }
    const boundingRect = this.node.getBoundingClientRect();
    const boundingSize =
      (this.props.direction === 'column' ? boundingRect.height : boundingRect.width) -
      this.props.spacing * (this.props.children.length - 1);
    if (masterSize !== boundingSize) {
      debug(() => ({ panels }));
      debug(() => `ERROR! SIZES DON'T MATCH!: ${masterSize}, ${boundingSize}`);
      // 2) Rectify the situation by adding all the unacounted for space to the first panel
      panels[panelIndex].size += boundingSize - masterSize;
    }

    let minsize;
    let maxsize;

    // track the progressive delta so we can report back how much this panel
    // actually moved after all the adjustments have been made
    let resultDelta = delta;

    // make the changes and deal with the consequences later
    panels[panelIndex].size += delta;
    panels[panelIndex + 1].size -= delta;

    // Min and max for LEFT panel
    minsize = this.getPanelMinSize(panelIndex, panels);
    maxsize = this.getPanelMaxSize(panelIndex, panels);

    // if we made the left panel too small
    if (panels[panelIndex].size < minsize) {
      delta = minsize - panels[panelIndex].size;

      if (panelIndex === 0) {
        resultDelta = this.resizePanel(panelIndex, delta, panels);
      } else {
        resultDelta = this.resizePanel(panelIndex - 1, -delta, panels);
      }
    }

    // if we made the left panel too big
    if (maxsize !== 0 && panels[panelIndex].size > maxsize) {
      delta = panels[panelIndex].size - maxsize;

      if (panelIndex === 0) {
        resultDelta = this.resizePanel(panelIndex, -delta, panels);
      } else {
        resultDelta = this.resizePanel(panelIndex - 1, delta, panels);
      }
    }

    // Min and max for RIGHT panel
    minsize = this.getPanelMinSize(panelIndex + 1, panels);
    maxsize = this.getPanelMaxSize(panelIndex + 1, panels);

    // if we made the right panel too small
    if (panels[panelIndex + 1].size < minsize) {
      delta = minsize - panels[panelIndex + 1].size;

      if (panelIndex + 1 === panels.length - 1) {
        resultDelta = this.resizePanel(panelIndex, -delta, panels);
      } else {
        resultDelta = this.resizePanel(panelIndex + 1, delta, panels);
      }
    }

    // if we made the right panel too big
    if (maxsize !== 0 && panels[panelIndex + 1].size > maxsize) {
      delta = panels[panelIndex + 1].size - maxsize;

      if (panelIndex + 1 === panels.length - 1) {
        resultDelta = this.resizePanel(panelIndex, delta, panels);
      } else {
        resultDelta = this.resizePanel(panelIndex + 1, -delta, panels);
      }
    }

    // Iterate through left panel's snap positions
    for (let i = 0; i < panels[panelIndex].snap.length; i++) {
      if (Math.abs(panels[panelIndex].snap[i] - panels[panelIndex].size) < 20) {
        delta = panels[panelIndex].snap[i] - panels[panelIndex].size;

        if (
          delta !== 0 &&
          panels[panelIndex].size + delta >= this.getPanelMinSize(panelIndex, panels) &&
          panels[panelIndex + 1].size - delta >= this.getPanelMinSize(panelIndex + 1, panels)
        ) {
          resultDelta = this.resizePanel(panelIndex, delta, panels);
        }
      }
    }

    // Iterate through right panel's snap positions
    for (let i = 0; i < panels[panelIndex + 1].snap.length; i++) {
      if (Math.abs(panels[panelIndex + 1].snap[i] - panels[panelIndex + 1].size) < 20) {
        delta = panels[panelIndex + 1].snap[i] - panels[panelIndex + 1].size;

        if (
          delta !== 0 &&
          panels[panelIndex].size + delta >= this.getPanelMinSize(panelIndex, panels) &&
          panels[panelIndex + 1].size - delta >= this.getPanelMinSize(panelIndex + 1, panels)
        ) {
          resultDelta = this.resizePanel(panelIndex, -delta, panels);
        }
      }
    }

    // return how much this panel actually resized
    return resultDelta;
  };

  // Utility function for getting min pixel size of panel
  getPanelMinSize = (panelIndex, panels) => {
    if (panels[panelIndex].resize === 'fixed') {
      if (!panels[panelIndex].fixedSize) {
        panels[panelIndex].fixedSize = panels[panelIndex].size;
      }
      return panels[panelIndex].fixedSize;
    }
    return panels[panelIndex].minSize;
  };

  // Utility function for getting max pixel size of panel
  getPanelMaxSize = (panelIndex, panels) => {
    if (panels[panelIndex].resize === 'fixed') {
      if (!panels[panelIndex].fixedSize) {
        panels[panelIndex].fixedSize = panels[panelIndex].size;
      }
      return panels[panelIndex].fixedSize;
    }
    return 0;
  };

  // Utility function for getting min pixel size of the entire panel group
  getPanelGroupMinSize = (spacing) => {
    let size = 0;
    for (let i = 0; i < this.state.panels.length; i++) {
      size += this.getPanelMinSize(i, this.state.panels);
    }
    return size + (this.state.panels.length - 1) * spacing;
  };

  // Hard-set a panel's size
  // Used to recalculate a stretchy panel when the window is resized
  setPanelSize = (panelIndex, size, callback, node) => {
    if (!this.node && node) {
      // due to timing child elements may have parent node first!
      this.node = node;
    }
    size = this.props.direction === 'column' ? size.y : size.x;
    if (size !== this.state.panels[panelIndex].size) {
      const tempPanels = this.state.panels;
      // make sure we can actually resize this panel this small
      if (size < tempPanels[panelIndex].minSize) {
        let diff = tempPanels[panelIndex].minSize - size;
        tempPanels[panelIndex].size = tempPanels[panelIndex].minSize;

        // 1) Find all of the dynamic panels that we can resize and
        // decrease them until the difference is gone
        for (let i = 0; i < tempPanels.length; i += 1) {
          if (i !== panelIndex && tempPanels[i].resize === 'dynamic') {
            const available = tempPanels[i].size - tempPanels[i].minSize;
            const cut = Math.min(diff, available);
            tempPanels[i].size -= cut;
            // if the difference is gone then we are done!
            diff -= cut;
            if (diff === 0) {
              break;
            }
          }
        }
      } else {
        tempPanels[panelIndex].size = size;
      }
      this.setState({ panels: tempPanels });

      if (panelIndex > 0) {
        this.handleResize(panelIndex - 1, { x: 0, y: 0 });
      } else if (this.state.panels.length > 2) {
        this.handleResize(panelIndex + 1, { x: 0, y: 0 });
      }

      if (callback) {
        callback();
      }
    }
  };

  render() {
    const { children } = this.props;

    const style = this.getStyle();

    // lets build up a new children array with added resize borders
    const initialChildren = React.Children.toArray(children);
    const newChildren = [];

    for (let i = 0; i < initialChildren.length; i++) {
      const panelStyle = this.getPanelStyle(i);
      const newPanel = this.createPanel({ panelStyle, index: i, initialChildren });
      newChildren.push(newPanel);
      this.maybeDivide({ initialChildren, newChildren, index: i });
    }

    return (
      <div
        className="panelGroup"
        style={style.container}
        ref={(node) => {
          this.node = node;
        }}
      >
        {newChildren}
      </div>
    );
  }
}

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
  // Find the resizeObject if it has one
  componentDidMount() {
    if (this.props.resize === 'stretch') {
      this.refs.resizeObject.addEventListener('load', () => this.onResizeObjectLoad());
      this.refs.resizeObject.data = 'about:blank';
      this.calculateStretchWidth();
    }
  }

  // Attach resize event listener to resizeObject
  onResizeObjectLoad = () => {
    this.refs.resizeObject.contentDocument.defaultView.addEventListener('resize', () =>
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
      <object aria-label="panel" style={style.resizeObject} ref="resizeObject" type="text/html" />
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
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  // Start drag state and set initial position
  onMouseDown = (e) => {
    // only left mouse button
    if (e.button !== 0) return;

    this.setState({
      dragging: true,
      initPos: {
        x: e.pageX,
        y: e.pageY
      }
    });

    e.stopPropagation();
    e.preventDefault();
  };

  // End drag state
  onMouseUp = (e) => {
    this.setState({ dragging: false });
    e.stopPropagation();
    e.preventDefault();
  };

  // Call resize handler if we're dragging
  onMouseMove = (e) => {
    if (!this.state.dragging) return;

    const initDelta = {
      x: e.pageX - this.state.initPos.x,
      y: e.pageY - this.state.initPos.y
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
          x: e.pageX + (expectedDelta ? 0 : resultDelta * flowMask.x),
          y: e.pageY + (expectedDelta ? 0 : resultDelta * flowMask.y)
        }
      });
    }

    e.stopPropagation();
    e.preventDefault();
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
      <div className={className} style={style.divider} onMouseDown={this.onMouseDown}>
        <div style={style.handle} />
      </div>
    );
  }
}
