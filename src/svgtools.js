import React from 'react';
import * as R from 'ramda';

var Foreignobject = (props) => {
  let bounds = props.tooltip.bounds
  let viewarr = R.map(parseInt, R.split(' ',props.viewBox))
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

  let defaultstyle = {fill: '#b0b0b0', fillOpacity: 0.8}

  return(
   <React.Fragment>
   <rect x={x} y={y} width={props.width} height={props.height}
    style={(props.styles ? props.style : defaultstyle)}
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

var Createtooltip = (props) => {
  let data = props.tooltip.data ? Math.round(props.tooltip.data) : 'No Value'
  return(
   <div
     style={{display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'black', fontSize: '80%', height: props.height, width: props.width}}
   >
     {props.tooltip.feature.properties.NAME} <br/>
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
