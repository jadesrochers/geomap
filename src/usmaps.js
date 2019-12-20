/** @jsx jsx */
import React, { useState, useEffect, useMemo } from "react";
import * as R from "ramda";
import { geoAlbersUsa } from "d3-geo";
import { scaleQuantile } from "d3-scale";
import { min, max } from "d3-array";
import { GeoSvg } from "./geosvg";
import * as topojson from "topojson";
import { jsx } from "@emotion/core";
import { BarScale } from "@jadesrochers/legends";
import { SelectBase, MouseRect, ViewBoxZoomPan, useZoomPan, ZoomButtons } from "@jadesrochers/selectbox";
import { passExceptChildren, createHighlight } from "@jadesrochers/reacthelpers";

const GnYlRd73 = [ "#005a32", "#238443", "#41ab5d", "#78c679", "#addd8e",
  "#d9f0a3", "#ffffcc", "#ffeda0", "#feb24c", "#f03b20" ];

const quantile = R.curry((outputRange, data) => {
  let dataarr = R.values(data)
  return scaleQuantile()
    .domain([ min(dataarr) - 1, max(dataarr) + 1] )
    .range(outputRange)
});

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
// passes all props to the children, which should be a map.
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
        legendstyle={props.legendstyle}
        formatter={props.legendformatter}
        offset="23%"
        {...pass}
      />

      {propsToChildren}
    </div>
  );
};

// BaseMap takes Svg rendering children and puts them inside
// a viewbox with zoom/pan and mouse tracking capabilities
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
      <ZoomButtons key="zoombutton" xoffset="90%" yoffset="90%" />
    </GeoMap>
  );
};

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



const SvgCounty = props => {
  const geocounty = useLoadgeo(props.getcounties, "county");
  const defaulthighlight = { "stroke-width": 2, fill: "#5d6d7e" }
  const [highlight, deHighlight] = createHighlight();
  const pass = R.dissoc("style")(props);
  if (!geocounty) {
    return null;
  }
  /* console.log('geocounty object value:\n',geocounty) */
  return (
    <GeoSvg
      key="countyfeatures"
      topology={geocounty}
      topopath={"county"}
      colorize={
        props.colorize ? props.colorize : quantile(GnYlRd73)
      }
      style={props.style}
      datastyle={props.datastyle}
      highlight={highlight(props.highlightstyle ? props.highlightstyle : defaulthighlight)}
      deHighlight={deHighlight}
      {...pass}
    />
  );
};

const SvgStateStatic = props => {
  const geostate = useLoadgeo(props.getstates, "state");
  const pass = R.dissoc("style")(props);
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
  const pass = R.dissoc("style")(props);
  if (!geostate) {
    return null;
  }

  return (
    <GeoSvg
      key="statefeatures"
      topology={geostate}
      topopath={"state"}
      style={props.style}
      datastyle={props.datastyle}
      colorize={
        props.colorize ? props.colorize : quantile(GnYlRd73)
      }
      highlight={highlight(props.highlightstyle ? props.highlightstyle : defaulthighlight)}
      deHighlight={deHighlight}
      {...pass}
    />
  );
};

export { BaseMap, UsMap, UsStateMap, UsCountyMap, useLoadgeo };
