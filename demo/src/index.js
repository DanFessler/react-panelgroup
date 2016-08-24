import React from 'react'
import {render} from 'react-dom'

import PanelGroup from '../../src/PanelGroup'

let Demo = React.createClass({
  render() {
    var containerStyle = {
      height: 480,
      border: "2px solid grey",
      borderRadius: 8,
    }
    return (
      <div>
        <h1>React-PanelGroup Demo</h1>
        <div style={containerStyle}>
          <PanelGroup borderColor="grey">
            <PanelGroup direction="column" borderColor="grey">
              <Content>Panel 1</Content>
              <Content>Panel 2</Content>
              <Content>Panel 3</Content>
            </PanelGroup>
            <Content>Panel 4</Content>
            <PanelGroup direction="column" borderColor="grey">
              <Content>Panel 5</Content>
              <Content>Panel 6</Content>
            </PanelGroup>
          </PanelGroup>
        </div>
      </div>
    )
  }
})

let Content = function(props) {
  return(
    <div style={{padding: 8}}>
      {props.children}
    </div>
  )
}

render(<Demo/>, document.querySelector('#demo'))
