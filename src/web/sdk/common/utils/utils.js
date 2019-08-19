/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 21:14:24
 * @LastEditTime: 2019-08-12 17:03:03
 * @LastEditors: Please set LastEditors
 */
import $ from 'jquery';

const sdkConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}

const checkUpLoadFileExist = (url) => {
  return $.ajax({
    url,
    type: 'GET',
    dataType: 'json',
    data: {},
    jsonp: 'callback'
  });
};

const isObject = (o) => {
  return Object.prototype.toString.call(o) === '[object Object]';
};
/**
 * 配置混入
 * originObject => { a: 1, b: { c: 1, d: 2}}
 * newObject = { a: 2, b: {c: 2} }
 * return => {a: 1, b: { c:2, d: 2}}
 */
const configMix = (originObject, newObject) => {
  const ret = Object.assign({}, originObject);
  Object.keys(newObject).forEach((key) => {
    if (ret[key] === undefined) {
      return;
    }
    if (isObject(ret[key])) {
      ret[key] = configMix(ret[key], newObject[key]);
    } else {
      ret[key] = newObject[key];
    }
  });
  return ret;
};

const isSupportWebSocket = !!(window.WebSocket && window.WebSocket.prototype.send);

/**
 * 反转枚举
 */
const reverseEnum = (o) => {
  const reverse = {};
  Object.keys(o).forEach((key) => {
    reverse[o[key]] = key;
  });
  return reverse;
};

const createUUID = () => {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid.toUpperCase();
};

const getEmoticonsUrl = (shortcut, category = 'EmojiOne') => {
  if (!shortcut || shortcut.length == 0) {
    return '';
  }

  return sdkConfig.fileurl+`/file/v1/emo/d/e/${category}/${shortcut.replace('/', '')}/org`;
};

const bytesToMB = (bytes) => {
  if (bytes === 0) {
    return '1';
  }
  const m = 1024 * 1024;
  let result = Math.floor(bytes / m);
  if (result < 1) { // 如果小于1都为1
    result = 1;
  }
  return result;
};

const bytesToSize = (bytes) => {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
};

const audioPlayer = (() => {
  let player;
  const id = createUUID();
  // const file = sdkConfig.fileurl+'/zhuanti/20180423_qtalk_msg.mp3';
  const file = "../assets/20180423_qtalk_msg.mp3";
  const init = () => {
    if (!player) {
      player = window.document.createElement('audio');
      player.id = id;
      const mp3 = document.createElement('source');
      mp3.src = file;
      mp3.type = 'audio/mpeg';
      player.appendChild(mp3);
      window.document.body.appendChild(player);
    }
  };
  return () => {
    init();
    player.play();
  };
})();

const getCookie = (name) => {
  const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
  const arr = window.document.cookie.match(reg);
  if (arr) {
    return unescape(arr[2]);
  }
  return null;
};

// 将base64转换为文件
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  // eslint-disable-next-line
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new window.File([u8arr], filename, { type: mime });
};

const utils = {
  configMix,
  isObject,
  isSupportWebSocket,
  reverseEnum,
  createUUID,
  getEmoticonsUrl,
  bytesToMB,
  bytesToSize,
  checkUpLoadFileExist,
  audioPlayer,
  getCookie,
  dataURLtoFile
}

export {
  configMix,
  isObject,
  isSupportWebSocket,
  reverseEnum,
  createUUID,
  getEmoticonsUrl,
  bytesToMB,
  bytesToSize,
  checkUpLoadFileExist,
  audioPlayer,
  getCookie,
  dataURLtoFile
};

export default utils
