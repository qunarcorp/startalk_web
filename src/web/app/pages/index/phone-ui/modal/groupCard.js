/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-08-13 12:12:37
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
    modalGroupCard: state.get('modalGroupCard')
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
      if ($target.closest('.m-group-card').length === 0
        && $target.closest('.group-card').length === 0
        && this.props.modalGroupCard.get('show')
      ) {
        this.props.setModalGroupCard({
          show: false
        });
      }
    });
  }

  async componentWillReceiveProps(nextProps) {
    const { userInfo, modalGroupCard, setUserInfo } = nextProps;
    const groupId = modalGroupCard.get('groupId');
    const show = modalGroupCard.get('show');
    if (!show || groupId === this.props.modalGroupCard.get('groupId')) {
      return;
    }
    // let groupInfo = userInfo.get(groupId);
    // 不存在群消息，去请求
    // if (!groupInfo) {
    //   const res = await sdk.getGroupCard([groupId]);
    //   if (res.ret) {
    //     setUserInfo(res.data);
    //     groupInfo = res.data[groupId];
    //   } else {
    //     groupInfo = {};
    //   }
    // } else {
    //   groupInfo = groupInfo.toJS();
    // }
    // this.setState({
    //   ID: groupId,
    //   MP: groupInfo.MP || '',
    //   MT: groupInfo.MT || '',
    //   MD: groupInfo.MD || '',
    //   SN: groupInfo.SN || ''
    // });
    // 看到toJS()我就难受。。。。。。
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
          emails += `${name}@${ webConfig.emails}.com;`;
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

  onClose = () => {
    this.props.setModalGroupCard({
      show: false
    });
  };

  onSwitchSession(user) {
    const { changeChatField, setModalGroupCard, setCurrentSession } = this.props;
    setCurrentSession({
      user,
      mFlag: '2'
    });
    changeChatField({ switchIndex: 'chat' });
    setModalGroupCard({
      show: false
    });
    $('.session').scrollTop(0);
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

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn'
  }

  render() {
    const { modalGroupCard } = this.props;
    const {
      ID,
      MP,
      MT,
      MD,
      SN,
      emails
    } = this.state;
    const show = modalGroupCard.get('show');
    const pos = modalGroupCard.get('pos');
    if (!show) {
      return null;
    }
    let img = MP;
    if (!/^(https:|http:|\/\/)/g.test(img)) {
      img = `${ webConfig.fileurl}/${img}`;
    }
    return (
      <div className="m-group-card animation animating bounceIn" style={pos}>
        <div
          className="avatar"
        >
          <img src={img} onError={(e) => { this.imgError(e); }} alt="" />
        </div>
        <div className="content">
          <div className={`banner bg b${emails ? emails.length % 8 : 0}`}>
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
          <div className="info">
            <div className="item">
              <p className="lab">群名称</p>
              <p className="text">
                <span className="txt-wrap">
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
                </span>
              </p>
            </div>
            <div className="item">
              <p className="lab">群号</p>
              <p className="text">{ID}</p>
            </div>
            <div className="item">
              <p className="lab">群公告</p>
              <p className="text">
                <span className="txt-wrap">
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
                </span>
              </p>
            </div>
            <div className="item">
              <p className="lab">群简介</p>
              <p className="text">
                <span className="txt-wrap">
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
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
