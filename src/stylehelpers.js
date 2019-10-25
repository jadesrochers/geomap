import { scaleQuantile } from 'd3-scale';
import * as R from 'ramda';

const GnYlRd73 = [  '#005a32', '#238443', '#41ab5d', '#78c679', '#addd8e', '#d9f0a3', '#ffffcc', '#ffeda0', '#feb24c', '#f03b20']

const GnYlRd7 = [ '#1a9850', '#91cf60', '#d9ef8b', '#ffffbf', '#fee08b', '#fc8d59', '#d73027' ]
const GnYlRd9 = [ '#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d73027' ]
const YlOrRd7 = [  '#ffffb2',  '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026' ]

const quantile = R.curry((outputRange, data) => scaleQuantile().domain(R.values(data)).range(outputRange))

const shareStyling = (...infn) => {
  let original = {}
  let outfn = R.map(R.flip(R.partial)([original]))(infn) 
  return outfn 
}

const highlightStyling = R.curry(function(original,changes,current){
   let active = current.target;
   original.saved = R.pickAll(R.keys(changes), active.style)
   R.map(style => active.style[style[0]]=style[1])(R.toPairs(changes))
})

const deHighlightStyling = R.curry(function(original,current){
   let active = current.target;
   R.map(style => active.style[style[0]]=style[1])(R.toPairs(original.saved))
 })

// The 'original' arg is passed by shareStyling so the fcns can read/write
// to it
const [highlight, deHighlight] = shareStyling(highlightStyling, deHighlightStyling)

export { highlight, deHighlight, quantile, GnYlRd73, GnYlRd7, GnYlRd9, YlOrRd7 }

