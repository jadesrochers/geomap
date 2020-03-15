import React from 'react';
import * as R from 'ramda'
import { mount } from '../enzyme';
import { UsMap, UsStateMap, UsCountyMap } from '../usmaps'
import { act } from 'react-dom/test-utils';
import countygeojson from './gz_2010_usCounty_20m.json'
import stategeojson from './gz_2010_usState_20m.json'
import { matchers } from 'jest-emotion'  
import { format } from 'd3-format';

expect.extend(matchers)  

// Note that when using the data files, I need to extract the type and  
// features in order to make it so the topojson.topology() fcn will work  
// to convert them into topology.  
describe('usmaps tests',  () => {
    let stateProm = () => {  
      let stateselection = {type: stategeojson['type'], features: R.slice(0,25,stategeojson['features'])}
      return Promise.resolve(stateselection)  
    }

    let countyProm = () => {  
      let countyselection = {type: countygeojson['type'], features: R.slice(0,50,countygeojson['features'])}
      return Promise.resolve(countyselection)  
    }

    const countyfeatures = {
      type: countygeojson.type,
      features: countygeojson.features
    };

    const dataarr = Array.from({length: 60}, (v, k) => k+1); 
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
         limitHook={{xlimits: {min: 0, max: 100}}}
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
    expect(wrapper.find('GeoFeature').at(10)).toHaveStyleRule('fill','#238443')
    expect(wrapper.find('GeoFeature').at(25)).toHaveStyleRule('fill','#addd8e')
    expect(wrapper.find('GeoFeature').at(40)).toHaveStyleRule('fill','#ffffcc')

    expect(wrapper.find('GeoSvg').at(0).props()).toHaveProperty('getstates')
    expect(wrapper.find('GeoSvg').at(1).props()).toHaveProperty('getcounties')

    expect(wrapper.find('GeoFeature').at(60)).toHaveStyleRule('stroke','#707b7c')
    expect(wrapper.find('GeoFeature').at(70)).toHaveStyleRule('fill','none')
    expect(wrapper.text().match(/[0-9\.]+/)[0]).toEqual('1.006.9012.818.724.630.536.442.348.254.160.0')

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

    expect(wrapper.find('GeoSvg').at(0).props()).toHaveProperty('getcounties')
  });

})


