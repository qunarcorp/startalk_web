/**
 * 这个文件可以修改packing配置文件的默认设置
 * 默认配置请看 `node_modules/packing/config/packing.js`
 *
 * @param object packing 默认配置对象
 */

import path from 'path';
import packingGlob from 'packing-glob';
import webConfig from '../web_config';

export default (packing) => {
  const p = packing;

  p.stylelint.enable = false;
  p.eslint.enable = false;
  p.visualizer.enable = true;

  // 网站自定义配置
  p.rewriteRules = {
    // 网站URL与模版的对应路由关系
    '^/$': '/index',

    // '^/debug$': '/debug.pug',

    '^/api/(.*)': webConfig.apiurl+'/$1',
    '^/ops/(.*)': webConfig.javaurl+'/ops/$1',
    '^/s/(.*)': webConfig.javaurl+'/s/$1',
    '^/file/(.*)': webConfig.fileurl+'/file/$1',
    '^/package/(.*)': webConfig.javaurl+'/package/$1'


    // '^/package/(.*)': 'http://qt.darlyn.com/package/$1',
    // API转发
    // '^/api/(.*)': 'require!/mock/api/$1.js'
  };

  p.path.entries = () => {
    const entryFileName = 'entry.js';
    const entryPath = 'src/app/pages';
    const entryPattern = `**/${entryFileName}`;
    const cwd = path.resolve(entryPath);
    const config = {};
    packingGlob(entryPattern, { cwd }).forEach((page) => {
      const key = page.replace(`/${entryFileName}`, '');
      config[key] = path.join(cwd, page);
    });
    return config;
  };

  // 开发环境端口号
  p.port.dev = 5002;

  return p;
};
