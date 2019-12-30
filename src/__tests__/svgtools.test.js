import React from 'react';
import { mount } from '../enzyme';
import { ToolTipSvg } from '../svgtools'

describe('svgtool tests', () => {
  test('Render a tooltip, check text and coordinates', () => {
    const wrapper = mount(<svg>
     <ToolTipSvg 
     key='tooltip1' width={120} height={50}
     viewBox='0 0 300 200'
     tooltip={{bounds: [[100,100], [120,120]], 
     data: 11, feature: {properties: {NAME: 'blah!'}}
     }} 
     />
    </svg>) 
    /* console.log(wrapper.debug()) */
    expect(wrapper.text()).toEqual('blah! Data: 11')
    expect(wrapper.find('foreignObject').length).toEqual(1)
    expect(wrapper.containsAllMatchingElements([
      <rect x={60} y={40} /> 
    ]))
  });

  test('Render a tooltip with custom rounding', () => {
    const wrapper = mount(<svg>
     <ToolTipSvg 
     key='tooltip1' width={120} height={50}
     viewBox='0 0 300 200'
     tooltip_round={(n) => Math.round(n*100)/100}
     tooltip={{bounds: [[100,100], [120,120]], 
     data: 1.937, feature: {properties: {NAME: 'Decimal'}}
     }} 
     />
    </svg>) 
    /* console.log(wrapper.debug()) */
    expect(wrapper.text()).toEqual('Decimal Data: 1.94')
    expect(wrapper.find('foreignObject').length).toEqual(1)
    expect(wrapper.containsAllMatchingElements([
      <rect x={60} y={40} /> 
    ]))
  });



  test('Render a tooltip out of bounds and check correction', () => {
    const wrapper = mount(<svg>
     <ToolTipSvg 
     key='tooltip1' width={120} height={50}
     viewBox='0 0 300 200'
     tooltip={{bounds: [[280,10], [290,20]], 
     data: 11, feature: {properties: {NAME: 'blah!'}}
     }} 
     />
    </svg>) 
    /* console.log(wrapper.debug()) */
    expect(wrapper.text()).toEqual('blah! Data: 11')
    expect(wrapper.find('foreignObject').length).toEqual(1)
    expect(wrapper.containsAllMatchingElements([
      <rect x={140} y={40} /> 
    ]))
  });

  test('Render a tooltip with custom data key', () => {
    const wrapper = mount(<svg>
     <ToolTipSvg 
     key='tooltip1' width={120} height={50}
     tooltipkey='abrev'
     viewBox='0 0 300 200'
     tooltip={{bounds: [[280,10], [290,20]], 
     data: 11, feature: {properties: {NAME: 'blah!', abrev: 'tk421'}}
     }} 
     />
    </svg>) 
    /* console.log(wrapper.debug()) */
    expect(wrapper.text()).toEqual('tk421 Data: 11')
    expect(wrapper.find('foreignObject').length).toEqual(1)
    expect(wrapper.containsAllMatchingElements([
      <rect x={140} y={40} /> 
    ]))
  });


})


