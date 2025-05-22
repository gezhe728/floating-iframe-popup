import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import less from 'rollup-plugin-less';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
  // UMD版本（浏览器可用）
  {
    input: 'src/index.js',
    output: {
      name: 'FloatingIframePopup',
      file: pkg.browser,
      format: 'umd',
      exports: 'default'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env']
      }),
      less({
        output: false,
        insert: true
      })
    ]
  },
  // UMD压缩版本
  {
    input: 'src/index.js',
    output: {
      name: 'FloatingIframePopup',
      file: pkg.browser.replace('.js', '.min.js'),
      format: 'umd',
      exports: 'default'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env']
      }),
      less({
        output: false,
        insert: true
      }),
      terser()
    ]
  },
  // CommonJS和ES Module版本
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs', exports: 'default' },
      { file: pkg.module, format: 'es', exports: 'default' }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      less({
        output: false,
        insert: false
      })
    ]
  }
]; 