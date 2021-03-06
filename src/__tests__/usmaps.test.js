import React from 'react';
import * as R from 'ramda'
import { mount } from '../enzyme';
import { UsMap, UsStateMap, UsCountyMap } from '../usmaps'
import { act } from 'react-dom/test-utils';
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
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
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
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(77)
    expect(wrapper.find('GeoFeature').at(10)).toHaveStyleRule('stroke','#bcc6c6')
    // make sure -1 and 0 get fill color
    expect(wrapper.find('GeoFeature').at(0)).toHaveStyleRule('fill','#005a32')
    expect(wrapper.find('GeoFeature').at(1)).toHaveStyleRule('fill','#005a32')
    // Then do a few spot checks of other values
    expect(wrapper.find('GeoFeature').at(10)).toHaveStyleRule('fill','#238443')
    expect(wrapper.find('GeoFeature').at(25)).toHaveStyleRule('fill','#addd8e')
    expect(wrapper.find('GeoFeature').at(40)).toHaveStyleRule('fill','#ffffcc')

    expect(wrapper.find('GeoFeature').at(60)).toHaveStyleRule('stroke','#707b7c')
    expect(wrapper.find('GeoFeature').at(70)).toHaveStyleRule('fill','none')
    expect(wrapper.text().match(/[0-9\.]+/)[0]).toEqual('1.005.2011.417.623.830.036.242.448.654.861.0')

  });

  test('Render the UsMap with custom threshold color scaling', async () => {
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
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
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(77)
    // make sure -1 and 0 get fill color
    expect(wrapper.find('GeoFeature').at(0)).toHaveStyleRule('fill','#78c679')
    expect(wrapper.find('GeoFeature').at(3)).toHaveStyleRule('fill','#addd8e')
    // Then do a few spot checks of other values
    expect(wrapper.find('GeoFeature').at(5)).toHaveStyleRule('fill','#d9f0a3')
    expect(wrapper.find('GeoFeature').at(7)).toHaveStyleRule('fill','#f7fcb9')
    expect(wrapper.find('GeoFeature').at(9)).toHaveStyleRule('fill','#ffffcc')

    expect(wrapper.find('GeoFeature').at(22)).toHaveStyleRule('fill','#e31a1c')
    expect(wrapper.find('GeoFeature').at(27)).toHaveStyleRule('fill','#bd0026')
  });



  test('Render the UsState map', async () => {
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
       <UsStateMap
         geodata={undefined}
         statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
         statedatastyle={{ stroke: '#323535', strokeLinejoin: 'round'}}
         limitHook={{xlimits: {min: 0, max: 100}}}
         getstates={stateProm}
       >
       </UsStateMap>
    </svg>)  
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(27)
  });

  test('Render the UsCounty map', async () => {
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
       <UsCountyMap
         geodata={undefined}
         countystyle={{ fill: '#f4f6f6', stroke: '#ccd1d1' }}
         countydatastyle={{ stroke: '#bcc6c6' }}
         limitHook={{xlimits: {min: 0, max: 100}}}
         getcounties={countyProm}
       >
       </UsCountyMap>
    </svg>)  
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(52)
    expect(wrapper.find('GeoFeature').at(10)).toHaveStyleRule('stroke','#ccd1d1')
    expect(wrapper.find('GeoFeature').at(20)).toHaveStyleRule('fill','#f4f6f6')

  });

})


