/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-05 21:14:24
 * @LastEditTime: 2019-08-13 17:33:34
 * @LastEditors: Please set LastEditors
 */
import EventEmitter from 'events';
import auth from './auth';
import {
  isSupportWebSocket,
  reverseEnum
} from '../common/utils/utils';
import { Strophe } from './strophe';
import defaultOptions from '../options';

const { config: sdkConfig } = defaultOptions
const webConfig = {
  loginType: startalkNav.Login && startalkNav.Login.loginType
}

/**
 * 链接websocket或者http-bind
 */
class Connection extends EventEmitter {
  STATUS = {
    0: 'ERROR', // 连接错误
    1: 'CONNECTING', // 连接中
    2: 'CONNFAIL', // 连接失败
    3: 'AUTHENTICATING', // 认证中
    4: 'AUTHFAIL', // 认证失败
    5: 'CONNECTED', // 已连接
    6: 'DISCONNECTED', // 断开连接
    7: 'DISCONNECTING', // 断开连接中
    8: 'ATTACHED', // 已连接
    9: 'REDIRECT' // 连接转发
  };

  constructor(options) {
    super();
    this.options = options;
    this.STATUS_REVERSE = reverseEnum(this.STATUS);
    const { host, path, delay } = options;
    this.reconnectCount = 0;
    this.delay = delay;
    // let { protocol } = window.location;
    // let bind = 'http-bind';
    // if (isSupportWebSocket) {
    //   protocol = protocol === 'https:' ? 'wss:' : 'ws:';
    //   bind = 'websocket';
    // }
    // sdkConfig.httpurl
    // this.stropheConnection = new Strophe.Connection(`${protocol}//${host}${path}/${bind}`);
    this.stropheConnection = new Strophe.Connection(host || '');
  }

  connect(user, pwd, domain, autologin) {
    if (webConfig.loginType === 'password') {
      if (!autologin) {
        const buildPwd = auth(user, pwd);
        pwd = buildPwd;
      }
      if (!domain) {
        domain = sdkConfig.domain;
      }
      this.auth = { user, pwd };
      this.stropheConnection.connect(`${user}@${domain}`, pwd, this.onConnectStatusChange);
    } else if (webConfig.loginType === 'newpassword') {
      if (!domain) {
        domain = sdkConfig.domain;
      }
      if (!autologin) {
        auth(user, pwd).then(res => {   
          const token = res[0];                  
          const uinfo = {
            nauth: {
              p: token,
              u: `${user}@${domain}`,
              mk: res[1]
            }
          };
          pwd = JSON.stringify(uinfo);
          this.auth = { user, pwd };
          this.stropheConnection.connect(`${user}@${domain}`, pwd, this.onConnectStatusChange);
        })
      } else {
        this.auth = { user, pwd };
        this.stropheConnection.connect(`${user}@${domain}`, pwd, this.onConnectStatusChange);
      }
    }
  }

  reconnect() {
    const { jid, pass, wait, hold, route } = this.stropheConnection;
    if (this.reconnectCount >= this.options.reconnectCount) {
      return;
    }
    setTimeout(() => {
      this.reconnectCount += 1;
      this.emit('connect:reconnect');
      this.stropheConnection.connect(
        jid,
        pass,
        this.onConnectStatusChange,
        wait,
        hold,
        route
      );
      this.userDisConnection = false;
    }, this.delay);
  }

  /**
   * 主动断开链接
   */
  disConnection() {
    this.userDisConnection = true;
    if (this.stropheConnection.connected) {
      this.stropheConnection.disconnect();
    }
  }

  onConnectStatusChange = (status, condition) => {
    status = status.toString();
    if (status === this.STATUS_REVERSE.CONNECTED || status === this.STATUS_REVERSE.ATTACHED) {
      delete this.disconnection_cause;
      // 已连接
      this.emit('connect:success', this.stropheConnection);
    } else if (status === this.STATUS_REVERSE.DISCONNECTED) {
      if (this.disconnection_cause === this.STATUS_REVERSE.CONNFAIL) {
        // 因为连接失败而断开连接，则 重新连接
        this.reconnect();
      } else {
        // 已断开连接
        this.emit('connect:disconnected', this.stropheConnection);
      }
    } else if (status === this.STATUS_REVERSE.AUTHFAIL) {
      // 认证失败
      this.emit('connect:authfail', status, condition);
    } else if (status === this.STATUS_REVERSE.CONNFAIL) {
      // 连接失败
      if (!this.userDisConnection) {
        this.disconnection_cause = status; // 记录连接失败原因
      }
      this.emit('connect:fail', status, condition);
    }
    this.emit('connect', status, condition);
  };
}

export default Connection;
