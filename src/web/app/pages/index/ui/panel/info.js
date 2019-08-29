/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-08-13 12:08:26
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import Cookies from 'js-cookie';
import MessageBox from '../../../../common/components/message-box';
import actions from '../../actions';
import sdk from '../../sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}

@connect(
  state => ({
    userInfo: state.get('userInfo')
  }),
  actions
)
export default class Info extends Component {
  constructor() {
    super();
    this.state = {
      showMenu: false
    };
  }

  componentDidMount() {
    const { setUserInfo } = this.props;
    // 可以正常收发消息了
    sdk.ready(async () => {
      const res = await sdk.getUserCard([sdk.bareJid]);
      if (res.ret) {
        setUserInfo(res.data);
      }
    });
  }

  onShowUserCard = (e) => {
    const { setModalUserCard } = this.props;
    setModalUserCard({
      show: true,
      pos: {
        left: `${e.clientX}px`,
        top: `${e.clientY + 50}px`
      },
      user: sdk.bareJid
    });
  }

  onShowMembers = () => {
    const { setMembersInfo } = this.props;
    setMembersInfo({
      show: true,
      isNew: true
    });
    this.showMenu(false);
  }

  time = null;

  showMenu = (b) => {
    clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.setState({ showMenu: b });
    }, 100);
  };

  logout = () => {
    MessageBox.confirm(
      '确认退出?',
      '提示'
    ).ok(() => {
      let img = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png?w=80&h=80';
      const info = this.props.userInfo.get(sdk.bareJid);
      if (info) {
        img = info.get('imageurl') || '';
        if (!/^(https:|http:|\/\/)/g.test(img)) {
          img = `${webConfig.fileurl}/${img}`;
        }
      }
      Cookies.set('qt_avatar', img, { expires: 1 });
      Cookies.remove('qt_username');
      Cookies.remove('qt_password');
      sdk.connection.disConnection();
      this.props.changeChatField({ connectStatus: '' });
      window.location.reload();
    });
  }

  render() {
    const { userInfo } = this.props;
    let img = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png?w=80&h=80';
    let name = '';
    const info = userInfo.get(sdk.bareJid);
    if (info) {
      name = info.get('nickname') || '';
      img = info.get('imageurl') || '';
      if (!/^(https:|http:|\/\/)/g.test(img)) {
        img = `${webConfig.fileurl}/${img}`;
      }
    }
    return (
      <div className="header">
        <div className="avatar user-card" onClick={this.onShowUserCard}>
          <img className="img" src={img} alt="" />
        </div>
        <div className="info">
          <h3 className="nickname">
            <span className="display-name">{name}</span>
            <span
              className="opt"
              onMouseLeave={() => { this.showMenu(false); }}
              onMouseEnter={() => { this.showMenu(true); }}
            >
              <i className="iconfont more" />
              <div
                className={cls('menu emotions', {
                  'animation animating bounceIn': this.state.showMenu
                })}
              >
                <a className="new-talk" onClick={this.onShowMembers}>
                  <i className="iconfont message-empty" />
                  <span>发起聊天</span>
                </a>
                <a onClick={this.logout}>
                  <i className="iconfont logout" />
                  <span>退出</span>
                </a>
              </div>
            </span>
          </h3>
        </div>
      </div>
    );
  }
}
