import React from 'react';
import * as R from 'ramda'
import { render, waitFor } from '@testing-library/react'
import { UsMap, UsStateMap, UsCountyMap } from '../usmaps'
import countygeojson from './gz_2010_usCounty_20m.json'
import stategeojson from './gz_2010_usState_20m.json'
import { matchers } from '@emotion/jest'  
import { format } from 'd3-format';
import { scaleThreshold } from "d3-scale";

expect.extend(matchers)  

// Note that when using the data files, I need to extract the type and  
// features in order to make it so the topojson.topology() fcn will work  
// to convert them into topology.  
describe('usmaps tests',  () => {
    const stateProm = () => {  
        const stateselection = {type: stategeojson.type, features: R.slice(0,25,stategeojson.features)}
        return Promise.resolve(stateselection)  
    }

    const countyProm = () => {  
        const countyselection = {type: countygeojson.type, features: R.slice(0,50,countygeojson.features)}
        return Promise.resolve(countyselection)  
    }

    const countyfeatures = {
        type: countygeojson.type,
        features: countygeojson.features
    };

    const CBgnrd13 = [ '#78c679', '#addd8e', '#d9f0a3', '#f7fcb9', '#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026' ]
    const threshold = R.curry((outputRange, data) => {
        return scaleThreshold() 
            .domain([ 2,4,6,8,10,12,14,16,18,20,25,30,40 ])
            .range(outputRange)
    });
    const thresholdr12 = threshold(CBgnrd13)

    // Create the fake data array; it will be from -1 to 60
    // so I can test neg, 0, positive
    const dataarr = []
    for (let i = -1; i <= 61; i++) {
        dataarr.push(i);
    }
    // This part sets the values in dataarr to the state GEO_IDs
    let n = 0;
    const fakedata = countyfeatures.features.map(feat => {
        const item = {};
        item[feat.properties.GEO_ID] = dataarr[n];
        n++;
        return item;
    });
    const data = R.mergeAll(fakedata);

    test('Render the UsMap (both states and counties)', async () => {
        const { container } = render(
            <svg>
            <UsMap
            data={data}
            statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
            statedatastyle={{ stroke: '#323535', strokeLinejoin: 'round'}}
            countystyle={{ fill: '#f4f6f6', stroke: '#ccd1d1' }}
            countydatastyle={{ stroke: '#bcc6c6' }}
            legendformatter={format('.3s')} 
            limitHook={{xlimits: {min: -1, max: 100}}}
            getstates={stateProm}
            getcounties={countyProm}
            >
            </UsMap>
            </svg>)  
        const paths = await waitFor(() => container.getElementsByTagName('path'))
        expect(paths.length).toEqual(77)
    });

    test('Render the UsMap with custom threshold color scaling', async () => {
        const { container } = render(
            <svg>
            <UsMap
            data={data}
            statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
            statedatastyle={{ stroke: '#323535', strokeLinejoin: 'round'}}
            countystyle={{ fill: '#f4f6f6', stroke: '#ccd1d1' }}
            countydatastyle={{ stroke: '#bcc6c6' }}
            legendformatter={format('.3s')} 
            limitHook={{xlimits: {min: -1, max: 100}}}
            getstates={stateProm}
            getcounties={countyProm}
            colorize={thresholdr12}
            >
            </UsMap>
            </svg>)  
        const paths = await waitFor(() => container.getElementsByTagName('path'))
        expect(paths.length).toEqual(77)
    });



    test('Render the UsState map', async () => {
        const { container } = render(
            <svg>
            <UsStateMap
            geodata={undefined}
            statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
            statedatastyle={{ stroke: '#323535', strokeLinejoin: 'round'}}
            limitHook={{xlimits: {min: 0, max: 100}}}
            getstates={stateProm}
            >
            </UsStateMap>
            </svg>)  
        const paths = await waitFor(() => container.getElementsByTagName('path'))
        // I don't use all the states for speed sake
        expect(paths.length).toEqual(27)
    });

    test('Render the UsCounty map', async () => {
        const { container } = render(<svg>
            <UsCountyMap
            geodata={undefined}
            countystyle={{ fill: '#f4f6f6', stroke: '#ccd1d1' }}
            countydatastyle={{ stroke: '#bcc6c6' }}
            limitHook={{xlimits: {min: 0, max: 100}}}
            getcounties={countyProm}
            >
            </UsCountyMap>
            </svg>)  

        const paths = await waitFor(() => container.getElementsByTagName('path'))
        expect(paths.length).toEqual(52)
    });

})


