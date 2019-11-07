## Geomap; creating interactive geographic maps from svg  
This package allows creating maps from geojson features. The maps can be  
colorized based on data and tooltip/zoom+pan can be set up readily.  

#### The inputs needed are geographic features and data -  
The package is designed to try and handle all the map setup and appearance,  
but it needs the geographic features in the form of geojson.  
#### The data/feature identifying key can be chosen; should be unique
By default the maps will use GEO_ID to give features unique keys and  
select data if a data object is passed. This must be found within each  
feature's properties.  
To use a different identifying key,the featurekey argument can be passed   
to any of the map components and it will be used instead of GEO_ID.  
#### Data should be an object with featurekey: data pairs -
For the components to correctly associate data with features, provide  
an object with the GEO_ID/featurekey values as keys and the data as values.  

#### There are preset US maps  
I set up the projection/scaling for some UsMap setups.  
1. UsMap  
This map does US Counties and state outlines. If data is added, it is  
used to colorize the counties.  
2. UsStateMap  
US states, no counties. Any data added will be used for the states.   
3. UsCountyMap  
This map does counties without state boundaries.  

**Example of UsStateMap**  
[US State map with generated data](https://codesandbox.io/s/usstate-data-interactive-map-koe14)

#### CustomMap component can be used to create any map you like  
This component makes no assumption about what geographic features you  
want to display, but this also means you will need to handle projection,  
scaling, and possibly the viewBox.  
There are defaults for these, but they are complete guesses.  

#### All Maps will take a colorizing function for data  
colorize={fcn} to specify a colorizing function. This is any fcn that will  
take all data values for config and returns a fcn that then takes single  
data values and returns a color that categorizes them.  
I have a default quantile colorizer set up.  

#### Using UsStateMap   
The only required argument is getstates, which is a function to get state  
outline data, or an object containing that data.  
Either is fine, and it will handle async retrieval of data.  
```javascript
const Map = props => {
  return (
      <UsStateMap
        data={data}
        colorize={colorfcn}
        getstates={stategeofcn}
        formatter={input => Math.round(input)}
        featurekey={'GEO_ID'}
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
3. data specifies the data to use; GEO_ID: data pairs in this case.  
4. Legendstyle indicates how to format the data legend.  

#### Using UsMap   
It works the exact same way as the states map, but needs both the state and  
county outline data.  
You can also configure the style for both state/county features.  
```javascript
const Map = props => {
  return (
      <UsMap
        data={data}
        colorize={colorfcn}
        getstates={stategeo}
        getcounties={countygeo}
        formatter={input => Math.round(input)}
        featurekey={'GEO_ID'}
        legendstyle={{
          width: "100%",
          height: "40px",
          fontSize: "0.8em",
          padding: "0 0 5px 0"
        }}
        statestyle={{ fill: "#f4f6f6", stroke: "#707b7c", strokeLinejoin: "round" }}
        countystyle={{ fill: "#f4f6f6", stroke: "#ccd1d1" }}
        countydatastyle={{
          stroke: "#323535",
          strokeLinejoin: "round"
        }}
      />
  );
};
```
1. statestyle sets styling for state features.  
2. countystyle sets styling for county features.  
3. countydatastyle sets county feature styling when they have data.  
4. legendstyle indicates how to format the data legend.  
5. data passes the data object to use  
6. featurekey indicates how to identify features and their data;  
will look at feature.properties.GEO_ID in this case.   
7. formatter - specifies how to format the data in toolip and on the legend  
8. getstates/getcounties specifies an object or function to get state/county  
geojson. It will try and handle objects/requests of all sorts well.  

**Example UsMap**  
[US map with generated data](https://codesandbox.io/s/us-data-choropleth-map-gul5q)

#### Creating your own custom map  
You will need to import the CustomMap component, have your own data set up,  
and provide a projection/scaling info.  
The example I show here is for setting up a world map, but the process is  
similar regardless of the map.
**Example of CustomMap, world map in this case**  
[World map with generated data](https://codesandbox.io/s/worldmapreactinteractive-7mhnx)
**Important args to specify -**  
1. featurekey - Non-us datasets will not have the GEO_ID default, so you  
will likely need to specify this. Must be found in each features properties,  
works best if the values are unique.  
2. tooltipkey - This value will be used to find the feature name to display  
on the tooltip. Also looks in feature.properties for this.  
3. Projection - You need to set up and pass this based on the data you  
are trying to display.  
4. Scaling - The default scaling is 1000, which will be wrong for most  
projects, so you will probably need to change it.  
5. getgeofeat - This is the argument to pass the geojson feature data to.  
6. Styling/datastyling - feature styling and feature with data styling.  

```javascript
import { CustomMap } from "@jadesrochers/geomap";
import { geoEqualEarth } from "d3-geo"

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
      featurename={'countries'}
      featurekey={'sov_a3'}
      tooltipkey={'name_sort'}
      scaling={180}
      getgeofeat={worldgeo}
      data={data}

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
