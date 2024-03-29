// This is possible because of a webpack resolve alias that points
// geomap to ../../src/index.js
import { UsMap, UsStateMap, UsCountyMap } from "geomap";
import React, { useEffect, useState } from "react";
import * as R from "ramda";
import countygeojson from "../geojson/gz_2010_usCounty_20m.json";
import stategeojson from "../geojson/gz_2010_usState_20m.json";
import styles from "./countymap.module.css";

/* const useLoadMap = path => { */
/*   const [geodata, setgeodata] = useState(undefined); */
/*   useEffect(() => { */
/*     const datagetter = async () => { */
/*       let rawgeo = await fetch(path); */
/*       rawgeo = await rawgeo.json(); */
/*       //console.log("the raw data: ", rawgeo); */
/*       let rsltgeo = { */
/*         type: rawgeo["type"], */
/*         features: rawgeo["features"] */
/*       }; */
/*       setgeodata(rsltgeo); */
/*     }; */
/*     datagetter(); */
/*   }, [path]); */
/*   return geodata; */
/* }; */


const CountySvg = props => {
  /* const path = "https://raw.githubusercontent.com/jadesrochers/geomap/master/src/__tests__/gz_2010_usState_20m.json"; */
  /* const path2 = "https://raw.githubusercontent.com/jadesrochers/geomap/master/src/__tests__/gz_2010_usCounty_20m.json"; */
  /* let stategeo = useLoadMap(path); */
  /* let countygeo = useLoadMap(path2); */
  // The datakey will determine the path for the topology in the output
  if ( !stategeojson || !countygeojson ) {
    return null;
  }

  const randdata = countygeojson.features.map(feat => {
    const item = {};
    item[feat.properties.GEO_ID] = Math.random() * 100;
    return item;
  });
  const data = R.mergeAll(randdata);
  /* console.log("Dataformat: ", data); */
  return (
    <UsMap
      data={data}
      getstates={stategeojson}
      getcounties={countygeojson}
      width="90vw"
      height="105vh"
      colorize={undefined}
      legendclasses={[styles.legendStyle]}
      barheight={27}
      formatter={input => Math.round(input)}
      stateclasses={[styles.stateStyle]}
      countyclasses={[styles.countyStyle]}
      countydataclasses={[styles.countyDataStyle]}
      tooltipwidth={200}
      tooltipheight={110}
      tooltiprectclass={[styles.tooltipRect]}
      tooltiptextclass={[styles.tooltipText]}
      limitHook={{ xlimits: { min: 0, max: 100 } }}
      clickFcn={props => console.log("Feature feature: ", props.feature)}
    />
  );
};


const CountyMap = props => {
  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        textAlign: 'center',
        width: "100%",
        fontSize: '1.3rem',
      }}
    >
      <div style={{ width: '500px' }} >
        <h2>US Data Map</h2>
        <p> React + d3-geo</p>
        <p>
          States and counties displayed, data at county level <br />
          data is randomly generated.
        </p>
        <p>
          State, county features can take style config <br />
          data style config can also be changed
        </p>
      </div>
      <CountySvg />
    </div>
  )
}

export { CountyMap };
