/** @jsx jsx */
import React, { useState, useEffect, useMemo } from "react";
import * as R from "ramda";
import { geoAlbersUsa } from "d3-geo";
import { GeoSvg } from "./geosvg";
import * as topojson from "topojson-server";
import { jsx } from "@emotion/core";
import { BarScale } from "@jadesrochers/legends";
import { SelectBase, MouseRect, ViewBoxZoomPan, useZoomPan, ZoomButtons } from "@jadesrochers/selectbox";
import { passExceptChildren, createHighlight } from "@jadesrochers/reacthelpers";

const flexColumnCenter = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column"
};

const blackOutline = { outline: "1px solid #000", margin: "2px" };
const whitefill = { backgroundColor: "#FFF" };
const projectAlbersUsa = R.curry( (scale, xtrans, ytrans) =>
  geoAlbersUsa()
    .scale(scale)  
    .translate([xtrans, ytrans]) );

// Load geojson data. If it is a function I assume it is async,
// Call it, and set the rawgeo based on the type indicated.
// If not a function, guess it is an object and use it directly.
const useLoadgeo = (dataget, topotype) => {
  const [geodata, setgeodata] = useState(undefined);
  useEffect(() => {
    const rawgeo = {};
    let datagetter;
    if (typeof dataget === "function") {
      datagetter = async () => {
        rawgeo[topotype] = await dataget();
        setgeodata(topojson.topology(rawgeo));
      };
    } else {
      datagetter = () => {
        rawgeo[topotype] = dataget;
        setgeodata(topojson.topology(rawgeo));
      };
    }
    datagetter();
  }, []);

  return geodata;
};

// Geomap sets up the barscale for a map. otherwise it just
// passes all props to its children. 
//// REMEMBER: it only has access to direct children, so the
//// selectBase and ZoomButtons it wraps in BaseMap.
//// 
// The Legend (BarScale) gets the limit hooks and datadisplay so it can 
// setup scaling appropriately
// Props:
// legendstyle prop is passed to the barscale and applied as the final css
// style object to its svg, so it should style the whole bar
// legendformatter prop allows specifying a d3 scaling object
const GeoMap = props => {
  // This is a state var to update colorizing fcn for legend(BarScale)
  const [datadisplay, setdatadisplay] = useState(false);
  // Props I can pass: scaling, limitHook, projection, data(maybe)
  let pass = R.pipe(
    R.dissoc("height"),
    R.dissoc("width")
  )(props);
  pass = {
    ...pass,
    datadisplay,
    setdatadisplay,
    limits: props.limitHook.xlimits ? props.limitHook.xlimits : undefined
  };

  const propsToChildren = passExceptChildren(pass);
  /* console.log('GeoMap props.children: ', props.children) */

  return (
    <div
      css={[
        flexColumnCenter,
        {
          height: props.height ? props.height : "100%",
          width: props.width ? props.width : "100%",
          overflow: "hidden",
          marginTop: "5px"
        }
      ]}
    >
      <BarScale
        key="legend"
        cssStyles={props.legendstyle}
        data={props.data}
        formatter={props.legendformatter}
        {...pass}
      />

      {propsToChildren}
    </div>
  );
};

// BaseMap sets up a selectBox and viewboxZoomPan for a map
// The children passed to it are put inside the select/zoom box
// so that this map will be a selectable zoom/pan map
// Its only Child is GeoMap, which it passes all its props except
// project to.
// GeoMap puts its the children inside a <div> with a legendBar.
const BaseMap = props => {
  const xsize = props.viewxsize ? props.viewxsize : 1700;
  const ysize = props.viewysize ? props.viewysize : 950;
  const xanchor = props.xanchor ? props.xanchor : 0;
  const yanchor = props.yanchor ? props.yanchor : 0;
  const projxtrans = props.projxtrans ? props.projxtrans : 900;
  const projytrans = props.projytrans ? props.projytrans : 470;

  const projection = useMemo(() => props.projection(props.scaling, projxtrans, projytrans), 
  [ props.scaling, projxtrans, projytrans ]);
 
  const { scale, zoomin, zoomout, pan, shiftxpct, shiftypct } = useZoomPan(
    2.0,
    1.0,
    xsize,
    ysize
  );
  const passprops = R.omit(["project"])(props);
  const pass = {
    ...passprops,
    projection,
    scale,
    pan,
    zoomin,
    zoomout,
    shiftxpct,
    shiftypct
  };
  // console.log('what are the children: ', props.children)
  /* console.log('Basemap props: ', props) */
  return (
    <GeoMap
      projection={projection}
      scaling={props.scaling ? props.scaling : 1000}
      data={props.data}
      {...pass}
    >
      <SelectBase
        key="selectioncontrol"
        width={"99%"}
        height={"99%"}
        sizex={xsize}
        sizey={ysize}
        cssStyles={[blackOutline, whitefill, (props.baseStyle ? props.baseStyle : undefined) ] }
      >
        <ViewBoxZoomPan
          key="viewbox"
          width={"99%"}
          height={"99%"}
          viewBox={`${xanchor} ${yanchor} ${xsize} ${ysize}`}
        >
          {props.children}
          
        </ViewBoxZoomPan>
      </SelectBase>
      <ZoomButtons 
        key="zoombutton" 
        xoffset="90%" 
        yoffset="90%" 
        cssStyles={props.zoomstyle}
       />
    </GeoMap>
  );
};


// UsMap is the Top level function; 
// Uses Basemap, which uses Geomap,
//  
// Arguments it can take: 
// getcounties/ getstates to load in geojson 
// data - to pass data
// statestyle and countystyle to specify style for blank features
// countydatastyle to style counties with data
// colorize - a higher order function that determines color for data 
// tooltipstyle, tooltiprectstyle - to configure the tooltip appearance 
// legendstyle - to configure stlying for the legend
// formatter - format for data values in legend and tooltip 
const UsMap = (props) => {
  /* console.log('UsMap props: ', props) */
  return(
    <BaseMap
    projection={projectAlbersUsa}
    scaling={props.scaling ? props.scaling : 2000}
    {...props}
    >
      <MouseRect key="mousecapture" height="99%" width="99%" />
      <SvgCounty
        key="countymap"
        style={props.countystyle}
        datastyle={props.countydatastyle}
      />
      <SvgStateStatic
        key="statemap"
        style={props.statestyle}
        datastyle={props.statedatastyle}
      />
  </BaseMap>
  )
}

const UsStateMap = (props) => {
  return(
    <BaseMap
    projection={projectAlbersUsa}
    scaling={props.scaling ? props.scaling : 2000}
    {...props}
    >
      <MouseRect key="mousecapture" height="99%" width="99%" />
      <SvgState
        key="statemap"
        style={props.statestyle}
        datastyle={props.statedatastyle}
      />
  </BaseMap>
  )
}


const UsCountyMap = (props) => {
  return(
    <BaseMap
    projection={projectAlbersUsa}
    scaling={props.scaling ? props.scaling : 2000}
    {...props}
    >
      <MouseRect key="mousecapture" height="99%" width="99%" />
      <SvgCounty
        key="countymap"
        style={props.countystyle}
        datastyle={props.countydatastyle}
      />
  </BaseMap>
  )
}


//// HOW THE colorize=undefined happened;
// Because SvgCounty passes all its props to GeoSvg ( using ...pass)
// anything it gets and sets a default for GeoSvg gets overwritten
// because it is passing all those props that it received.
// This is not ideal; I should come up with a way to pass only what is needed
// instead of passing everything.
//// CHANGE; so a props culling here; all the select/viewbox 
//// stuff should not be needed below this level so you
//// should limit what is passed to what is needed
//// GENERAL RULE: if you pass any prop directly, do not pass it using
//// ...pass or PropsToChildren because you are double passing with
//// unpredicatable results
const SvgCounty = props => {
  const geocounty = useLoadgeo(props.getcounties, "county");
  const defaulthighlight = { "stroke-width": 2, fill: "#5d6d7e" }
  const [highlight, deHighlight] = createHighlight();
  const pass = R.omit(["colorize", "style", "datastyle", "deHighlight", "x", "y", "startx", "starty", "endx", "endy", "clickx", "clicky", "selectx", "selecty", "offx", "offy", "dragx", "dragy" ])(props);

  if (!geocounty) {
    return null;
  }
  /* console.log('SvgCounty props: ', props) */
  /* console.log('SvgCounty pass: ', pass) */

  return (
    <GeoSvg
      key="countyfeatures"
      limits={props.limits}
      data={props.data}
      viewBox={props.viewBox}
      topology={geocounty}
      topopath={"county"}
      projection={props.projection}
      scaling={props.scaling}
      colorize={props.colorize ? props.colorize : undefined}
      style={props.countystyle}
      datastyle={props.countydatastyle}
      highlight={highlight(props.highlightstyle ? props.highlightstyle : defaulthighlight)}
      deHighlight={deHighlight}
      clickFcn={props.clickFcn}
      tooltipwidth={props.tooltipwidth}
      tooltipheight={props.tooltipheight}
      tooltipstyle={props.tooltipstyle}
      setdatadisplay={props.setdatadisplay}
    />
  );
};

const SvgStateStatic = props => {
  const geostate = useLoadgeo(props.getstates, "state");
  const pass = R.omit(["style","datastyle", "x", "y", "startx", "starty", "endx", "endy", "clickx", "clicky", "selectx", "selecty", "offx", "offy", "dragx", "dragy" ])(props);
  if (!geostate) {
    return null;
  }

  return (
    <GeoSvg
      key="statefeatures"
      cssStyles={{ pointerEvents: "none" }}
      topology={geostate}
      topopath={"state"}
      style={props.style}
      datastyle={props.datastyle}
      {...pass}
    />
  );
};

const SvgState = props => {
  /* console.log('UsStateMap props: ',props) */
  const [highlight, deHighlight] = createHighlight();
  const defaulthighlight = { "stroke-width": 2, fill: "#5d6d7e" }
  const geostate = useLoadgeo(props.getstates, "state");
  const pass = R.omit(["style", "colorize", "style", "datastyle"])(props);
  if (!geostate) {
    return null;
  }

  /* console.log('SvgState props: ', props) */
  /* console.log('SvgState pass: ', pass) */
  return (
    <GeoSvg
      key="statefeatures"
      limits={props.limits}
      data={props.data}
      viewBox={props.viewBox}
      topology={geostate}
      topopath={"state"}
      projection={props.projection}
      scaling={props.scaling}
      colorize={props.colorize ? props.colorize : undefined}
      style={props.statestyle}
      datastyle={props.statedatastyle}
      highlight={highlight(props.highlightstyle ? props.highlightstyle : defaulthighlight)}
      deHighlight={deHighlight}
      clickFcn={props.clickFcn}
      tooltipwidth={props.tooltipwidth}
      tooltipheight={props.tooltipheight}
      tooltipstyle={props.tooltipstyle}
      setdatadisplay={props.setdatadisplay}
    />
  );
};

export { BaseMap, UsMap, UsStateMap, UsCountyMap, useLoadgeo };
