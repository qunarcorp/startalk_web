/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-10-22 11:42:47
 * @LastEditors: chaos.dong
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import LazyLoad from 'react-lazyload';
import actions from '../../actions';
import sdk from '../../sdk';
import { atTips } from '../../consts';
import footera3faf4373242d1 from '../../../../../../assets/footer/a3faf4373242d1.png'

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}
let timer = null;
let startTime = '';
let endTime = '';
@connect(
  state => ({
    userInfo: state.get('userInfo'),
    session: state.getIn(['chat', 'session']),
    currentSession: state.getIn(['chat', 'currentSession']),
    companyUsers: state.getIn(['chat', 'companyUsers'])
  }),
  actions
)
export default class Session extends Component {
  componentDidMount() {
    const { setSessionList, removeSession } = this.props;
    sdk.message
      // 接收 message 消息
      .on('message', (msg) => {
        if (['chat', 'groupchat'].indexOf(msg.type) > -1) {
          this.moveSession(msg);
        }
      })
      // 销毁群
      .on('group_distory', (groupId) => {
        removeSession(groupId);
      })
      // 接收群名片更新
      .on('group_vcard_update', (msg) => {
        this.props.setUserInfo({
          [msg.from]: {
            MN: msg.from,
            SN: msg.nick,
            MD: msg.desc,
            MT: msg.title,
            MP: msg.pic
          }
        });
      });
    // 可以正常收发消息了
    sdk.ready(async () => {
      const sessionList = await sdk.getSessionList();
      if (sessionList.ret) {
        const users = [];
        const mucs = [];
        const newDatas = sessionList.data.map((item) => {
          if (item.mFlag === '1') {
            users.push(item.user);
          } else if (item.mFlag === '2') {
            mucs.push(item.user);
          }
          if (/@([a,A][l,L][l,L])\s/.test(item.sdk_msg)) {
            item.atContent = `${atTips.all} ${item.sdk_msg}`;
          } else if (item.msgType === '12') {
            const backupinfo = JSON.parse(item.backupinfo || '[]')[0];
            if (backupinfo && backupinfo.data) {
              const atUsers = backupinfo.data;
              atUsers.forEach((user) => {
                if (user.jid === sdk.bareJid) {
                  item.atContent = atTips.single;
                }
              });
            }
          }
          return item;
        });
        this.cacheUserCard(users, true);
        this.cacheUserCard(mucs, false);
        setSessionList(newDatas);
      }
    });
  }

  moveSession(msg) {
    const { moveSession, currentSession, userInfo } = this.props;
    const simpmsg = msg.simpcontent;
    let user = msg.sendjid;
    let mFlag = '1';
    if (msg.type === 'groupchat') {
      user = msg.muc;
      mFlag = '2';
    }
    // 检测群或者个人是否有卡片信息，不存在去请求
    if (!userInfo.get(user)) {
      this.cacheUserCard([user], mFlag === '1');
    }
    moveSession({
      isMe: msg.isMe,
      bareJid: sdk.bareJid,
      currentSessionUser: currentSession.get('user'),
      simpmsg,
      user,
      mFlag,
      backupinfo: msg.backupinfo
    });
  }

  switchSession(sessionInfo) {
    const { changeChatField, clearSessionCnt } = this.props;
    changeChatField({
      currentSession: sessionInfo
    });
    clearSessionCnt();
  }

  async cacheUserCard(users, isChat) {
    const { setUserInfo } = this.props;
    const res = await sdk[isChat ? 'getUserCard' : 'getGroupCard'](users);
    if (res.ret) {
      setUserInfo(res.data);
    }
    return res;
  }

  //开始按
  gtouchstart(e, data){
    e.preventDefault();
    const pageX = e.touches[0].pageX;
    const pageY = e.touches[0].pageY;
    startTime = +new Date()
    timer = setTimeout(() => {
      const { setContentMenu } = this.props;
      setContentMenu({
        show: true,
        type: 'session',
        data,
        pos: {
          left: `${pageX}px`,
          top: `${pageY}px`
        }
      });
    }, 1000)
  };

  //如果在1000毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
  gtouchend(e, isCurrentSession, item){
    e.preventDefault();
      endTime = +new Date()
      clearTimeout(timer)
      if (endTime - startTime < 200) {
        // 处理点击事件
        const { changeChatField } = this.props;
        changeChatField({ isChat: true });
        if (!isCurrentSession) {
          this.switchSession(item);
        }
      }
  };

  gtouchmove(isCurrentSession, item) {
    const { setContentMenu, changeChatField } = this.props;
    setContentMenu({
      show: false
    });
    changeChatField({ isChat: false });
    if (!isCurrentSession) {
      this.switchSession(item);
    }
  }

  renderSession(item, index) {
    const { userInfo, currentSession, companyUsers } = this.props;
    let img = footera3faf4373242d1;
    const {
      user,
      mFlag,
      cnt,
      isTop
    } = item;
    let name = user;
    const msg = item.sdk_msg;
    const info = userInfo.get(user);
    // 没有userinfo 展示中文名
    if (mFlag === '1' && !info) {
      name = (companyUsers[user.split('@')[0] || ''] || {}).N || user;
    }
    // 单聊消息
    if (mFlag === '1' && info) {
      img = info.get('imageurl') || '';
      name = info.get('nickname') || '';
    } else if (mFlag === '2' && info) {
      name = info.get('SN') || info.get('MN') || '';
      img = info.get('MP') || '';
    }
    if (!/^(https:|http:|\/\/)/g.test(img)) {
      img = `${webConfig.fileurl}/${img}`;
    }
    // 判断是否当前会话
    const isCurrentSession = user === currentSession.get('user');
    const reddot = parseInt(cnt, 10);
    return (
      <div
        onTouchStart={(e) => {
          this.gtouchstart(e, item)
        }}
        onTouchEnd={(e) => {
          this.gtouchend(e,isCurrentSession,item)
        }}
        onTouchMove={() => {
          this.gtouchmove(isCurrentSession,item)
        }}
        key={`session_${index}`}
        className={cls('item', { active: false })}
      >
        <div className="ext">
          {
            isTop &&
              <p className="attr top">
                置顶
              </p>
          }
          <p className="attr" />
        </div>
        <div className="avatar">
          <LazyLoad height={40} offset={20} overflow>
            <img className="img" alt="" src={img} />
          </LazyLoad>
          {
            reddot > 0
              ? (<i className="icon panel-reddot">{reddot > 100 ? '99+' : reddot}</i>)
              : null
          }
        </div>
        <div className="info">
          <h3 className="nickname">
            <span className="nickname-text">{name}</span>
            {
              item.atContent ?
                <p className="msg red">{item.atContent}</p> :
                <p className="msg">{msg}</p>
            }
          </h3>
        </div>
      </div>
    );
  }

  render() {
    const { show, session } = this.props;
    return (
      <div
        className="box session"
        style={{ display: show ? '' : 'none' }}
      >
        <div className="items">
          {
            session.map((item, index) => (
              this.renderSession(item, index)
            ))
          }
        </div>
      </div>
    );
  }
}
