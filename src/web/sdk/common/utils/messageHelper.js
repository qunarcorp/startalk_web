/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 21:14:24
 * @LastEditTime: 2019-08-12 17:02:36
 * @LastEditors: Please set LastEditors
 */
import { getEmoticonsUrl, createUUID } from './utils';
import $ from 'jquery';

const sdkConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}
/**
 * 消息转换处理
 */

// 取出 type value width height
const OBJ_RE = /\[obj type=\"(.*?)\" value=\"\[?(.*?)\]?\"( width=(.*?) height=(.*?))?.*?\]/g;
const URL_RE = /\b(https?:\/\/|www\.|https?:\/\/www\.)[^\s<]{2,200}\b/g;
const IMG_RE = /<(img|IMG) src=\"(.*?)\" data-emoticon=\"(.*?)\".*?>/g;

/**
 * 编码
 * <img => [obj type="img" value="src"]
 * url => [obj type="url" value="url"]
 * &nbsp; => ' '
 *
 */
const encode = (content) => {
  const objcache = {};
  content = content.replace(/&nbsp;/g, ' '); // 空格
  content = content.replace(/\n\s*\n/g, '\n'); // 回车
  content = content.replace(/\n/g, '');
  content = content.replace(/<br[^>]*>/ig, '\n'); // 回车
  // 只保留 img
  content = content.replace(/(<[^>]*>)/g, ($0, $1) => {
    // 因为要替换 url ，图片地址也属于 url，所以先把img替换掉并缓存起来
    if (/<img[^>]*>/gi.test($1)) {
      const uuid = createUUID();
      let src = $1.match(/src="(.*?)"/);
      let emoticon = $1.match(/data-emoticon="(.*?)"/);
      let categery = $1.match(/data-categery="(.*?)"/);
      let type = $1.match(/data-type="(.*?)"/);
      if (!src && !src[1]) {
        return '';
      }
      src = src[1];
      if (emoticon && emoticon[1]) {
        emoticon = `[${emoticon[1]}]`;
      }
      if (categery && categery[1]) {
        categery = categery[1];
      }
      if (type && type[1]) {
        type = type[1];
      }
      // 表情
      if (emoticon && categery) {
        objcache[uuid] = `[obj type="emoticon" value="${emoticon}" width=${categery} height=0]`;
      } else if (type === 'base64') {
        objcache[uuid] = `[obj type="base64" value="${src}"]`;
      } else {
        objcache[uuid] = `[obj type="image" value="${src}"]`;
      }
      return uuid;
    } else {
      return '';
    }
  });
  // 兼容客户端，需要转回来
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '\'');
  content = content.replace(/&amp;/g, '&');
  // 编码URL
  const list = content.match(URL_RE);
  if (list) {
    for (let i = 0; i < list.length;) {
      const prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
      const escapedUrl = encodeURI(decodeURI(list[i])).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
      const uuid = createUUID();
      objcache[uuid] = `[obj type="url" value="${prot}${escapedUrl}"]`;
      content = content.replace(list[i], uuid);
      i += 1;
    }
  }
  // 把img替换回来
  Object.keys(objcache).forEach((key) => {
    content = content.replace(key, objcache[key]);
  });
  return $.trim(content);
};

// 解码
const decode = (content, msgType) => {
  if (!content) {
    return '';
  }
  if (msgType.toString() === '5') {
    let file;
    try {
      file = JSON.parse(content);
    } catch (e) {
      return content;
    }
    const { FileName, HttpUrl } = file;
    let url = HttpUrl;
    if (url.indexOf('http') === -1) {
      url = sdkConfig.fileurl + url;
    }
    // 文件都是单行数据
    return `<a title="file" target="_blank" href="${url}" style="text-decoration:underline;">${FileName}</a>`;
  }
  content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  content = content.replace(OBJ_RE, (...args) => {
    if (args && args.length > 2) {
      let ret = args[0];
      const type = args[1];
      let val = args[2];
      const width = args[4];
      switch (type) {
        case 'image':
          if (val.indexOf('http') === -1) {
            val = sdkConfig.fileurl + val;
          }
          ret = `<a title="image" href="${val}" target="_blank"><img src="${val}" alt="" /></a>`;
          break;
        case 'emoticon':
          ret = `<img src="${getEmoticonsUrl(val, width)}" data-emoticon="${val}" data-categery="${width}" width="24" height="24" title="emoticon" alt="" />`;
          break;
        case 'url':
          ret = `<a title="url" target="_blank" href="${val}" style="text-decoration:underline;">${val}</a>`;
          break;
      }
      return ret;
    }
  });
  return content;
};

/**
 * 过滤
 * [obj type="image" ...]   =>  [图片]
 * [obj type="file" ...]   =>  [文件]
 * [obj type="emoticon" ...]   =>  [表情]
 */
const filter = (content, msgType = '') => {
  if (!content) {
    return '';
  }
  if (msgType.toString() === '5') {
    return '[文件]';
  } else if (msgType.toString() === '666') {
    return '[分享]';
   }else if (content.indexOf('[') > -1) {
    content = content.replace(OBJ_RE, (...args) => {
      if (args && args.length > 2) {
        let ret = args[0];
        const type = args[1];
        if (type === 'image') {
          ret = '[图片]';
        } else if (type === 'emoticon') {
          ret = '[表情]';
        } else if (type === 'url') {
          ret = '[url]';
        }
        return ret;
      }
    });
  }
  return content;
};

export default {
  encode,
  decode,
  filter
};
