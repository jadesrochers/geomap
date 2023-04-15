import React from 'react';
import * as R from 'ramda'
import { render, waitFor } from '@testing-library/react'
import { CustomMap } from '../custommap'
import stategeojson from './gz_2010_usState_20m.json'

describe('custom map tests',  () => {
    const stateProm = () => {  
        const stateselection = {type: stategeojson.type, features: R.slice(0,25,stategeojson.features)}
        return Promise.resolve(stateselection)  
    }

    test('Render the Custom map; takes any data, bounds, scaling', async () => {
        const geofeatures = {
            type: stategeojson.type,
            features: stategeojson.features
        };

        const dataarr = Array.from({length: 60}, (v, k) => k+1); 
        let n = 0;
        const fakedata = geofeatures.features.map(feat => {
            const item = {};
            item[feat.properties.GEO_ID] = dataarr[n];
            n++;
            return item;
        });
        const data = R.mergeAll(fakedata);

        const { container } = render(<svg>
            <CustomMap
            getgeofeat={stateProm}
            data={data}
            featurename={'state'}
            viewxsize={300} 
            viewysize={200} 
            scaling={500}
            style={{ fill: 'none', stroke: '#45b3b3', strokeLinejoin: 'round'}}
            datastyle={{ stroke: '#44b64c', strokeLinejoin: 'round'}}
            limitHook={{xlimits: {min: 0, max: 100}}}
            >
            </CustomMap>
            </svg>)  
        const paths = await waitFor(() => container.getElementsByTagName('path'))
        expect(paths.length).toEqual(27)
    });
})
