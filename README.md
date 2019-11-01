## Geomap; creating interactive geographic maps from svg  
This package allows creating maps from geojson features. The maps can be  
colorized based on data and tooltip/zoom+pan can be set up readily.  

#### The inputs needed are geographic features and data -  
The package is designed to try and handle all the map setup and appearance,  
but it needs the geographic features in the form of geojson.  
It needs a data object with GEO_ID: data pairs if you want to display data.  

#### There are preset US maps, and a generic base map -  
I set up the projection/scaling for some UsMap setups, but there is also  
a generic BaseMap that can be used so long as you pass projection fcn as well.  
1. UsCounty 
This map does US Counties and state outlines.   
2. UsState  
US states, no counties.  
3. UsCountyOnly  
This map does counties without state boundaries.  

#### Generic map is BaseMap, which you need to pass at least one GeoSvg  
Creating a custom location map requires using BaseMap component and passing  
it at least one GeoSvg component to render.  

#### Using one of the US maps  
The only required argument is getstates. This needs to be either state geojson  
or a function that will retrieve and return US state geojson.  
Either is fine, and it will handle async retrieval of data.
```javascript
const Usmap = props => {
  return (
      <UsState
        data={data}
        getstates={stategeofcn}
        formatter={input => Math.round(input)}
        legendstyle={{
          width: "100%",
          height: "40px",
          fontSize: "0.8em",
          padding: "0 0 5px 0"
        }}
        statestyle={{
          fill: "#f4f6f6",
          stroke: "#707b7c",
          strokeLinejoin: "round"
        }}
        statedatastyle={{
          stroke: "#323535",
          strokeLinejoin: "round"
        }}
      />
  );
};
```
1. statestyle sets styling for features without data.  
2. statedatastyle sets feature styling when they have data.  
3. data specifies the data to use; must be GEOID: data pairs.  
4. Legendstyle indicates how to format the data legend.  

#### Creating your own custom map  
A custom map requires a projection to be set in addition to providing data.  
Styling does feature styling, datastyling styles features with data.  
Need to create highlight/dehighlight function if you want feature hover to,  
change styling. can use my helper functions or run your own.  
```javascript
import { createHighlight } from '@jadesrochers/reacthelpers'
import { GeoSvg, BaseMap, ToolTipMap } from '@jadesrochers/geomap'
const CustomGeo = (props) => {
  const [highlight, deHighlight] = createHighlight()
  const geodata = useLoadgeo(props.getstates,'state')
  if( ! geostate){
    return null
  }
  return(
    <GeoSvg key='mapkey'
      topology={ geodata }
      topopath={'pathtotopoloy'}
      styling={props.style}
      datastyling={props.datastyle}
      datadecorate={ props.statedatacolor ? props.statedatacolor : quantile(GnYlRd73) }
      highlight={highlight({'stroke-width':2, fill:'#5d6d7e'})}
      deHighlight={deHighlight}
      { ...props }
    />
  )
}

const CustomMap = (props) => {
  console.log('Hit UsState, props: ',props)
  return(
   <BaseMap 
     projection={ props.projection ? props.projection : projectAlbersUsa }
     scaling={props.scaling ? props.scaling : 1000}
     { ...props }
   >
     <ToolTipMap key='countytooltip' >
       <CustomGeo key="statemap"
         style={props.statestyle} 
         datastyle={props.statedatastyle} 
       />
     </ToolTipMap>
   </BaseMap>
  )
}
```
