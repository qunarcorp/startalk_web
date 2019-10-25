/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-13 19:47:39
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import LazyLoad from 'react-lazyload';
import MessageBox from '../../../../common/components/message-box';
import actions from '../../actions';
import sdk from '../../sdk';
import webConfig from '../../../../../../web_config';
import footera3faf4373242d1 from '../../../../../../assets/footer/a3faf4373242d1.png';

const { $ } = window.QtalkSDK;

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    currentSession: state.getIn(['chat', 'currentSession'])
  }),
  actions
)
export default class Members extends Component {
  constructor() {
    super();
    this.state = {
      showRemove: false,
      owner: false,
      admin: false
    };
  }

  componentDidMount() {
    this.getUserInfo();
    $(window)
      .on('keydown', (e) => {
        // ctrl 显示 踢人按钮
        if (e.keyCode === 17
          && this.props.show
          && (this.state.owner || this.state.admin)
        ) {
          this.setState({ showRemove: true });
        }
      })
      .on('keyup', (e) => {
        if (e.keyCode === 17
          && this.props.show
          && (this.state.owner || this.state.admin)
        ) {
          this.setState({ showRemove: false });
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    const { show } = this.props;
    // 隐藏的时候重置
    if (show !== nextProps.show && !nextProps.show) {
      this.setState({
        showRemove: false,
        owner: false,
        admin: false
      });
    }
    if (nextProps.show) {
      this.getUserInfo(nextProps);
    }
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
  }

  onRemoveUser(jid) {
    const { currentSession } = this.props;
    if (jid === sdk.bareJid) {
      MessageBox.confirm(
        '即将从该群退出，如果继续且需要恢复此操作，<br />你需要让当前群成员重新邀请。是否继续?',
        '警告'
      ).ok(() => {
        sdk.groupExit(jid);
      });
    } else {
      sdk.groupRemoveUser(jid, currentSession.get('user'));
    }
  }

  onContextMenu(e, jid, role) {
    e.preventDefault();
    const { setContentMenu, currentSession } = this.props;
    const { owner, admin } = this.state;
    setContentMenu({
      show: true,
      type: 'member',
      data: {
        user: jid,
        userRole: role,
        owner,
        admin,
        groupId: currentSession.get('user')
      },
      pos: {
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }
    });
  }

  async getUserInfo(nextProps) {
    const { setUserInfo, userList, userInfo } = nextProps || this.props;
    if (userList && userList.size > 0) {
      const users = [];
      const usersCheck = {};
      userList.forEach((item) => {
        // 是否有权限踢人，跟升级管理员
        const jid = item.get('jid');
        const affiliation = item.get('affiliation');
        if (jid === sdk.bareJid && affiliation) {
          this.setState({
            [affiliation]: true
          });
        }
        if (!userInfo.get(jid) && !usersCheck[jid]) {
          users.push(jid);
          usersCheck[jid] = true;
        }
      });
      if (users.length > 0) {
        const res = await sdk.getUserCard(users);
        if (res.ret) {
          setUserInfo(res.data);
        }
      }
    }
  }

  addUser = () => {
    this.props.addUser();
  };

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';
  }

  render() {
    const { show, userList, userInfo } = this.props;
    const { showRemove, owner, admin } = this.state;
    if (!show) {
      return null;
    }
    return (
      <div className={cls('members-wrap', { 'animation animating bounceIn': show })}>
        <div className="list clearfix">
          <div onClick={this.addUser} className="member opt">
            <i className="icon chat-header-members-add" />
          </div>
          {
            userList.map((item, index) => {
              let img = footera3faf4373242d1;
              const jid = item.get('jid');
              const affiliation = item.get('affiliation');
              let name = jid;
              const info = userInfo.get(jid);
              if (info) {
                name = info.get('nickname') || jid;
                img = info.get('imageurl') || '';
                if (!/^(https:|http:|\/\/)/g.test(img)) {
                  img =  webConfig.fileurl+`/${img}`;
                }
              }
              return (
                <div
                  key={`member-${index + 1}`}
                  className="member"
                  onContextMenu={(e) => { this.onContextMenu(e, jid, affiliation); }}
                >
                  {
                    showRemove
                      && ((admin && affiliation !== 'owner') || owner)
                      ? (
                        <span
                          onClick={() => { this.onRemoveUser(jid); }}
                          className="opt animation animating fadeIn"
                        >
                          <i className="icon close-1" />
                        </span>
                      )
                      : null
                  }
                  <span className="role">
                    <i className={`icon ${affiliation}`} />
                  </span>
                  <LazyLoad height={40} overflow>
                    <img
                      onClick={(e) => { this.onShowUserCard(e, jid); }}
                      className="avatar user-card"
                      src={img}
                      alt=""
                      onError={this.imgError}
                    />
                  </LazyLoad>
                  <p className="nickname">{name}</p>
                </div>
              );
            })
          }
        </div>
        {
          (owner || admin)
            ? <div className="tip">群人员管理[右键]菜单，按住[ctrl]快捷操作</div>
            : null
        }
      </div>
    );
  }
}
