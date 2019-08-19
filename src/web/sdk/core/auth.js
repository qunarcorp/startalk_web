/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 21:14:24
 * @LastEditTime: 2019-08-13 17:32:30
 * @LastEditors: Please set LastEditors
 */
import dayjs from 'dayjs';
import publicEncrypt from '../common/utils/publicEncrypt';


const pubKeyFullkey = startalkKeys.pub_key_fullkey

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

export default (username, password) => {
  const uinfo = {
    p: password,
    a: 'testapp',
    u: username,
    d: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };

  // eslint-disable-next-line
  const encrypted = encrypt(new Buffer(JSON.stringify(uinfo)));

  return encrypted.toString('base64');
};
