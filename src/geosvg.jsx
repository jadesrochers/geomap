import React, { useMemo, useState, useRef, useEffect } from "react";
import { geoPath } from "d3-geo";
import { feature as topofeature } from "topojson-client";
import * as R from "ramda";
import { ToolTipSvg } from "./svgtools.jsx";
import { scaleQuantile } from "d3-scale";
import styles from "./geosvg.module.css"

const GnYlRd73 = [ "#005a32", "#238443", "#41ab5d", "#78c679", "#addd8e",
  "#d9f0a3", "#ffffcc", "#ffeda0", "#feb24c", "#f03b20" ];

const quantile = R.curry((outputRange, data) => {
  return scaleQuantile()
    .domain(R.values(data))
    .range(outputRange)
});

// useMemo Hooks that consolidate some memoize operations specific
// to geosvg features
const useGeoMemo = input => {
  const features = useMemo(() => topofeature(input.topology, input.topology.objects[input.topopath]).features, [input.topopath]);
  const geopath = useMemo(() => geoPath(input.projection), [input.scaling]);
  return { features, geopath };
};

const useFeatureMemo = input => {
  const featkey = input.feature.properties[input.featurekey];
  const path = useMemo(() => input.geopath(input.feature), [featkey]);
  const bounds = useMemo(() => input.geopath.bounds(input.feature), [featkey]);
  return { path, bounds };
};

const clickfn = (e, x, y, props) => { 
    if(Math.abs(x-e.clientX)<2 && Math.abs(y-e.clientY)<2){
      props.clickFcn ? props.clickFcn(props) : undefined
    }
  }

const setxy = (e, x, y) => { x.current = e.clientX; y.current = e.clientY }

// Plots the actual svg geofeatures
// requires:
// props.limits, props.data  - value limits hook and data for that feature
// props.style, props.datastyle
// props.feature, props.geopath  - the feature data and geopath
// props.colorfcn
// props.highlight, props.deHighlight
// props.settooltip
// props.clickFcn
// All the props are passed to any ClickFcn, but I should limit
// what it has available.
const GeoFeature = props => {
  const { path, bounds } = useFeatureMemo(props);
  let styles = R.clone(props.style);
  const x = useRef(0)
  const y = useRef(0)
  const data = props.data,
    limits = props.limits,
    feature = props.feature;
  let fill = { "fill": "none" }
  if (! R.isEmpty(data) && ! R.isNil(data) && limits && data >= limits.min && data <= limits.max) {
    fill.fill = props.colorfcn.current(data);
    // styles = { ...styles, ...props.datastyle };
    // css={{ ...styles, shapeRendering: "geometricPrecision" }}
  }
  return (
    <path
      className={`${props.featureclasses}`}
      style={ fill }
      onMouseDown={(e) => setxy(e, x, y)}
      onClick={(e) => clickfn(e, x.current, y.current, props) }
      onTouchStart={(e) => setxy(e, x, y)}
      onTouchEnd={(e) => clickfn(e, x.current, y.current, props)}
      d={path}
      onMouseOver={current => {
        props.highlight && props.highlight(current);
        props.settooltip && props.settooltip({ feature, data, path, bounds });
      }}
      onMouseOut={current => {
        props.deHighlight && props.deHighlight(current);
        props.settooltip && props.settooltip(false);
      }}
    />
  );
};

// Calculates all the features, sets up the tooltip
//// Passes to GeoFeature:
// props.limits, props.data
// props.style, props.datastyle
// props.feature, props.geopath  - the feature data and geopath, which
// are both created in GeoSvg
// props.colorfcn
// props.highlight, props.deHighlight
// props.settooltip - sets tooltip feature, created in GeoSvg
// props.clickFcn
//// Needs for itself:
// props.data, props.limits - mostly for useMemo() purposes
// props.topology, props.topopath, props.projection, props.scaling
// are all for calculating the features using useGeoMemo
// props.setdatadisplay
// props.featurekey for selecting data/identifying key for each feature
//// Needs for tooltip:
// props.tooltipwidth/tooltipheight/tooltipstyle for the tooltip
// props.viewBox

const GeoSvg = props => {
  const { features, geopath } = useGeoMemo(props);
  const [tooltip, settooltip] = useState(false);
  const colorfcn = useRef(false)
  // Pass all data to set up the colorizing function
  const featurekey = props.featurekey ? props.featurekey : "GEO_ID";
  const pass = R.omit(["data"])(props);
  // const tooltipwidth = props.tooltipwidth ? props.tooltipwidth : 260;
  // const tooltipheight = props.tooltipheight ? props.tooltipheight : 130;
  // const tooltipstyle = props.tooltipstyle ? props.tooltipstyle : { fontSize: "2.2rem", fontWeight: 300 };
  // const tooltiprectstyle = props.tooltiprectstyle ? props.tooltiprectstyle : { fill: '#b0b0b0', fillOpacity: 0.70 };
  const colorize = props.colorize ? props.colorize : quantile(GnYlRd73) 
 
  useMemo(() => {
    if (! R.isEmpty(props.data) && ! R.isNil(props.data)){
      colorfcn.current = props.colorize ? props.colorize(props.data) : colorize(props.data);
    }
  }, [props.data]);

  useEffect(() => {
    if (colorfcn.current && ! R.isEmpty(props.data) && ! R.isNil(props.data)){
      props.setdatadisplay(() => colorfcn.current);
    }
  }, [props.data]);

  const passalong = { geopath, colorfcn, featurekey, settooltip, ...pass };
  // css={props.cssStyles ? props.cssStyles : undefined}>
  return (
    <g 
      className={`${props.dataclasses}`} >
      {useMemo(() => {
        return features.map(feature => (
          <GeoFeature
            key={`${feature.properties[featurekey]}${Math.round(
              Math.random() * 10000
            )}`}
            data={
              props.data
                ? props.data[feature.properties[featurekey]]
                : undefined
            }
            feature={feature}
            {...passalong}
          />
        ));
      }, [props.data, features.length, props.limits])}
      <ToolTipSvg
        tooltip={tooltip}
        rectclasses={props.tooltiprectclass}
        textclasses={props.tooltiptextclass}
        width={props.tooltipwidth}
        height={props.tooltipheight}
        {...props}
      />
    </g>
  );
};

export { GeoSvg };
