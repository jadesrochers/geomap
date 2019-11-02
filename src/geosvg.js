/** @jsx jsx */
import { jsx } from '@emotion/core'
import { useMemo } from 'react';
import { geoPath } from 'd3-geo';
import * as topojson from 'topojson';
import * as R from 'ramda';

// useMemo Hooks that consolidate some memoize operations specific
// to geosvg features
const useGeoMemo = (input) => {
  let features = useMemo(() => topojson.feature(input.topology, input.topology.objects[input.topopath]).features,[input.topopath])
  let projection = useMemo(() => input.projection(input.scaling), [input.scaling])
  let geopath = useMemo(() => geoPath(projection), [input.scaling])
  return { features, projection, geopath }
}

const useFeatureMemo = (input) => {
  let path = useMemo(()=> input.geopath(input.feature),[input.feature.properties[input.featurekey]])
  let bounds = useMemo(() => input.geopath.bounds(input.feature),[input.feature.properties[input.featurekey]])
  return { path, bounds }
}

const GeoFeature = (props) => {
  let { path, bounds } = useFeatureMemo(props)
  let styles = R.clone(props.styling)
  let data = props.data, limits = props.limits, feature = props.feature
  if (data && data>limits.min && data<limits.max) {
     styles.fill = props.colorize(data);
     styles = { ...styles, ...props.datastyling }
  }
  return (<path d={path}
    css={{...styles, shapeRendering: "crispEdges"}} 
    onMouseOver={(current) => {
      props.highlight && props.highlight(current)
      props.settooltip && props.settooltip({feature, data, path, bounds}) 
    }}
    onMouseOut={(current) => {
      props.deHighlight && props.deHighlight(current)
      props.settooltip && props.settooltip(false) 
    }}
  />)
}

const GeoSvg = (props) => {
  let { features, projection, geopath } = useGeoMemo(props)
  let colorize = props.datadecorate ? props.datadecorate(props.data) : undefined
  let featurekey = (props.featurekey ? props.featurekey : 'GEO_ID')
  let pass = R.omit(['data'])(props)
  let passalong = { geopath, colorize, featurekey, ...pass }
    
  useMemo(() => {
    if(colorize && props.data){ props.setdatadisplay(() => colorize) }
  },[props.data])
  return (
   <svg css={(props.cssStyles ? props.cssStyles : undefined)} >
      { useMemo(() => {
        return (
        features.map((feature) => <GeoFeature 
        key={`${feature.properties[featurekey]}${Math.round(Math.random()*1000)}`}
        data={props.data ? props.data[feature.properties[featurekey]] : undefined}
        feature={feature}
        { ...passalong }
      />)) },[props.data, features.length, props.limits])}
   </svg>
  )
}

export { GeoSvg }
