/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-12 16:54:37
 * @LastEditors: Please set LastEditors
 */

/**
 * qtlk sdk
 */
const { baseaddess: {domain, xmpp, xmppmport, fileurl, javaurl, socketurl} = {} } = startalkNav


const sdk = new window.QtalkSDK({
  // 调试
  debug: true,
  xmpp: xmpp,
  // 链接配置
  connect: { 
    host: socketurl
  },
  maType: 6 // 平台类型web端：6
});

export default sdk;
