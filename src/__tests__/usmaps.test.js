import React from 'react';
import * as R from 'ramda'
import { shallow, mount } from '../enzyme';
import { UsCounty, UsState } from '../usmaps'
import { act } from 'react-dom/test-utils';
import * as topojson from 'topojson'
import countygeojson from './gz_2010_usCounty_20m.json'
import stategeojson from './gz_2010_usState_20m.json'

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

  test('Render the UsCounty map (also has states)', async () => {
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
       <UsCounty
         geodata={undefined}
         statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
         statedatastyle={{ stroke: '#323535', strokeLinejoin: 'round'}}
         countystyle={{ fill: '#f4f6f6', stroke: '#ccd1d1' }}
         countydatastyle={{ stroke: '#bcc6c6' }}
         limitHook={{xlimits: {min: 0, max: 100}}}
         getstates={stateProm}
         getcounties={countyProm}
       >
       </UsCounty>
    </svg>)  
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(75)
  });

  test('Render the UsState map; takes states only', async () => {
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
       <UsState
         geodata={undefined}
         statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
         statedatastyle={{ stroke: '#323535', strokeLinejoin: 'round'}}
         limitHook={{xlimits: {min: 0, max: 100}}}
         getstates={stateProm}
       >
       </UsState>
    </svg>)  
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(25)
  });

})


