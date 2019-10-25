const axios = require('axios')
const config = require('./config')
const R = require('ramda')

let settings = {}
/* settings.baseURL = config.expressurl */
/* console.log('baseURL is: ',config.expressurl) */
settings.timeout = 3000
// 10 Mb max for response from express.
settings.maxContentLength = 10 * 1000 * 1000
const getAxiosInst = (settings) => {
  return axios.create({
    ...settings,
  })
}
const axiosBase = getAxiosInst(settings)

const retryOnError = async (num, getter) => {
    let count = 0, response
    do{
      count++;
      try{
        response = await getter()
      }catch(err){
    
      }
    }while(! response && count <= num)
    if(response === "error"){
      throw new Error('Request failed after ',num,' attempts')
    }
    return response
}

const fetchGeoJson = async (scalestr,config={}) => {
  let rslt = await axiosBase.get('/api/geojson/?geotype=' + scalestr, config) 
  return rslt.data
}

const retryGeoJson = async (scalestr, num, config={}) => {
  let rslt = await retryOnError(num, () => axiosBase.get('/api/geojson/?geotype=' + scalestr, config ) )
  console.log('reqs retryGeoJson rslt: ',rslt)
  return rslt.data
}

const fetchZillowdata = R.curry(async (input,config={}) => {
  let rslt = await axiosBase.get('/api/zillowdata/' + makeQuery(input), config) 
  return rslt.data
})

const retryZillowdata = async (input, num, config={}) => {
  console.log('retryZillowdata input: ', input)
  let rslt = await retryOnError(num, () => axiosBase.get('/api/zillowdata/' + makeQuery(input), config ) )
  return rslt.data
}

const fetchFieldOptions = R.curry(async (input,config={}) => {
  let rslt = await axiosBase.get('/api/zillowdata/distinctvalues' + makeQuery(input), config) 
  return rslt
})

const retryFieldOptions = async (input, num, config={}) => {
  let rslt = await retryOnError(num, () => axiosBase.get( '/api/zillowdata/distinctvalues' + makeQuery(input), config ) )
  console.log('reqs retryFieldOptions rslt: ',rslt)
  return rslt
}

const fetchVarOptions = R.curry(async (input,config={}) => {
  let rslt = await axiosBase.get('/api/zillowdata/distinctvariables' + makeQuery(input), config) 
  return rslt
})

const retryVarOptions = async (input, num, config={}) => {
  let rslt = await retryOnError(num, () => axiosBase.get('/api/zillowdata/distinctvariables' + makeQuery(input), config ) )
  console.log('reqs retryVarOptions rslt: ',rslt)
  return rslt
}

// Distribute single value to values in array and join.
const distributeValue = R.pipe(
  input => R.adjust(0,R.flip(R.repeat)(input[1].length))(input),
  param => R.zip(param[0], param[1]),
  R.map(R.join('=')),
  R.join('&')
)

// Pass object with each parameter name and value, or array of values
const makeQuery = R.pipe(
  R.toPairs,
  R.map(R.ifElse(
   input => Array.isArray(input[1]),
   distributeValue, 
   R.join('='),
   )),
  R.join('&'),
  R.concat('?'), 
)

export { fetchZillowdata, fetchGeoJson, fetchFieldOptions, retryOnError, makeQuery, fetchVarOptions, retryGeoJson, retryZillowdata, retryFieldOptions, retryVarOptions} 
