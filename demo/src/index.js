import React from 'react'
import {render} from 'react-dom'

import PanelGroup from '../../src/PanelGroup'

var code1 =
`<PanelGroup borderColor="grey">
  <Content>panel 1</Content>
  <Content>panel 2</Content>
  <Content>panel 3</Content>
</PanelGroup>`;

var code2 =
`<PanelGroup direction="column" borderColor="grey">
  <Content>panel 1</Content>
  <Content>panel 2</Content>
  <Content>panel 3</Content>
</PanelGroup>`;

var code3 =
`<PanelGroup direction="row" borderColor="grey">
  <PanelGroup direction="column" borderColor="grey">
    <Content>panel 1</Content>
    <Content>panel 2</Content>
    <Content>panel 3</Content>
  </PanelGroup>
  <Content>panel 4</Content>
  <PanelGroup direction="column" borderColor="grey">
    <Content>panel 5</Content>
    <Content>panel 6</Content>
  </PanelGroup>
</PanelGroup>`;

var code4 =
`<PanelGroup borderColor="grey" panelWidths={[
  {size: 100, minSize:50, resize: "dynamic"},
  {minSize:100, resize: "stretch"},
  {size: 100, minSize:50, resize: "dynamic"}
]}>
  <Content>panel 1</Content>
  <Content>panel 2</Content>
  <Content>panel 3</Content>
</PanelGroup>`;

let Demo = React.createClass({
  render() {
    var containerStyle = {
      width: 640,
      height: 320,
      flexGrow: 1,
      flexShrink: 1,
    }
    var rowStyle = {
      display: "flex",
      marginBottom: 32,
      border: "1px solid grey",
      borderRadius: 8,
      overflow: "hidden"
    }
    var codeStyle = {
      flexGrow: 0,
      flexShrink: 0,
      width: 420,
      margin: 0, padding: 16,
      backgroundColor: "#DDD",
      overflowY: "auto",
      borderRight: "1px solid grey",
    }
    return (
      <div style={{padding: "0 16px"}}>
        <h1>React-PanelGroup Demo</h1>

        <h2 style={{marginBottom:4}}>Default Values</h2>
        <div style={rowStyle}>
          <pre style={codeStyle}>
            {code1}
          </pre>
          <div style={containerStyle}>
            <DefaultLayout />
          </div>
        </div>

        <h2 style={{marginBottom:4}}>Column layout</h2>
        <div style={rowStyle}>
          <pre style={codeStyle}>
            {code2}
          </pre>
          <div style={containerStyle}>
            <ColumnLayout />
          </div>
        </div>

        <h2 style={{marginBottom:4}}>Nested layout</h2>
        <div style={rowStyle}>
          <pre style={codeStyle}>
            {code3}
          </pre>
          <div style={containerStyle}>
            <NestedLayout />
          </div>
        </div>

        <h2 style={{marginBottom:4}}>Defined panel sizes</h2>
        <div style={rowStyle}>
          <pre style={codeStyle}>
            {code4}
          </pre>
          <div style={containerStyle}>
            <DefinedLayout />
          </div>
        </div>
      </div>
    )
  }
})

let DefaultLayout = function(props) {
  return (
    <PanelGroup borderColor="#DDD" spacing={2}>
      <Content>panel 1</Content>
      <Content>panel 2</Content>
      <Content>panel 3</Content>
    </PanelGroup>
  )
}

let ColumnLayout = function(props) {
  return (
    <PanelGroup direction="column" borderColor="#DDD" spacing={2}>
      <Content>panel 1</Content>
      <Content>panel 2</Content>
      <Content>panel 3</Content>
    </PanelGroup>
  )
}

let NestedLayout = function(props) {
  var containerStyle = {
    width: "100%",
    height: "100%",
    flexGrow: 1,
    flexShrink: 1,
  }
  return (
    <PanelGroup direction="row" borderColor="#DDD" spacing={2}>
      <PanelGroup direction="column" borderColor="#DDD" spacing={2}>
        <Content>panel 1</Content>
        <Content>panel 2</Content>
        <Content>panel 3</Content>
      </PanelGroup>
      <Content>panel 4</Content>
      <PanelGroup direction="column" borderColor="#DDD" spacing={2}>
        <Content>panel 5</Content>
        <Content>panel 6</Content>
      </PanelGroup>
    </PanelGroup>
  )
}

let DefinedLayout = function(props) {
  return (
    <PanelGroup borderColor="#DDD" spacing={2} panelWidths={[
      {size: 100, minSize:50, resize: "dynamic", snap: [100, 200]},
      {minSize:100, resize: "stretch"},
      {size: 100, minSize:50, resize: "dynamic"}
    ]}>
      <Content>panel 1</Content>
      <Content>panel 2</Content>
      <Content>panel 3</Content>
    </PanelGroup>
  )
}

let Content = function(props) {
  return(
    <div style={{padding: 8}}>
      {props.children}
    </div>
  )
}

render(<Demo/>, document.querySelector('#demo'))
