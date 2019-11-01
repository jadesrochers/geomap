/** @jsx jsx */
import React, { useState, useEffect, useMemo } from 'react'
import * as R from 'ramda'
import { geoAlbersUsa } from 'd3-geo'
import { scaleQuantile } from 'd3-scale';
import { GeoSvg } from './geosvg'
import * as topojson from 'topojson'
import { jsx } from '@emotion/core'
import { ToolTipSvg } from './svgtools'
import { BarScale } from '@jadesrochers/legends'
import { SelectBase, MouseRect, ViewBoxZoomPan, useZoomPan, ZoomButtons} from '@jadesrochers/selectbox'
import { passExceptChildren, createHighlight } from '@jadesrochers/reacthelpers'


const GnYlRd73 = [  '#005a32', '#238443', '#41ab5d', '#78c679', '#addd8e', '#d9f0a3', '#ffffcc', '#ffeda0', '#feb24c', '#f03b20']
const quantile = R.curry((outputRange, data) => scaleQuantile().domain(R.values(data)).range(outputRange))

const flexColumnCenter = {display: "flex", alignItems: "center" , flexDirection: "column"}
const blackOutline = {outline: '1px solid #000', margin: '2px' }
const whitefill = {backgroundColor: '#FFF' }

const projectAlbersUsa = (scale) => geoAlbersUsa().scale(scale).translate([425, 220])

const useLoadgeo = (dataget, topotype) => {
  const [geodata, setgeodata] = useState(undefined)
  React.useEffect(()=> {
  let rawgeo = {}
  let datagetter
    if(typeof dataget === "function"){
      datagetter = async () => {
        rawgeo[topotype] = await dataget()
        setgeodata(topojson.topology(rawgeo))
      }
    }else{
      datagetter = () => {
        rawgeo[topotype] = dataget
        setgeodata(topojson.topology(rawgeo))
      }
    }
    datagetter()
  }, [])

  return geodata
}

const GeoMap = (props) => {
  const [datadisplay, setdatadisplay] = useState(false)
  // Props I can pass: scaling, limitHook, projection, data(maybe)
  let pass = R.pipe(R.dissoc('height'), R.dissoc('width'))(props)
  pass = { ...pass, 
      datadisplay: datadisplay, setdatadisplay: setdatadisplay,
      limits: props.limitHook.xlimits}

  const propsToChildren = passExceptChildren(pass)

  return(
   <div css={[
      flexColumnCenter,
    { height:"100%", width:"90%", overflow:"hidden", marginTop:"5px" }
    
    ]} >
      <BarScale key='legend' 
        cssStyles={ props.legendstyle }
        data={ props.geodata } 
        legendstyle={props.legendstyle}  
        offset="23%" {...pass} />

     { propsToChildren }
   </div>
  )
}

const BaseMap = (props) => {
  const xsize=800
  const ysize=450
  const { scale, zoomin, zoomout, pan, shiftxpct, shiftypct } = useZoomPan(2.0, 1.0, xsize, ysize)
  let pass = { ...props, scale: scale, pan: pan,
      zoomin: zoomin, zoomout: zoomout,
      shiftxpct: shiftxpct, shiftypct: shiftypct}

  const propsToChildren = passExceptChildren(props)
  return(
    <GeoMap 
      projection={props.projection }
      scaling={props.scaling ? props.scaling : 1000}
      width={ '90%' }
      height={ '100%' }
      data={ props.geodata }
      {...pass}
    >
      <SelectBase  key='selectioncontrol' width={'99%'} height={'95%'} sizex={xsize} sizey={ysize} cssStyles={[blackOutline, whitefill]} >
        <ViewBoxZoomPan key='viewbox' width={'99%'} height={'99%'} viewBox={`0 0 ${xsize} ${ysize}`}>
           <MouseRect key='mousecapture' height="99%" width="99%" />
           {props.children}
        </ViewBoxZoomPan>
      </SelectBase>
      <ZoomButtons key='zoombutton' xoffset='90%' yoffset='90%'/>
    </GeoMap>
  )
}

// generic ToolTipMap
const ToolTipMap = (props) => {
  const [tooltip, settooltip] = useState(false)

  let pass = R.omit(['x','y','startx','starty','endx','endy','clickx','clicky','selectx','selecty','offx','offy','dragx','dragy','trackBounds'])(props)
  pass = { ...pass, tooltip: tooltip, settooltip: settooltip }
  const propsToChildren = passExceptChildren(pass)
  return(
   <React.Fragment>
     {propsToChildren}
     <ToolTipSvg key='tooltip1' width={120} height={50}
       {...pass}
     />
   </React.Fragment>
  )
}

// Much easier with this setup to make maps of any base geo 
// unit I want, or combinations thereof.
const UsCounty = (props) => {
  console.log('Hit UsCounty, props: ',props)
  return(
   <BaseMap 
      projection={ props.projection ? props.projection : projectAlbersUsa }
      scaling={props.scaling ? props.scaling : 975}
      { ...props }
   >
     <ToolTipMap key='countytooltip' >
      <UsCountyMap key="countymap"
        style={props.countystyle} 
        datastyle={props.countydatastyle} 
      />
      <UsStateStaticMap key="statemap"
        style={props.statestyle} 
        datastyle={props.statedatastyle} 
      />
     </ToolTipMap>

   </BaseMap>
  )
}


// Only counties; not state lines. I think it looks odd this way.  
const UsCountyOnly = (props) => {
  console.log('Hit UsCountyOnly, props: ',props)
  return(
   <BaseMap 
     projection={ props.projection ? props.projection : projectAlbersUsa }
     scaling={props.scaling ? props.scaling : 975}
     { ...props }
   >
     <ToolTipMap key='countytooltip' >
      <UsCountyMap key="countymap"
        style={props.countystyle} 
        datastyle={props.countydatastyle} 
      />
     </ToolTipMap>
   </BaseMap>
  )
}


// Much easier with this setup to make maps of any base geo 
// unit I want, or combinations thereof.
const UsState = (props) => {
  console.log('Hit UsState, props: ',props)
  return(
   <BaseMap 
     projection={ props.projection ? props.projection : projectAlbersUsa }
     scaling={props.scaling ? props.scaling : 975}
     { ...props }
   >
     <ToolTipMap key='countytooltip' >
       <UsStateMap key="statemap"
         style={props.statestyle} 
         datastyle={props.statedatastyle} 
       />
     </ToolTipMap>
   </BaseMap>
  )
}


const UsCountyMap = (props) => {
  const geocounty = useLoadgeo(props.getcounties,'county')
  const [highlight, deHighlight] = createHighlight()
  let pass = R.dissoc('style')(props)

  if( ! geocounty ){
    return null
  }
  /* console.log('geocounty object value:\n',geocounty) */
  return(
    <GeoSvg key='countyfeatures'
      topology={ geocounty }
      topopath={'county'}
      datadecorate={ props.countydatacolr ? props.countydatacolor : quantile(GnYlRd73) }
      styling={props.style}
      datastyling={props.datastyle}
      highlight={highlight({'stroke-width':2, fill:'#5d6d7e'})}
      deHighlight={deHighlight}
      { ...pass }
    />
  )
}

const UsStateStaticMap = (props) => {
  const geostate = useLoadgeo(props.getstates,'state')
  let pass = R.dissoc('style')(props)
  if( ! geostate){
    return null
  }
  return(
    <GeoSvg key='statefeatures'
      cssStyles={{pointerEvents: 'none'}}
      topology={ geostate }
      topopath={'state'}
      styling={props.style}
      datastyling={props.datastyle}
      { ...pass }
    />
  )
}

const UsStateMap = (props) => {
  /* console.log('UsStateMap props: ',props) */
  const [highlight, deHighlight] = createHighlight()
  const geostate = useLoadgeo(props.getstates,'state')
  let pass = R.dissoc('style')(props)
  if( ! geostate){
    return null
  }
  return(
    <GeoSvg key='statefeatures'
      topology={ geostate }
      topopath={'state'}
      styling={props.style}
      datastyling={props.datastyle}
      datadecorate={ props.statedatacolor ? props.statedatacolor : quantile(GnYlRd73) }
      highlight={highlight({'stroke-width':2, fill:'#5d6d7e'})}
      deHighlight={deHighlight}
      { ...pass }
    />
  )
}

export { UsCounty, UsState, UsCountyOnly, BaseMap, ToolTipMap, useLoadgeo }
