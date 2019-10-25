import statedata  from '../components/__tests__/gz_2010_usState_20m.json'
import countydata from '../components/__tests__/gz_2010_usCounty_20m.json'
/* const reqs = jest.requireActual('../reqs') */

/* console.log('Mocking the reqs module') */
let reqs = {}

let fetchGeoJson = jest.fn((type) => {
  if(type === 'county'){
    return countydata
  }else if(type === 'state'){
    return statedata
  }
})

reqs.fetchGeoJson = fetchGeoJson

module.exports = { fetchGeoJson }
