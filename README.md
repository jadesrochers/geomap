## Geomap; creating interactive geographic maps from svg  
This package allows creating maps from geojson features. The maps can be  
colorized based on data and tooltip/zoom+pan can be set up readily.  

#### The inputs needed are geographic features and data -  
The package is designed to try and handle all the map setup and appearance,  
but it needs the geographic features in the form of geojson.  
It needs a data object with GEO_ID: data pairs if you want to display data.  

#### There are preset US maps  
I set up the projection/scaling for some UsMap setups.  
1. UsCounty 
This map does US Counties and state outlines. If data is added, it is  
assumed to be for the counties.  
2. UsState  
US states, no counties. Any data added will be used for the states.   
3. UsCountyOnly  
This map does counties without state boundaries.  
**Example here**  
[US State map with generated data](https://codesandbox.io/s/usstate-data-interactive-map-koe14)

#### CustomMap component can be used to create any map you like  
This component makes no assumption about what geographic features you  
want to display, but this also means you will need to handle projection,  
scaling, and possibly the viewBox.  

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
You will need to import the CustomMap component, have your own data set up,  
and provide a projection/scaling info.  
The example I show here is for setting up a world map, but the process is  
similar regardless of the map.
**Example of this map on codesandbox**  
[US State map with generated data](https://codesandbox.io/s/worldmapreactinteractive-7mhnx)
**Other facets to specify -**  
1. featurekey - This indicates a key that will be used to get a value  
from each feature's properties for data/id purposes.  
Must be found in each feature.properties.  
Data object must have { feature.properties[featurekey]: value }.  
2. tooltipkey - This value will be used to get the name to display  
on the tooltip. Also looks in feature.properties for this.  
3. Projection - You need to set up and pass this.  
The projection config, scaling, and viewxsize/viewysize args should be enough  
to get any map adjusted.  
```javascript
import { CustomMap } from "@jadesrochers/geomap";

const projectEqualEarth = scale =>
  geoEqualEarth()
    .scale(scale)
    .translate([350, 250]);

const WorldMap = props => {
  let worldgeo = {
    type: worldgeojson["type"],
    features: worldgeojson["features"]
  };

  let randdata = worldgeo.features.map(feat => {
    let item = {};
    item[feat.properties.sov_a3] = Math.random() * 100;
    return item;
  });
  let data = R.mergeAll(randdata);

  return (
    <CustomMap
      projection={projectEqualEarth}
      featurename={"countries"}
      featurekey={'sov_a3'}
      tooltipkey={"name_sort"}
      scaling={180}
      getgeofeat={worldgeo}
      geodata={data}

      legendstyle={{
        width: "100%",
        height: "40px",
        fontSize: "0.8em",
        padding: "0 0 5px 0"
      }}
      styling={{
        fill: "#f4f6f6",
        stroke: "#707b7c",
        strokeLinejoin: "round"
      }}
      datastyling={{
        stroke: "#323535",
        strokeLinejoin: "round"
      }}
      limitHook={{ xlimits: { min: 0, max: 100 } }}
      {...props}
    />
  );
};
```

#### Where to get projections -  
d3-geo is a good location. Anywhere that can tranform lat/long into projected
coordinates is fine, it just needs to provide infromation that can be plotted  
on svg. 

#### Sizing maps -  
By default, it will occupy as much space as it is given.  
You can pass width/height args, or reduce the space it has, as it should  
scale to any space fairly well.  
