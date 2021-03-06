import React from 'react';
import * as R from 'ramda'
import { mount } from '../enzyme';
import { matchers } from '@emotion/jest'  
import { CustomMap } from '../custommap'
import { act } from 'react-dom/test-utils';
import stategeojson from './gz_2010_usState_20m.json'

expect.extend(matchers)  


describe('custom map tests',  () => {
  const stateProm = () => {  
    const stateselection = {type: stategeojson.type, features: R.slice(0,25,stategeojson.features)}
    return Promise.resolve(stateselection)  
  }

  test('Render the Custom map; takes any data, bounds, scaling', async () => {
    let wrapper
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

    await act( async () => {
      wrapper = mount(<svg>
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
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(27)
    expect(wrapper.find('GeoSvg').at(0).props()).toHaveProperty('viewBox','0 0 300 200')
    expect(wrapper.find('GeoMap').at(0).props()).toHaveProperty('scaling',500)
    expect(wrapper.find('GeoFeature').at(10)).toHaveStyleRule('stroke','#44b64c')
    expect(wrapper.find('GeoFeature').at(10)).toHaveStyleRule('fill','#238443')

    expect(wrapper.find('GeoFeature').at(20)).toHaveStyleRule('stroke','#44b64c')
    expect(wrapper.find('GeoFeature').at(20)).toHaveStyleRule('fill','#78c679')

  });
})
