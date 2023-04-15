import React from 'react'
import * as R from 'ramda'
import { createHighlight } from '@jadesrochers/reacthelpers'
import { MouseRect } from "@jadesrochers/selectbox";
import { useLoadgeo, BaseMap } from './usmaps'
import { GeoSvg } from './geosvg'
import { geoAlbersUsa } from 'd3-geo'
import { scaleQuantile } from 'd3-scale';


const GnYlRd73 = [  '#005a32', '#238443', '#41ab5d', '#78c679', '#addd8e', '#d9f0a3', '#ffffcc', '#ffeda0', '#feb24c', '#f03b20']
const projectAlbersUsa = R.curry( (scale, xtrans, ytrans) =>
    geoAlbersUsa()
    .scale(scale)  
    .translate([xtrans, ytrans]) );

const quantile = R.curry((outputRange, data) => scaleQuantile().domain(R.values(data)).range(outputRange))

const defaultHighlight = {'stroke-width':2, fill:'#5d6d7e'}

const CustomMap = (props) => {
    return(
        <BaseMap 
        projection={ props.projection ? props.projection : projectAlbersUsa }
        scaling={props.scaling ? props.scaling : 1000}
        { ...props }
        >
        <MouseRect key="mousecapture" height="99%" width="99%" />
        <SvgGeneric 
        key="genericmap1"
        style={props.style} 
        datastyle={props.datastyle} 
        />
        </BaseMap>
    )
}

const SvgGeneric = (props) => {
    // Since the feature type is unknown, need a featurename argument
    const geofeatures = useLoadgeo(props.getgeofeat, props.featurename)
    const [highlight, deHighlight] = createHighlight()
    const pass = R.dissoc('style')(props)

    if( ! geofeatures ){
        return null
    }
    /* console.log('geocounty object value:\n',geocounty) */
    return(
        <GeoSvg 
        key={'custom_geosvg'}
        topology={ geofeatures }
        topopath={props.featurename}
        colorize={ props.colorize ? props.colorize : quantile(GnYlRd73) }
        style={props.style}
        datastyle={props.datastyle}
        highlight={highlight(props.highlightStyle ? props.highlightStyle : defaultHighlight)}
        deHighlight={deHighlight}
        { ...pass }
        />
    )
}


export { CustomMap  }
