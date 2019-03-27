/**
 * 这个文件可以修改packing配置文件的默认设置
 * 默认配置请看 `node_modules/packing/config/packing.js`
 *
 * @param object packing 默认配置对象
 */

import path from 'path';
import packingGlob from 'packing-glob';

export default (packing) => {
  const p = packing;

  p.stylelint.enable = false;
  p.eslint.enable = false;
  p.visualizer.enable = true;

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
