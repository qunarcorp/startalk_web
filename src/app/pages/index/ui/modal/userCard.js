import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import MessageBox from '../../../../common/components/message-box';
// import Cookies from 'js-cookie';
import actions from '../../actions';
import sdk from '../../sdk';
import webConfig from '../../../../../../web_config';

const { $ } = window.QtalkSDK;

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    modalUserCard: state.get('modalUserCard'),
    companyUsers: state.getIn(['chat', 'companyUsers'])
  }),
  actions
)
export default class UserCard extends Component {
  constructor() {
    super();
    this.state = {
      desc: '',
      reqMobile: false,
      profile: {},
      leader: {},
      mobile: {}
    };
  }

  componentDidMount() {
    // const { setUserInfo } = this.props;
    // 可以正常收发消息了
    // sdk.ready(async () => {
    //   // const res = await sdk.getUserCard([sdk.bareJid]);
    //   // if (res.ret) {
    //   //   setUserInfo(res.data);
    //   // }
    // });
    $(window).on('click', (e) => {
      const $target = $(e.target);
      if ($target.closest('.m-user-card').length === 0
        && $target.closest('.user-card').length === 0
        && this.props.modalUserCard.get('show')
      ) {
        this.props.setModalUserCard({
          show: false
        });
      }
    });
  }

  async componentWillReceiveProps(nextProps) {
    const { modalUserCard } = this.props;
    const user = nextProps.modalUserCard.get('user');
    if (user) {
      const [username] = user.split('@');
      if (
        modalUserCard.get('user') !== user
      ) {
        let leaderRes = {};
        let profileRes = {};
        if (!this.state.leader[username]) {
          leaderRes = await sdk.getUserLeader(username);
        }
        if (!this.state.profile[username]) {
          profileRes = await sdk.getUserProfile(user);
        }
        const leader = Object.assign({}, this.state.leader);
        const profile = Object.assign({}, this.state.profile);
        let desc = this.state.profile[username];
        if (leaderRes.ret) {
          leader[username] = leaderRes.data;
        }
        if (profileRes.ret && profileRes.data.length > 0) {
          profile[username] = profileRes.data[0].M;
          desc = profile[username];
        }
        this.setState({
          profile,
          leader,
          desc
        });
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

  async updateProfile() {
    const { desc } = this.state;
    const res = await sdk.setUserProfile(desc);
    if (res.ret) {
      const profile = Object.assign({}, this.state.profile);
      profile[sdk.myId] = desc;
      this.setState({
        desc,
        profile
      });
    }
  }

  async switchUser(username) {
    const { userInfo, setUserInfo, setModalUserCard } = this.props;
    const user = `${username}@${webConfig.domain}`;
    if (!userInfo.get(user)) {
      const res = await sdk.getUserCard([user]);
      if (res.ret) {
        setUserInfo(res.data);
      }
    }
    setModalUserCard({ user });
  }

  imgError(e) {
    e.target.src = '../../../../../../assets/footer/ff1a003aa731b0d4e2dd3d39687c8a54.png';//darlyn
  }

  render() {
    const { userInfo, modalUserCard, companyUsers } = this.props;
    const {
      profile,
      leader,
      reqMobile,
      desc
    } = this.state;
    const show = modalUserCard.get('show');
    const pos = modalUserCard.get('pos');
    const user = modalUserCard.get('user');
    if (!show) {
      return null;
    }
    const img = '../../../../../../assets/footer/ff1a003aa731b0d4e2dd3d39687c8a54.png';//darlyn
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
        // m.img = `${webConfig.javaurl}/${m.img}`;
      }
      m.gender = info.get('gender');
    }
    const renderDesc = () => {
      const d = m.desc || '这货很懒啥都没写...';
      return (
        <p className="text">
          {
            m.id === sdk.bareJid ?
              <span className="txt-wrap">
                <input
                  type="text"
                  className="txt"
                  placeholder="这货很懒啥都没写..."
                  value={desc}
                  onChange={(e) => { this.setState({ desc: e.target.value.trim() }); }}
                />
                <a
                  className="btn-up"
                  onClick={() => { this.updateProfile(); }}
                >
                  <i className="iconfont edit" />
                </a>
              </span> :
              d
          }
        </p>
      );
    };
    return (
      <div className="m-user-card animation animating bounceIn" style={pos}>
        <div className="avatar">
          <img src={m.img} alt="" onError={this.imgError} />
        </div>
        <div className="content">
          <div className={`banner bg b${user ? user.length % 8 : 0}`}>
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
          <div className="info">
            <div className="item">
              <p className="lab">公司 ID</p>
              <p className="text">{m.id}</p>
            </div>
            <div className="item">
              <p className="lab">员工 ID</p>
              <p className="text">{m.no}</p>
            </div>
            <div className="item">
              <p className="lab">部门</p>
              <p className="text">{m.bm}</p>
            </div>
            <div className="item">
              <p className="lab">邮箱</p>
              <p className="text">{m.email}</p>
            </div>
            <div className="item">
              <p className="lab">直属上级</p>
              <p className="text"><a onClick={() => { this.switchUser(m.leaderId); }} className="link">{m.leader}</a></p>
            </div>
            <div className="item">
              <p className="lab">电话</p>
              <p className="text">
                <a
                  onClick={() => { this.getMobile(m.username); }}
                  className={cls({ link: !reqMobile })}
                >
                  {reqMobile ? '正在请求...' : '点击查看'}
                </a>
              </p>
            </div>
            <div className="item">
              <p className="lab">个性签名</p>
              {renderDesc()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
