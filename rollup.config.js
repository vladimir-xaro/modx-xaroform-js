import scss from "rollup-plugin-scss";
import { terser } from "rollup-plugin-terser";
// import postcss from "rollup-plugin-postcss";
// import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import { deepmerge } from 'deepmerge';

// import multiInput from 'rollup-plugin-multi-input';

const XARO_ASSETS_PATH      = 'dist/';
const XARO_FILENAME         = 'xaroform';
const XARO_VERSION          = '0.0.1-pl';
const XARO_PLUGINS_SRC_DIR  = 'src/plugins/';
const XARO_PLUGINS_OUT_DIR  = `${XARO_ASSETS_PATH}plugins/`;
const XARO_PLUGINS          = [ 'RecaptchaV3' ];

let pluginsConfig = [];
for (const plugin of XARO_PLUGINS) {
  pluginsConfig.push({
    input: `${XARO_PLUGINS_SRC_DIR}${plugin}.ts`,
    output: {
      sourcemap: true,
      file: `${XARO_PLUGINS_OUT_DIR}${plugin}.js`,
      format: 'es',
      name: plugin,
    },
    plugins: [
      typescript({
        target: 'esnext'
      }),
      terser({
        format: {
          indent_level: 2,
          beautify: true,
          comments: false,
        },
        mangle: false,
      }),
    ],
  })
}

let config = [{
  input: 'src/index.ts',
  output: [{
    sourcemap: true,
    file: `${XARO_ASSETS_PATH}${XARO_FILENAME}.es.js`,
    format: 'es',
    name: 'XaroForm',
  }],
  plugins: [
    typescript({
      target: 'esnext'
    }),
    scss({
      watch: 'src/scss/',
      output: `${XARO_ASSETS_PATH}css/${XARO_FILENAME}.css`,
      failOnError: true,
    }),
    terser({
      format: {
        indent_level: 2,
        beautify: true,
        comments: false,
      },
      mangle: false,
    }),
  ],
}];
config.push(...pluginsConfig);


export default config;