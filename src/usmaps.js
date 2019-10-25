/** @jsx jsx */
import React, { useState, useEffect, useMemo } from 'react'
import * as R from 'ramda'
import { geoAlbersUsa } from 'd3-geo'
import { GeoSvg } from './geosvg'
import * as topojson from 'topojson'
import { jsx } from '@emotion/core'
import { ToolTipSvg } from './svgtools'
import { highlight, deHighlight, quantile, GnYlRd73 } from './stylehelpers'
import { ZoomButtons } from './zoombutton'
/* import { retryGeoJson } from '../reqs' */
import { BarScale } from '@jadesrochers/legends'
import { SelectBase, MouseRect, ViewBoxZoomPan, useZoomPan } from '@jadesrochers/selectbox'
import { passExceptChildren } from '@jadesrochers/reacthelpers'

const flexColumnCenter = {display: "flex", alignItems: "center" , flexDirection: "column"}
const blackOutline = {outline: '1px solid #000' }
const whitefill = {backgroundColor: '#FFF' }

const projectAlbersUsa = (scale) => geoAlbersUsa().scale(scale).translate([425, 220])

const GeoMap = (props) => {
  const [datadisplay, setdatadisplay] = useState(false)
  const { scale, zoomin, zoomout, pan, shiftxpct, shiftypct } = useZoomPan(2.0, 1.0)
  // Props I can pass: scaling, limitHook, projection, data(maybe)
  let pass = R.pipe(R.dissoc('height'), R.dissoc('width'))(props)
  pass = { ...pass, 
      datadisplay: datadisplay, setdatadisplay: setdatadisplay,
      scale: scale, pan: pan,
      zoomin: zoomin, zoomout: zoomout,
      shiftxpct: shiftxpct, shiftypct: shiftypct,
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

// I split this out to minimize re-renders due to tooltip state changes.
const ToolTipMap = (props) => {
  const [tooltip, settooltip] = useState(false)
  return(
   <React.Fragment>
    <UsCountyMap key="countymap"
     style={props.countystyle} 
     tooltip={tooltip} settooltip={settooltip}
     {...props}
    />
    <UsStateMap key="statemap"
      style={props.statestyle} 
      {...props}
    />
    <ToolTipSvg key='tooltip1' width={120} height={50}
     tooltip={tooltip} settooltip={settooltip}
     {...props}
    />
   </React.Fragment>
  )
}

// Much easier with this setup to make maps of any base geo 
// unit I want, or combinations thereof.
const UsStateandCounty = (props) => {
  console.log('Hit UsStateandCounty, props: ',props)
  return(
   <GeoMap 
      projection={ projectAlbersUsa }
      scaling={975}
      data={ props.geodata }
      datavals={ props.datavals }
      legendstyle={props.legendstyle}
      limitHook={ props.limitHook }
      getcounties={ props.getcounties }
      getstates={ props.getstates }
      width={ '90%' }
      height={ '100%' }
   >
    <SelectBase  key='selectioncontrol' width={'99%'} height={'95%'} sizex={800} sizey={450} cssStyles={[blackOutline, whitefill]} >
       <ViewBoxZoomPan key='viewbox' width={'99%'} height={'99%'} viewBox={"0 0 800 450"}>
         <MouseRect key='mousecapture' height="99%" width="99%" />
         <ToolTipMap key='countytooltip' 
           countystyle={props.countystyle} 
           statestyle={props.statestyle} 
         />
       </ViewBoxZoomPan>
     </SelectBase>
     <ZoomButtons key='zoombutton' xoffset='90%' yoffset='90%'/>
   </GeoMap>
  )
}

const UsCountyMap = (props) => {

  const [geocounty, setgeocounty] = useState(null)
  useEffect(()=> {
    let dataget = async () => {
      /* setgeocounty(topojson.topology({county: (await retryGeoJson('county', 4, {timeout: 3000})) } )) */
      setgeocounty(topojson.topology({county: (await props.getcounties()) } ))
    }
    dataget()
  }, [])
  let pass = R.dissoc('style')(props)
  if( ! geocounty){
    return null
  }

  /* console.log('geocounty object:\n',geocounty) */
  return(
    <GeoSvg key='countyfeatures'
      topology={ geocounty }
      topopath={'county'}
      datadecorate={ quantile(GnYlRd73) }
      styling={props.style}
      highlight={highlight({'stroke-width':2, fill:'#5d6d7e'})}
      deHighlight={deHighlight}
      { ...pass }
    />
  )
}

const UsStateMap = (props) => {
  const [geostate, setgeostate] = useState(null)
  useEffect(()=> {
    let dataget = async () => {
      /* setgeostate(topojson.topology({state: (await retryGeoJson('state', 4, {timeout: 3000})) } )) */
      setgeostate(topojson.topology({state: (await props.getstates()) } ))
    }
    dataget()
  }, [])

  let pass = R.dissoc('style')(props)
  if( ! geostate){
    return null
  }
  /* console.log('geostate object:\n',geostate) */
  return(
    <GeoSvg key='statefeatures'
      cssStyles={{pointerEvents: 'none'}}
      topology={ geostate }
      topopath={'state'}
      styling={props.style}
      { ...pass }
    />
  )
}

export { UsStateandCounty }
