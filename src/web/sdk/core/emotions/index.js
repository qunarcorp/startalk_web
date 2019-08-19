/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-05 21:14:24
 * @LastEditTime: 2019-08-13 11:55:01
 * @LastEditors: Please set LastEditors
 */
import { oneEmotions } from './oneEmotions';

const sdkConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}

const emotions = [
  oneEmotions
];

function getEmoticons() {
  const ret = [];
  emotions.forEach((item) => {
    const df = item.FACESETTING.DEFAULTFACE;
    const ns = df.categoryNew || df['-categery'];
    const child = {
      name: df['-name'],
      width: df['-width'],
      height: df['-height'],
      categery: ns,
      faces: []
    };
    df.FACE.forEach((f) => {
      const shortcut = f['-shortcut'];
      child.faces.push({
        url: sdkConfig.fileurl+`/file/v1/emo/d/e/${ns}/${shortcut.replace('/', '')}/fixed`,
        shortcut,
        tip: f['-tip']
      });
    });
    ret.push(child);
  });
  return ret;
}

export default getEmoticons();
