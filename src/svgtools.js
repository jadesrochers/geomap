/** @jsx jsx */
import React from 'react';
import * as R from 'ramda';
import { jsx } from "@emotion/core";

const getXY = (viewarr, bounds, width, height, scale) => {
  let x = (bounds[1][0] + bounds[0][0])/2 - width/2
  let y = (bounds[0][1]) - (height + 10)
  let scaleInv = 1/scale
  if(y < viewarr[1]){
    y = bounds[1][1] + 20
  }
  if(x + width > viewarr[2]){
    x = bounds[0][0] - width - 20
    y = (bounds[1][1] + bounds[0][1])/2 - height/2
  }
  if(x + width < viewarr[0]){
    x = bounds[1][0] + 20
    y = (bounds[1][1] + bounds[0][1])/2 - height/2
  }
  // Seems like this should not work, (width for x, height for y)
  // but it does work.
  x = x  + (height - height*scale)
  y = y  + (height - height*scale) 
  return {x, y}
}
// It is a tooltip that uses a <rect> and two <text> elements
// to pop up a display for any shape rendered.
// uses information about bounding area to relocate the tooltip
// if it is out of bounds.
// Takes configuring arguments for the rect and text elements.
// These are tooltiprectstyle and tooltipstyle
// props.scale is used to scale the tooltip if there is zoom in/out.
const ToolTipSvg = (props) => {
  if(! props.tooltip){return null} 
  const bounds = props.tooltip.bounds
  const viewarr = R.map(parseInt, R.split(' ',props.viewBox))

  const data = (R.isEmpty(props.tooltip.data) || R.isNil(props.tooltip.data)) ? 'No Value' : (props.tooltip_round ? props.tooltip_round(props.tooltip.data) : Math.round(props.tooltip.data))
  const featprops = props.tooltip.feature.properties
  /* console.log('Foreignobject featprops: ', featprops) */
  /* console.log('Foreignobject props: ', props) */
  const defaultname = featprops.NAME ? 'NAME' : 'name'
  const textstyle = {display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'black', fontSize: '2.0rem', height: props.height, width: props.width}
  const name = props.tooltipkey ? props.tooltipkey : defaultname
  const toolstyle = (props.tooltipstyle ? props.tooltipstyle : undefined) 
  const scale = props.scale ? 1/props.scale : 1

  const { x, y } = getXY(viewarr, bounds, props.width, props.height, scale)

  const defaultstyle = {fill: '#b0b0b0', fillOpacity: 0.7}
  return(
   <svg x={x} y={y} width={props.width} height={props.height} id='tooltipwhole'  >
     <rect transform={`scale(${scale})`}
      css={(props.tooltiprectstyle ? props.tooltiprectstyle : defaultstyle)}
      width={props.width} height={props.height}
      />
     <text x={'50%'} y={'35%'} dominantBaseline={'middle'} textAnchor={'middle'} css={[ textstyle, toolstyle ]} transform={`scale(${scale})`}
>
       {featprops[name]}
     </text>
     <text x={'50%'} y={'70%'} dominantBaseline={'middle'} textAnchor={'middle'} css={[ textstyle, toolstyle ]} transform={`scale(${scale})`}
>
       Data: {data}
     </text>
   </svg>
  )
}

export { ToolTipSvg }
