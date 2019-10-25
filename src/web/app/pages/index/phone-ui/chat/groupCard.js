/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-13 12:06:05
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import cls from 'classnames';
// import Modal from '../../../../common/components/modal';
// import MessageBox from '../../../../common/components/message-box';
// import Cookies from 'js-cookie';
import actions from '../../actions';
import sdk from '../../sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl,
  emails: ''
}

const { $ } = window.QtalkSDK;

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    currentFriend: state.getIn(['chat', 'currentFriend'])
  }),
  actions
)
export default class UserCard extends Component {
  constructor() {
    super();
    this.state = {
      ID: '',
      MP: '',
      MT: '',
      MD: '',
      SN: '',
      emails: ''
    };
  }

  componentDidMount() {
    const groupId = this.props.currentFriend.get('user');
    this.getGroupInfo(groupId, this.props.userInfo, this.props.setUserInfo);
  }

  async componentWillReceiveProps(nextProps) {
    const { userInfo, currentFriend, setUserInfo } = nextProps;
    const groupId = currentFriend.get('user');
    if (groupId === this.props.currentFriend.get('user')) {
      return;
    }
    this.getGroupInfo(groupId, userInfo, setUserInfo);
  }

  onUpdate = async (id) => {
    const d = this.state[id];
    const p = {
      muc_name: this.state.ID.toLowerCase()
    };
    switch (id) {
      case 'SN':
        p.nick = d;
        break;
      case 'MD':
        p.desc = d;
        break;
      case 'MT':
        p.title = d;
        break;
      default:
    }
    await sdk.updateMucCard([p]);
    // this.onClose();
  };

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onSwitchSession(user) {
    const { changeChatField, setModalUserCard, setCurrentSession } = this.props;
    setCurrentSession({
      user,
      mFlag: '2'
    });
    changeChatField({ switchIndex: 'chat', isCard: false, isChat: true });
    setModalUserCard({
      show: false
    });
    $('.session').scrollTop(0);
  }

  async getGroupInfo(groupId, userInfo, setUserInfo) {
    const groupInfo = userInfo.get(groupId);
    let state = {
      ID: groupId,
      MP: '',
      MT: '',
      MD: '',
      SN: ''
    };
    const userList = await sdk.getGroupUserList(groupId);
    if (userList.ret) {
      let emails = '';
      if (userList.data && userList.data.length < 30) {
        userList.data.forEach((item) => {
          const [name] = item.jid.split('@');
          emails += `${name}@${webConfig.emails}.com;`;
        });
      }
      state.emails = emails;
    }
    if (!groupInfo) {
      const res = await sdk.getGroupCard([groupId]);
      if (res.ret) {
        setUserInfo(res.data);
        const resInfo = res.data[groupId];
        state = Object.assign({}, state, {
          MP: resInfo.MP || '',
          MT: resInfo.MT || '',
          MD: resInfo.MD || '',
          SN: resInfo.SN || ''
        });
      }
    } else {
      state = Object.assign({}, state, {
        MP: groupInfo.get('MP') || '',
        MT: groupInfo.get('MT') || '',
        MD: groupInfo.get('MD') || '',
        SN: groupInfo.get('SN') || ''
      });
    }
    this.setState(state);
  }

  // 暂不支持
  uploadImg = () => {
    sdk.uploadImg({
      type: 'image',
      onlyUrl: true,
      success: (url) => {
        this.setState({
          MP: url
        });
      }
    });
  };

  return = () => {
    const { changeChatField } = this.props;
    changeChatField({ isCard: false });
  }

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn
  }

  render() {
    const {
      ID,
      MP,
      MT,
      MD,
      SN,
      emails
    } = this.state;

    let img = MP;
    if (!/^(https:|http:|\/\/)/g.test(img)) {
      img =  webConfig.fileurl+`/${img}`;//darlyn
    }
    const bgNum = emails ? emails.length % 8 : 0;
    return (
      <div className="content">
        <div className={`banner b${bgNum}`}>
          <div className="return" onClick={()=>{this.return()}}></div>
          <div className={`inner-banner bg b${bgNum}`}>
            <div
              className="avatar"
            >
              <img src={img} onError={(e) => { this.imgError(e); }} alt="" />
            </div>
            <div className="name-text">
              {SN}
            </div>
            <div className="btns">
              <i className="iconfont message-empty" onClick={() => { this.onSwitchSession(ID); }} />
              <a className="btn-up" href={`mailto:${emails}`}>
                <i className="iconfont mail" />
              </a>
            </div>
          </div>
        </div>
        <div className="info">
          <div className="item">
            <p className="lab">名称</p>
            <p className="text">
              <input
                type="text"
                name="SN"
                onChange={(e) => { this.onChange(e); }}
                value={SN}
                className="txt"
              />
              <a
                className="btn-up"
                onClick={() => { this.onUpdate('SN'); }}
              >
                <i className="iconfont edit" />
              </a>
            </p>
          </div>
          <div className="item">
            <p className="lab">群号</p>
            <p>{ID}</p>
          </div>
          <div className="item">
            <p className="lab">群公告</p>
            <p className="text">
              <textarea
                value={MT}
                name="MT"
                className="txt h80"
                onChange={(e) => { this.onChange(e); }}
              />
              <a
                className="btn-up"
                onClick={() => { this.onUpdate('MT'); }}
              >
                <i className="iconfont edit" />
              </a>
            </p>
          </div>
          <div className="item">
            <p className="lab">群简介</p>
            <p className="text">
              <textarea
                value={MD}
                name="MD"
                className="txt h40"
                onChange={(e) => { this.onChange(e); }}
              />
              <a
                className="btn-up"
                onClick={() => { this.onUpdate('MD'); }}
              >
                <i className="iconfont edit" />
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
