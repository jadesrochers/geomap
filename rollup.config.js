import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { terser } from "rollup-plugin-terser";

export default {
    input: './src/index.js',
    external: ['react', '@emotion/core', '@jadesrochers/legends', '@jadesrochers/reacthelpers', '@jadesrochers/selectbox', 'd3-array', 'd3-geo', 'd3-scale', 'ramda', 'topojson-client', 'topojson-server'],
    output: [
      {
          format: 'umd',
          file: './dist/geomap-umd.js',
          name: 'geomap',
      },
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        resolve(),
        commonjs(),
        terser(),
        filesize(),
    ]
}
