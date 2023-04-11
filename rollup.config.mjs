import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";
import filesize from 'rollup-plugin-filesize';


export default {
    input: './src/index.js',
    external: ['react', '@emotion/react', '@jadesrochers/legends', '@jadesrochers/reacthelpers', '@jadesrochers/selectbox', 'd3-array', 'd3-geo', 'd3-scale', 'ramda', 'topojson-client', 'topojson-server'],
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
        nodeResolve(),
        commonjs(),
        terser(),
        filesize(),
    ]
}
