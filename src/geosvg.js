/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMemo, useState } from "react";
import { geoPath } from "d3-geo";
import * as topojson from "topojson";
import * as R from "ramda";
import { ToolTipSvg } from "./svgtools";

// useMemo Hooks that consolidate some memoize operations specific
// to geosvg features
const useGeoMemo = input => {
  const features = useMemo(() =>
      topojson.feature(input.topology, input.topology.objects[input.topopath]).features, 
   [input.topopath]);
  const projection = useMemo(() => input.projection(input.scaling), 
  [ input.scaling ]);
  const geopath = useMemo(() => geoPath(projection), [input.scaling]);
  return { features, projection, geopath };
};

const useFeatureMemo = input => {
  const featkey = input.feature.properties[input.featurekey]
  const path = useMemo(() => input.geopath(input.feature), [ featkey ]);
  const bounds = useMemo(() => input.geopath.bounds(input.feature), [ featkey ]);
  return { path, bounds };
};

const GeoFeature = props => {
  const { path, bounds } = useFeatureMemo(props);
  let styles = R.clone(props.style);
  const data = props.data,
    limits = props.limits,
    feature = props.feature;
  if (data && data > limits.min && data < limits.max) {
    styles.fill = props.colorize(data);
    styles = { ...styles, ...props.datastyle };
  }
  return (
    <path
      d={path}
      css={{ ...styles, shapeRendering: "crispEdges" }}
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
  const colorize = props.datadecorate
    ? props.datadecorate(props.data)
    : undefined;
  const featurekey = props.featurekey ? props.featurekey : "GEO_ID";
  const pass = R.omit(["data"])(props);
  const passalong = { geopath, colorize, featurekey, settooltip, ...pass };

  useMemo(() => {
    if (colorize && props.data) {
      props.setdatadisplay(() => colorize);
    }
  }, [props.data]);
  return (
    <svg css={props.cssStyles ? props.cssStyles : undefined}>
      {useMemo(() => {
        return features.map(feature => (
          <GeoFeature
            key={`${feature.properties[featurekey]}${Math.round(
              Math.random() * 1000
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
      <ToolTipSvg tooltip={tooltip} {...props} width={120} height={50} />
    </svg>
  );
};

export { GeoSvg };
