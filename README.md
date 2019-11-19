## [React-PanelGroup](https://danfessler.github.io/react-panelgroup/) [![Travis][build-badge]][build] [![PRs Welcome][pr-badge]][prwelcome]

A React component for resizable panel group layouts<br/>

Demo: [https://danfessler.github.io/react-panelgroup/](https://danfessler.github.io/react-panelgroup/)

[build-badge]: https://img.shields.io/travis/DanFessler/react-panelgroup/master.svg?style=flat
[build]: https://travis-ci.org/DanFessler/react-panelgroup
[pr-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[prwelcome]: CONTRIBUTING.md

## Features

* **Absolute & Relative Sizing**  
  Choose between absolute pixel sizing and relative weights to describe your layout. Even mix the two per panel for more complex layouts. Supports fixed-size, dynamic (absolute pixel), and stretchy (relative weights) resizing
* **Neighbor-Aware Resizing**  
  When a panel is resized beyond it's extents, it will begin to push or pull at it's neighbors recursively.
* **Column & Row Orientations**  
  Supports vertical and horizontal orientations. Nest them together to produce grid-like layouts
* **Snap points**  
  If supplied, panels can snap to pre-defined sizes

## Installation

```sh
$ npm install --save react-panelgroup
```

## Examples

### Defaults

When not specifying any props, the panel group defaults to a horizontal orientation with panels of equal (stretchy) widths. PanelGroup will always try to entirely fill it's container.

```jsx
<PanelGroup>
  <div>panel 1</div>
  <div>panel 2</div>
  <div>panel 3</div>
</PanelGroup>
```

### Column layout

Setting the direction prop to "column" will result in a vertical layout

```jsx
<PanelGroup direction="column">
  <div>panel 1</div>
  <div>panel 2</div>
  <div>panel 3</div>
</PanelGroup>
```

### Nested layout

Nest multiple panelGroups for more complex layouts

```jsx
<PanelGroup direction="row">
  <PanelGroup direction="column">
    <div>panel 1</div>
    <div>panel 2</div>
    <div>panel 3</div>
  </PanelGroup>
  <div>panel 4</div>
  <PanelGroup direction="column">
    <div>panel 5</div>
    <div>panel 6</div>
  </PanelGroup>
</PanelGroup>
```

### Defined panel sizes

Providing panelWidths with an array of objects defining each panel's size parameters will set the initial sizing for each panel. If any property is missing, it will resort to the default for that property.

```jsx
<PanelGroup
  panelWidths={[
    { size: 100, minSize: 50, resize: 'dynamic' },
    { minSize: 100, resize: 'stretch' },
    { size: 100, minSize: 50, resize: 'dynamic' }
  ]}
>
  <div>panel 1</div>
  <div>panel 2</div>
  <div>panel 3</div>
</PanelGroup>
```

## Component Props

* `spacing: number`<br/>
  sets the width of the border between each panel <br/><br/>
* `borderColor: Valid CSS color string`<br/>
  Optionally defines a border color for panel dividers. Defaults to "transparent" <br/><br/>
* `panelColor: Valid CSS color string`<br/>
  Optionally defines a background color for the panels. Defaults to "transparent" <br/><br/>
* `direction: [ "row" | "column" ]`<br/>
  Sets the orientation of the panel group <br/><br/>
* `panelWidths: [panelWidth, ...]`<br/>
  An array of panelWidth objects to initialize each panel with. If a property is missing, or an index is null, it will resort to default values <br/><br/>
* `panelWidth.size: number`<br/>
  Initial panel size. If panelWidth.resize is "fixed" or "dynamic" the size will be pixel units. If panelWidth.resize is "stretch" then it is treated as a relative weight: Defaults to 256<br/><br/>
* `panelWidth.minSize: number`<br/>
  minimum size of panel in pixels. Defaults to 48 <br/><br/>
* `panelWidth.maxSize: number`<br/>
  maximum size of panel in pixels. Defaults to 0 (No Max Width) <br/><br/>
* `panelWidth.resize: [ "fixed" | "dynamic" | "stretch" ]`<br/>
  Sets the resize behavior of the panel. Fixed cannot be resized. Defaults to "stretch" <br/><br/>
* `panelWidth.snap: [snapPoint, ...]`<br/>
  An array of positions to snap to per panel <br/><br/>
* `onUpdate: function()`<br/>
  Callback to receive state updates from PanelGroup to allow controlling state externally. Returns an array of panelWidths <br/><br/>
* `onResizeStart: function(panels)`<br/>
  Callback fired when resizing started, receives state of panels <br/><br/>
* `onResizeEnd: function(panels)`<br/>
  Callback fired when resizing ends, receives state <br/><br/>

## Contribute

### Prerequisites

[Node.js](http://nodejs.org/) >= v4 must be installed.

### Installation

* Running `npm install` in the components's root directory will install everything you need for development.

**NOTE** yarn does not work! It will yield phantomjs errors.

### Demo Development Server

* `npm start` will run a development server with the component's demo app at [http://localhost:3000](http://localhost:3000) with hot module reloading.

### Running Tests

* `npm test` will run the tests once.
* `npm run test:coverage` will run the tests and produce a coverage report in `coverage/`.
* `npm run test:watch` will run the tests on every change.

### Building

* `npm run build` will build the component for publishing to npm and also bundle the demo app.
* `npm run clean` will delete built resources.
