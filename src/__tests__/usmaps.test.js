/* jest.mock('../reqs') */
// These errors are correct in every case, but not with a mock
// above the imports. It needs to be there.
import React from 'react';
import * as R from 'ramda'
import { shallow, mount } from '../enzyme';
import { UsStateandCounty } from '../usmaps'
import { act } from 'react-dom/test-utils';
/* import { fetchGeoJson } from '../reqs' */
import * as topojson from 'topojson'
import countygeojson from './gz_2010_usCounty_20m.json'
import stategeojson from './gz_2010_usState_20m.json'

/* As is the problem anywhere the useEffect occurs, even though */
/* the __mock__ for reqs appears to be working here the fact */
/* that the data is grabbed in a useEffect means I need to wait for */
/* the async version of act() to come out to test. */
/* I may also need to import UsStateMap/UsCountyMap and */
/* test them independently, but for now leaving as is. */

describe('svgtool tests',  () => {
  test('Render a tooltip, check coordinates', async () => {
    let stateProm = () => {  
      let stateselection = {type: stategeojson['type'], features: R.slice(0,25,stategeojson['features'])}
      /* console.log('state topology arcs length:\n\n',statedata.arcs.length) */
      /* console.log('state selection:\n\n',stateselection) */
      return Promise.resolve(stateselection)  
    }

    let countyProm = () => {  
      let countyselection = {type: countygeojson['type'], features: R.slice(0,50,countygeojson['features'])}
      /* console.log('county topology arcs length:\n\n',countydata.arcs.length) */
      /* console.log('county data:\n\n',countydata) */
      return Promise.resolve(countyselection)  
    }


    /* console.log('Is mock working: ', stategeojson) */
    /* let statedata = topojson.topology({county: countygeojson}) */
    let wrapper
    await act( async () => {
      wrapper = mount(<svg>
       <UsStateandCounty
         geodata={undefined}
         /* limitHook={limitHook} */
         statestyle={{ fill: 'none', stroke: '#707b7c', strokeLinejoin: 'round'}}
         countystyle={{ fill: '#f4f6f6', stroke: '#ccd1d1' }}
         limitHook={{xlimit: [0,0]}}
         getstates={stateProm}
         getcounties={countyProm}
       >
       </UsStateandCounty>
    </svg>)  
    })
    wrapper.update()
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('path').length).toEqual(75)
  });
})


