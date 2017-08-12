import nodeResolve from 'rollup-plugin-node-resolve';
import { globalsRegex, GLOBAL } from 'rollup-globals-regex';

export default {
  entry: 'dist/ngx-renderer.js',
  dest: 'dist/bundles/ngx-renderer.es2015.js',
  format: 'es',
  moduleName: 'ngxRenderer',
  plugins: [
    nodeResolve({ jsnext: true, browser: true })
  ],
  globals: globalsRegex({
    'tslib': 'tslib',
    [GLOBAL.NG2]: GLOBAL.NG2.TPL,
  }),
  external: (moduleId) => {
    if (/^(\@angular|tslib)\/?/.test(moduleId)) {
      return true;
    }

    return false;
  }
};
