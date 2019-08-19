/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-13 14:16:35
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import cls from 'classnames';
import actions from '../../actions';
import sdk from '../../sdk';
import footer4cf2f7c2e63f4a02 from '../../../../../../assets/footer/4cf2f7c2e63f4a02.png';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}

const { $ } = window.QtalkSDK;

const showNotification = (msg, title) => {
  if (window.Notification) {
    if (window.Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: msg.simpcontent,
        icon: footer4cf2f7c2e63f4a02
      });
      setTimeout(() => { notification.close(); }, 5000);
    } else {
      window.Notification.requestPermission();
    }
  }
};

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    message: state.get('message').toJS(),
    currentSession: state.getIn(['chat', 'currentSession']),
    companyUsers: state.getIn(['chat', 'companyUsers'])
  }),
  actions
)
export default class Message extends Component {
  constructor() {
    super();
    this.state = {
      loading: false // loading
    };
  }

  componentDidMount() {
    const {
      currentSession,
      appendMessage,
      setMessageRead,
      setUserInfo
    } = this.props;
    this.getHistoryMsg(currentSession, true);
    sdk.message
      // 接收 message 消息
      .on('message', async (msg) => {
        const {
          type,
          readType,
          ids,
          muc,
          sendjid
        } = msg;
        // 单聊设置已读
        if (type === 'readmark' && readType === '4') {
          setMessageRead(ids);
        }
        if (['chat', 'groupchat'].indexOf(type) > -1) {
          // 当前会话得消息 append
          const user = muc || sendjid;
          // 浏览器提醒消息
          let title = sendjid;
          const { userInfo } = this.props;
          if (muc && userInfo.getIn([muc, 'SN'])) {
            title = userInfo.getIn([muc, 'SN']);
          } else if (sendjid && userInfo.getIn([sendjid, 'nickname'])) {
            title = userInfo.getIn([sendjid, 'nickname']);
          }
          showNotification(msg, title);
          // 必须 this.props.currentSession.user
          // 直接在第一行 { currentSession } = this.props 在这里取到是旧的
          if (user === this.props.currentSession.get('user')) {
            // 如果用户没有卡片信息，请求
            if (sendjid && !this.props.userInfo.get(sendjid)) {
              const res = await sdk.getUserCard([sendjid]);
              if (res.ret) {
                setUserInfo(res.data);
              }
            }
            appendMessage(msg);
            setTimeout(() => {
              this.viewDom.scrollTop = this.viewDom.scrollHeight;
            }, 100);
          }
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    const { currentSession } = this.props;
    const newCurrentSession = nextProps.currentSession;
    if (
      (newCurrentSession.get('user') && currentSession.get('user') !== newCurrentSession.get('user'))
      || (newCurrentSession.get('groupname') && currentSession.get('groupname') !== newCurrentSession.get('groupname'))
    ) {
      this.getHistoryMsg(newCurrentSession, true);
    }
  }

  onContextMenu(e, data) {
    e.preventDefault();
    const { setContentMenu } = this.props;
    setContentMenu({
      show: true,
      type: 'message',
      data,
      pos: {
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }
    });
  }

  onShowUserCard = (e, user) => {
    const { setModalUserCard } = this.props;
    const pos = {
      left: `${e.clientX}px`,
      top: `${e.clientY + 50}px`
    };
    if (e.clientX + 280 > $(window).width()) {
      pos.left = `${e.clientX - 280}px`;
    }
    setModalUserCard({
      show: true,
      pos,
      user
    });
  };

  async getUserCard(data) {
    const { userInfo, setUserInfo } = this.props;
    const users = [];
    const usersCheck = {};
    data.msgs.forEach((item) => {
      if (item.sendjid && !userInfo.get(item.sendjid) && !usersCheck[item.sendjid]) {
        users.push(item.sendjid);
        usersCheck[item.sendjid] = true;
      }
    });
    if (users.length > 0) {
      const res = await sdk.getUserCard(users);
      if (res.ret) {
        setUserInfo(res.data);
      }
    }
  }

  getHistoryMsg(sessionInfo, isFirst) {
    const { scrollHeight } = this.viewDom;
    if (isFirst) {
      this.props.clearMessage();
    }
    this.setState({ loading: true }, async () => {
      if (sessionInfo.get('mFlag') === '1') {
        // 单聊
        const res = await sdk.getHistoryMsg(sessionInfo.get('user'), 20, isFirst);
        if (res.ret) {
          this.props.setMessage(res.data);
          this.getUserCard(res.data);
        }
      } else if (sessionInfo.get('mFlag') === '2') {
        // 群
        const res = await sdk.getGroupHistoryMsg(sessionInfo.get('user'), 20, isFirst);
        if (res.ret) {
          this.props.setMessage(res.data);
          this.getUserCard(res.data);
        }
      }
      this.setState({ loading: false });
      setTimeout(() => {
        this.viewDom.scrollTop = this.viewDom.scrollHeight - (isFirst ? 0 : scrollHeight || 0);
      }, 100);
    });
  }

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn;
  }

  // 通知类消息
  renderNotify(data, time) {
    const { userInfo } = this.props;
    const info = userInfo.get(data.sendjid);
    return (
      <div key={`${data.id}`} className="item m0">
        {
          time
            ? (
              <div className="sys-time">
                <span className="time">{time}</span>
              </div>)
            : null
        }
        <p className="sys-msg">
          <span className="cnt">
            {
              ['-1', '10'].indexOf(data.msgType) > -1 && info
                ? info.get('nickname')
                : ''
            }
            {data.content}
          </span>
        </p>
      </div>
    );
  }

  render() {
    const {
      message,
      userInfo,
      currentSession,
      messageScrollToBottom,
      companyUsers
    } = this.props;
    const { haveOther, msgs } = message;
    const { loading } = this.state;
    let prevTime = '';
    return (
      <div
        className="chat-message"
        ref={(dom) => {
          if (dom) {
            this.viewDom = dom;
            if (messageScrollToBottom) {
              setTimeout(() => {
                this.viewDom.scrollTop = this.viewDom.scrollHeight;
              }, 100);
            }
          }
        }}
      >
        <div className={cls('message-more', { loading })}>
          <img alt="" src="../../../../../../assets/jstree/8bde275d8233602.gif" />
          {
            haveOther
              ? (
                <p
                  className="poi"
                  onClick={() => { this.getHistoryMsg(currentSession, false); }}
                >
                  查看更多消息
                </p>
              )
              : (<p>没有更多消息了</p>)
          }
        </div>
        <div className="items clearfix">
          {
            msgs.map((item, index) => {
              let time = '';
              let img = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png?w=80&h=80';//darlyn;
              let nickName = '';
              let userCard = userInfo.get(item.sendjid);
              let userId = item.sendjid;
              if (item.carbonMessage && item.type === 'chat') {
                userCard = userInfo.get(sdk.bareJid);
                userId = sdk.bareJid;
              }
              if (userCard) {
                nickName = userCard.get('nickname') || '';
                img = userCard.get('imageurl') || '';
                if (!/^(https:|http:|\/\/)/g.test(img)) {
                  img =  webConfig.fileurl+`/${img}`;//darlyn
                }
              } else if (item.sendjid) {
                const [name] = item.sendjid.split('@');
                nickName = (companyUsers[name] || {}).N || '';
              }
              if (!prevTime
                || (prevTime && Math.abs(item.time - prevTime) > 1000 * 60)
              ) {
                time = dayjs(item.time).format('MM-DD HH:mm');
                prevTime = item.time;
              }
              if (item.msgType === '15' // 系统消息
                || item.msgType === '-1' // 分享
                || item.msgType === '10' // 抖动窗口
              ) {
                return this.renderNotify(item, time);
              }
              // 分享
              if (item.msgType === '666') {
                try {
                  const share = JSON.parse(item.extendInfo);
                  item.content = `分享：<a href="${share.linkurl}" target="_blank">${share.title || share.linkurl}</a>`;
                } catch (e) {
                  console.log(e.message);
                }
              }
              // 替换文本 @自己 为红色字体
              let handleContent = item.content.replace(/@([a,A][l,L][l,L])\s/, '<span style="color: red">@$1 </span>');
              if (item.msgType === '12') {
                const backupinfo = JSON.parse(item.backupinfo || '[]')[0];
                if (backupinfo && backupinfo.data) {
                  backupinfo.data.forEach((user) => {
                    if (user.jid === sdk.bareJid) {
                      // eslint-disable-next-line
                      handleContent = item.content.replace(eval(`/@(${user.text})\\s/`), '<span style="color: red">@$1 </span>');
                    }
                  });
                }
              }
              return (
                <div key={`msg_${item.id}_${index + 1}`} className={cls('item', { me: item.isMe })}>
                  {
                    time
                      ? (
                        <div className="sys-time">
                          <span className="time">{time}</span>
                        </div>)
                      : null
                  }
                  <img
                    onClick={(e) => { this.onShowUserCard(e, userId); }}
                    className={cls('avatar user-card', { group: !item.isMe && item.type === 'groupchat' })}
                    alt=""
                    src={img}
                    onError={this.imgError}
                  />
                  <div className="content">
                    {
                      !item.isMe && item.type === 'groupchat'
                        ? (<h4 className="nickname">{nickName}</h4>)
                        : null
                    }
                    <div className="msg-wrap" onContextMenu={(e) => { this.onContextMenu(e, { msg: item }); }}>
                      <div className="plain">
                        <div className="msg" dangerouslySetInnerHTML={{ __html: handleContent }} />
                      </div>
                    </div>
                    {
                      item.isMe && item.type === 'chat'
                        ? (<p className={cls('read-flag', { ok: item.isRead })}>{item.isRead ? '已读' : '未读'}</p>)
                        : null
                    }
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
