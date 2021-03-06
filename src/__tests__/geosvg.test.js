import React from 'react';
import { mount } from '../enzyme';
import { GeoSvg } from '../geosvg'
import { topology } from 'topojson-server'
import * as R from 'ramda';
import countygeojson from './gz_2010_usCounty_20m.json'
import { geoAlbersUsa } from 'd3-geo'

const projectAlbersUsa = geoAlbersUsa().scale(1000)

describe('svgtool tests', () => {
  test('Render a tooltip, check coordinates', () => {
    let countyselection = {type: countygeojson['type'], features: R.slice(0,50,countygeojson['features'])}
    /* console.log('Choose data: ', countyselection) */
    let countydata = topology({county: countyselection})
    let wrapper = mount(<svg>
     <GeoSvg 
      key='testfeatures'
      topology={ countydata }
      topopath={'county'}
      projection={ projectAlbersUsa }
      dataselect='CENSUSAREA'
      scaling={900}
      width={300} 
      height={200}
     />
    </svg>) 
    /* console.log(wrapper.debug()) */
    // I could check some paths in more detail,
    // but this gives a pretty good idea with much less work.
    expect(wrapper.find('path').length).toEqual(50)
    expect(wrapper.find('GeoFeature').at(0).props()).toHaveProperty('dataselect','CENSUSAREA')
    expect(wrapper.find('GeoFeature').at(0).props()).toHaveProperty('scaling',900)
    expect(wrapper.find('GeoFeature').at(0).props()).toHaveProperty('width',300)
    expect(wrapper.find('GeoFeature').at(0).props()).toHaveProperty('height',200)

  });

})


