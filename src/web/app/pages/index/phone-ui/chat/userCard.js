/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-13 12:07:38
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import MessageBox from '../../../../common/components/message-box';
// import Cookies from 'js-cookie';
import actions from '../../actions';
import sdk from '../../sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl,
  domain: startalkNav.baseaddess && startalkNav.baseaddess.domain,
  emails: ''
}

const { $ } = window.QtalkSDK;

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    companyUsers: state.getIn(['chat', 'companyUsers']),
    currentFriend: state.getIn(['chat', 'currentFriend'])
  }),
  actions
)
export default class UserCard extends Component {
  constructor() {
    super();
    this.state = {
      edit: false,
      reqMobile: false,
      profile: {},
      leader: {},
      mobile: {}
    };
  }

  componentDidMount() {
    const user = this.props.currentFriend.get('user');
    const [username] = user.split('@');
    this.getUserInfo(username, user);
  }

  async componentWillReceiveProps(nextProps) {
    const { currentFriend } = this.props;
    const user = nextProps.currentFriend.get('user');
    if (user) {
      const [username] = user.split('@');
      if (
        currentFriend.get('user') !== user
        && !this.state.leader[username]
        && !this.state.profile[username]
      ) {
        this.getUserInfo(username, user);
      }
    }
  }
  onSwitchSession(user) {
    const { changeChatField, setModalUserCard, setCurrentSession } = this.props;
    setCurrentSession({
      user,
      mFlag: '1'
    });
    changeChatField({ switchIndex: 'chat' });
    setModalUserCard({
      show: false
    });
    $('.session').scrollTop(0);
  }

  getMobile(user) {
    const { mobile, reqMobile } = this.state;
    if (mobile[user]) {
      MessageBox.alert(mobile[user]);
      return;
    }
    if (reqMobile) {
      return;
    }
    this.setState({
      reqMobile: true
    }, async () => {
      const res = await sdk.getUserPhone(user);
      let m = '';
      if (res.ret) {
        const { phone } = res.data;
        m = phone;
        MessageBox.alert(phone);
      } else {
        MessageBox.alert(res.msg);
      }
      this.setState({
        reqMobile: false,
        mobile: Object.assign({}, mobile, { [user]: m })
      });
    });
  }

  async getUserInfo(username, user) {
    const leaderRes = await sdk.getUserLeader(username);
    const profileRes = await sdk.getUserProfile(user);
    const leader = Object.assign({}, this.state.leader);
    const profile = Object.assign({}, this.state.profile);
    if (leaderRes.ret) {
      leader[username] = leaderRes.data;
    }
    if (profileRes.ret && profileRes.data.length > 0) {
      profile[username] = profileRes.data[0].users[0].mood;
    }
    this.setState({
      profile,
      leader
    });
  }


  async switchUser(username) {
    const { userInfo, setUserInfo, changeChatField } = this.props;
    const user = `${username}@${webConfig.domain}`;
    if (!userInfo.get(user)) {
      const res = await sdk.getUserCard([user]);
      if (res.ret) {
        setUserInfo(res.data);
      }
    }
    changeChatField({ currentFriend: { user, mFlag: '1' } });
    this.setState({
      edit: false
    });
  }

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn
  }

  render() {
    const {
      userInfo,
      companyUsers,
      currentFriend
    } = this.props;
    const {
      profile,
      leader,
      reqMobile,
      edit
    } = this.state;
    const user = currentFriend.get('user');

    const img = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png?w=80&h=80';//darlyn';
    const [name] = user.split('@');
    const info = userInfo.get(user);
    const leaderInfo = leader[name] || {};
    const bu = ((companyUsers[name] || {}).bu) || [];
    const m = {
      username: name,
      name: (companyUsers[name] || {}).N,
      img,
      gender: '',
      id: user,
      bm: bu.join('/'),
      no: leaderInfo.sn,
      leaderId: leaderInfo.qtalk_id,
      email: `${name}@${webConfig.emails}.com`,
      leader: leaderInfo.leader,
      desc: profile[name]
    };
    if (info) {
      m.name = info.get('nickname') || name;
      m.img = info.get('imageurl') || img;
      if (!/^(https:|http:|\/\/)/g.test(m.img)) {
        m.img = webConfig.fileurl+`/${m.img}`;//darlyn
      }
      m.gender = info.get('gender');
    }
    const bgNum = name ? name.length % 8 : 0;
    return (
      <div className="content">
        <div className={`banner b${bgNum}`}>
          <div className={`inner-banner bg b${bgNum}`}>
            <div className="avatar">
              <img src={m.img} alt="" onError={this.imgError} />
            </div>
            <div className="name-text">
              {m.name}
              {
                m.gender === '2'
                  ? <i className="icon female" />
                  : <i className="icon male" />
              }
            </div>
            <div className="btns">
              {
                m.id !== sdk.bareJid
                  && <i className="iconfont message-empty" onClick={() => { this.onSwitchSession(m.id); }} />
              }
              <a className="btn-up" href={`mailto:${m.email}`}>
                <i className="iconfont mail" />
              </a>
            </div>
          </div>
        </div>
        <div className="info">
          {/* 剩余功能需自己提供接口,并修改.m-user-card{overflow: scroll}  */}
          <div className="item">
            <p className="lab">StarTalk ID</p>
            <p>{m.username}</p>
          </div>
          <div className="item">
            <p className="lab">所在部门</p>
            <p>{m.bm}</p>
          </div>
          {/* <div className="item">
            <p className="lab">部门</p>
            <p>{m.bm}</p>
          </div>
          <div className="item">
            <p className="lab">邮箱</p>
            <p>{m.email}</p>
          </div>
          <div className="item">
            <p className="lab">直属上级</p>
            <p><a onClick={() => { this.switchUser(m.leaderId); }} className="link">{m.leader}</a></p>
          </div>
          <div className="item">
            <p className="lab">电话</p>
            <p>
              <a
                onClick={() => { this.getMobile(m.username); }}
                className={cls({ link: !reqMobile })}
              >
                {reqMobile ? '正在请求...' : '点击查看'}
              </a>
            </p>
          </div> */}
          <div className="item">
            <p className="lab">个性签名</p>
            <p>
              <span style={{ display: !edit ? '' : 'none' }}>
                {m.desc || '这货很懒啥都没写...'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
