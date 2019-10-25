/*
 * @Description: In User Settings Edit
 * @Author: chaos.dong
 * @Date: 2019-10-25 21:14:24
 * @LastEditTime: 2019-08-13 17:32:30
 * @LastEditors: Please set LastEditors
 */
import dayjs from 'dayjs';
import publicEncrypt from '../common/utils/publicEncrypt';
import axios from 'axios';

const pubKeyFullkey = startalkKeys.pub_key_fullkey
const webConfig = {
  loginType: startalkNav.Login && startalkNav.Login.loginType,
  domain: startalkNav.baseaddess && startalkNav.baseaddess.domain,
}

/**
 * 密码加密
 */

// 公钥 sdkConfig.pub_key_fullkey

const encrypt = raw => (
  publicEncrypt({
    key: pubKeyFullkey,
    padding: 1
  }, raw).toString('base64')
);

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

export default (username, password) => { 
  if (webConfig.loginType === 'password') {
    const uinfo = {
      p: password,
      a: 'testapp',
      u: username,
      d: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };
    // eslint-disable-next-line
    const encrypted = encrypt(new Buffer(JSON.stringify(uinfo)));
    return encrypted.toString('base64');

  } else if (webConfig.loginType === 'newpassword') {
    const newEncrypted = encrypt(new Buffer(password));
    const requestData = {
      p: newEncrypted,
      h: webConfig.domain,
      u: username,
      mk: generateUUID(),
      plat: "web"
    };

    return new Promise((resolve, reject) => {
      axios({
        url: '/newapi/nck/qtlogin.qunar',
        method: 'POST',
        data: requestData
      }).then(res => {
        const data = [res.data.data.t,requestData.mk]
        resolve(data);
      }).catch(e => {
        console.info(e)
      })
    })
  }
};
