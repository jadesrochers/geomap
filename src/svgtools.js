/** @jsx jsx */
import React from 'react';
import * as R from 'ramda';
import { jsx } from "@emotion/core";

const Foreignobject = (props) => {
  const bounds = props.tooltip.bounds
  const viewarr = R.map(parseInt, R.split(' ',props.viewBox))
  let x = (bounds[1][0] + bounds[0][0])/2 - props.width/2
  let y = (bounds[0][1]) - (props.height + 10)
  if(y < viewarr[1]){
    y = bounds[1][1] + 20
  }
  if(x + props.width > viewarr[2]){
    x = bounds[0][0] - props.width - 20
    y = (bounds[1][1] + bounds[0][1])/2 - props.height/2
  }
  if(x + props.width < viewarr[0]){
    x = bounds[1][0] + 20
    y = (bounds[1][1] + bounds[0][1])/2 - props.height/2
  }

  const defaultstyle = {fill: '#b0b0b0', fillOpacity: 0.8}

  return(
   <React.Fragment>
   <rect x={x} y={y} width={props.width} height={props.height}
    style={(props.tooltiprectstyle ? props.tooltiprectstyle : defaultstyle)}
    />
   <foreignObject className={props.className}
     width={props.width}  
     height={props.height}
     x={x}
     y={y}
   >
     {props.children}
   </foreignObject>
   </React.Fragment>
  )
}

const Createtooltip = (props) => {
  const data = props.tooltip.data ? (props.tooltip_round ? props.tooltip_round(props.tooltip.data) : Math.round(props.tooltip.data)) : 'No Value'
  const featprops = props.tooltip.feature.properties
  const defaultname = featprops.NAME ? 'NAME' : 'name'
  const defaultstyle = {display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'black', fontSize: '2.0rem', height: props.height, width: props.width}
  const name = props.tooltipkey ? props.tooltipkey : defaultname
  return(
   <div
     css={[ defaultstyle, 
     (props.tooltipstyle ? props.tooltipstyle : undefined) 
     ]}
   >
     {featprops[name]} <br/>
     Data: {data}
   </div>
  )
}

const ToolTipSvg = (props) => {
 if(! props.tooltip){return null} 
 return (
   <Foreignobject {...props} >
     <Createtooltip {...props} >
     </Createtooltip>
   </Foreignobject>
 )
}

export { ToolTipSvg }
