import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import Component from 'src/PanelGroup'

describe('Component', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  it('PanelGroup renders', () => {
    render(<Component/>, node, () => {
      expect(node.innerHTML).toContain('')
    })
  })
})
