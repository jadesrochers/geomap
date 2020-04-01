/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMemo, useState, useRef, useEffect } from "react";
import { geoPath } from "d3-geo";
import * as topojson from "topojson";
import * as R from "ramda";
import { ToolTipSvg } from "./svgtools";

// useMemo Hooks that consolidate some memoize operations specific
// to geosvg features
const useGeoMemo = input => {
  const features = useMemo(() => topojson.feature(input.topology, input.topology.objects[input.topopath]).features, [input.topopath]);
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

const GeoFeature = props => {
  const { path, bounds } = useFeatureMemo(props);
  let styles = R.clone(props.style);
  const x = useRef(0)
  const y = useRef(0)
  const data = props.data,
    limits = props.limits,
    feature = props.feature;
  if (! R.isEmpty(data) && ! R.isNil(data) && limits && data >= limits.min && data <= limits.max) {
    styles.fill = props.colorfcn.current(data);
    styles = { ...styles, ...props.datastyle };
  }
  return (
    <path
      onMouseDown={(e) => setxy(e, x, y)}
      onClick={(e) => clickfn(e, x.current, y.current, props) }
      onTouchStart={(e) => setxy(e, x, y)}
      onTouchEnd={(e) => clickfn(e, x.current, y.current, props)}
      d={path}
      css={{ ...styles, shapeRendering: "geometricPrecision" }}
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


const GeoSvg = props => {
  const { features, geopath } = useGeoMemo(props);
  const [tooltip, settooltip] = useState(false);
  const colorfcn = useRef(false)
  // Pass all data to set up the colorizing function
  const featurekey = props.featurekey ? props.featurekey : "GEO_ID";
  const pass = R.omit(["data"])(props);
  const tooltipwidth = props.tooltipwidth ? props.tooltipwidth : 260;
  const tooltipheight = props.tooltipheight ? props.tooltipheight : 130;
  const tooltipstyle = props.tooltipstyle ? props.tooltipstyle : { fontSize: "2.2rem", fontWeight: 300 };
 
  useMemo(() => {
    if (! R.isEmpty(props.data) && ! R.isNil(props.data)){
      colorfcn.current = props.colorize ? props.colorize(props.data) : undefined;
    }
  }, [props.data]);

  useEffect(() => {
    if (colorfcn.current && ! R.isEmpty(props.data) && ! R.isNil(props.data)){
      props.setdatadisplay(() => colorfcn.current);
    }
  }, [props.data]);

  const passalong = { geopath, colorfcn, featurekey, settooltip, ...pass };
  return (
    <svg css={props.cssStyles ? props.cssStyles : undefined}>
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
        tooltipstyle={tooltipstyle}
        width={tooltipwidth}
        height={tooltipheight}
        {...props}
      />
    </svg>
  );
};

export { GeoSvg };
