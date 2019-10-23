/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-08-13 12:13:40
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import Cookies from 'js-cookie';
// import { List, Map } from 'immutable';
import LazyLoad from 'react-lazyload';
import { treeKey } from '../../consts';
import Tree from '../tree';
import MessageBox from '../../../../common/components/message-box';
import actions from '../../actions';
import sdk from '../../sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl,
  domain: startalkNav.baseaddess && startalkNav.baseaddess.domain
}
const { $ } = window.QtalkSDK;

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    companyStruct: state.getIn(['chat', 'companyStruct']),
    companyUsers: state.getIn(['chat', 'companyUsers']),
    companyUsersName: state.getIn(['chat', 'companyUsersName']),
    currentSession: state.getIn(['chat', 'currentSession']),
    userList: state.getIn(['chat', 'currentSession', 'userList']),
    show: state.getIn(['members', 'show']),
    isNew: state.getIn(['members', 'isNew'])
  }),
  actions
)
export default class Members extends Component {
  constructor() {
    super();
    this.state = {
      // showRemove: false,
      owner: false, // 判断当前用户是否是群创建者
      admin: false, // 判断当前用户是否是管理员
      selected: [{
        jid: sdk.bareJid
      }], // 默认选中的人
      treeSelected: [], // 从组织架构选择的人 展示联系人
      treeSelectedMap: {}, // 选择人的map 用于展示x按钮
      selectUsers: [], // tree所需要的数据格式
      tree: {}, // tree记录点开的item
      searchTree: {}, // 查询出来的结果key
      searchText: '' // 查询输入
    };
  }

  componentDidMount() {
    // 获取userinfo里没有信息的群成员信息
    this.getUserInfo();
    // 交互：点击这些位置不会使modal关闭，其他地方会关闭
    $(window).on('click', (e) => {
      const $target = $(e.target);
      if ($target.closest('.members-wrap').length === 0
        && $target.closest('.members').length === 0
        && $target.closest('.iconfont.tebu').length === 0
        && $target.closest('.new-talk').length === 0
        && $target.closest('.modals').length === 0
        && this.props.show
      ) {
        this.onClose();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { show } = this.props;
    const [n] = sdk.bareJid.split('@');
    // 隐藏的时候重置
    if (show !== nextProps.show && !nextProps.show) {
      this.setState({
        // showRemove: false,
        owner: false,
        admin: false,
        searchTree: {},
        selected: [{
          jid: sdk.bareJid
        }],
        selectedMap: {
          [n]: true
        },
        treeSelected: [],
        treeSelectedMap: {},
        selectUsers: [],
        tree: {},
        searchText: ''
      });
    }
    if (nextProps.show) {
      // 发起聊天
      if (nextProps.isNew) {
        this.setState({
          selected: [{
            jid: sdk.bareJid
          }],
          selectedMap: {
            [n]: true
          }
        }, () => {
          this.getUserInfo(nextProps);
        });
      } else {
        // 已存在群加人
        const users = nextProps.currentSession.get('userList') || [];
        const u = [];
        const selectedMap = {};
        users.forEach((item) => {
          u.push({
            jid: item.get('jid'),
            affiliation: item.get('affiliation')
          });
          const [nj] = item.get('jid').split('@');
          selectedMap[nj] = true;
        });
        if (nextProps.currentSession.get('mFlag') === '1') {
          u.push({
            jid: sdk.bareJid
          });
          selectedMap[n] = true;
        }
        this.setState({
          selected: u,
          selectedMap
        }, () => {
          this.getUserInfo(nextProps);
        });
      }
    }
  }

  // 关闭modal
  onClose() {
    this.props.setMembersInfo({ show: false });
  }

  // 移除选中的user
  onRemoveClick(data) {
    const { selectUsers, treeSelected, treeSelectedMap } = this.state;
    const ns = {};
    Object.keys(selectUsers).forEach((item) => {
      const u = selectUsers[item];
      if (u.flag) {
        const jid = `${u.value.U}@${webConfig.domain}`;
        if (jid === data.jid) {
          treeSelectedMap[data.jid] = false;
          u.flag = false;
          const ts = treeSelected.filter(t => t.jid !== data.jid);
          this.setState({
            treeSelected: ts,
            treeSelectedMap
          });
        }
        ns[item] = u;
      }
    });
    this.setState({
      selectUsers: ns
    });
  }

  // 删除群成员
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
      MessageBox.confirm(
        '是否删除此用户',
        '警告'
      ).ok(() => {
        sdk.groupRemoveUser(jid, currentSession.get('user'));
      });
    }
  }

  // tree组件选择
  onTreeSelect = (users) => {
    const ts = [];
    const tm = {};
    Object.keys(users).forEach((item) => {
      const u = users[item];
      if (u.flag) {
        const jid = `${u.value.U}@${webConfig.domain}`;
        ts.push({
          jid
        });
        tm[jid] = true;
      }
    });
    this.setState({
      treeSelected: ts,
      treeSelectedMap: tm,
      selectUsers: users
    });
  }

  // 组织架构成员搜索
  onSearch = (e) => {
    const val = e.target.value.trim();
    this.setState({
      searchText: val
    });
    if (val.length < 2) {
      this.setState({
        tree: {},
        searchTree: {}
      });
      return null;
    }
    clearTimeout(this.time);
    this.time = setTimeout(async () => {
      // const res = await sdk.searchSbuddy({
      //   id: 'qtalk.com',
      //   key: val,
      //   ckey: Cookies.get('q_ckey'),
      //   limit: 99999,
      //   offset: 0
      // });
      if (true) {
        const { companyUsersName } = this.props;
        const tree = {};
        const searchTree = {};
        // const ui = [];
        // const pattern = '[a-z0-9]+?(?=-)';
        // const regex = new RegExp(pattern, 'g');
        const u = companyUsersName[val];
        if (u && u.key) {
          const mr = u.key.match(/[a-z0-9]+?(?=-)/g);
          if (mr.length > 0) {
            const l = mr.reduce((prev, next) => {
              tree[prev] = true;
              return `${prev}-${next}`;
            });
            tree[l] = true;
            tree[u.key] = true;
          }
          searchTree[u.key] = true;
          // ui.push(item.uri);
        }
        // if (ui.length > 0) {
        //   this.cacheUserCard(ui);
        // }
        this.setState({
          tree,
          searchTree
        });
      }
    }, 250);
    return true;
  };

  onTreeClick(u, t) {
    this.setState({
      tree: t
    });
  }

  // 跳转聊天
  onSwitchSession(user) {
    const { changeChatField, setCurrentSession } = this.props;
    setCurrentSession({
      user,
      mFlag: '1'
    });
    changeChatField({ switchIndex: 'chat' });

    $('.session').scrollTop(0);
  }

  async getUserInfo(nextProps) {
    const { setUserInfo, userInfo } = nextProps || this.props;
    const userList = this.state.selected;
    if (userList && userList.length > 0) {
      const users = [];
      const usersCheck = {};
      userList.forEach((item) => {
        // 是否有权限踢人，跟升级管理员
        const { jid, affiliation } = item;
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

  // 缓存数据
  async cacheUserCard(users) {
    const { setUserInfo } = this.props;
    const res = await sdk.getUserCard(users);
    if (res.ret) {
      setUserInfo(res.data);
    }
    return res;
  }

  addUser = async () => {
    const { selectUsers, selected } = this.state;
    const users = [];
    Object.keys(selectUsers).forEach((item) => {
      const u = selectUsers[item];
      if (u.flag) {
        users.push({
          jid: `${u.value.U}@${webConfig.domain}`,
          nick: u.value.N
        });
      }
    });
    const {
      changeChatField,
      currentSession,
      clearSessionCnt,
      setMembersInfo,
      userInfo,
      isNew
    } = this.props;
    selected.forEach((s) => {
      users.push({
        jid: s.jid,
        nick: userInfo.getIn([s.jid, 'nickname'])
      });
    });
    if (users.length > 2) {
      const res = await sdk.addUser(users, isNew);
      if (res.ret) {
        setMembersInfo({ show: false });
        // 单聊创建新群后，激活会话
        if (currentSession.get('mFlag') === '1' || isNew) {
          setTimeout(() => {
            changeChatField({
              currentSession: {
                cnt: 0,
                sdk_msg: '',
                simpmsg: '',
                user: res.data,
                mFlag: '2'
              }
            });
            clearSessionCnt();
          }, 0);
        }
      } else {
        MessageBox.alert(res.errmsg);
      }
    } else {
      // 人数少于2人 不创建群聊或加人  而是个人会话
      users.forEach((item) => {
        if (item.jid !== sdk.bareJid) {
          this.onSwitchSession(item.jid);
        }
        this.onClose();
      });
    }
  };

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn'
  }

  renderList() {
    const { userInfo, companyUsers } = this.props;
    const {
      selected,
      owner,
      admin,
      treeSelected,
      treeSelectedMap
    } = this.state;
    const arr = selected.concat(treeSelected);
    
    return (
      <ul className="user-list">
        {
          arr.map((item) => {
            let img = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn'
            const { jid, affiliation } = item;
            const [u] = jid.split('@');
            let name = (companyUsers[u] || {}).N || jid;
            const info = userInfo.get(jid);
            if (info) {
              name = info.get('nickname') || jid;
              img = info.get('imageurl') || '';
              if (!/^(https:|http:|\/\/)/g.test(img)) {
                img = `${webConfig.fileurl}/${img}`;
              }
            }
            return (
              <li key={`member-${jid}`}>
                <LazyLoad height={45} overflow>
                  <img
                    src={img}
                    alt=""
                    onError={this.imgError}
                  />
                </LazyLoad>
                <span>{name}</span>
                {
                  (owner || admin) && (jid !== sdk.bareJid) && (affiliation !== 'owner') && !treeSelectedMap[jid] &&
                    <i className="iconfont minus" onClick={() => this.onRemoveUser(jid)} />
                }
                {
                  treeSelectedMap[jid] && <i className="iconfont tebu" onClick={() => this.onRemoveClick(item)} />
                }
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    const { show, companyStruct } = this.props;
    const {
      selected,
      selectUsers,
      tree,
      selectedMap,
      searchTree,
      searchText
    } = this.state;
    // if (!show) {
    //   return null;
    // }
    return (
      <div className={cls('members-wrap', { 'animation animating bounceIn': show })}>
        <div className="members-left">
          <div className="header">
            <div className="search">
              <p>发起聊天</p>
              <div className="search-bar">
                <i className="iconfont search" />
                <input
                  type="search"
                  placeholder="请输入完整startalk名字或ID"
                  onChange={this.onSearch}
                  value={searchText}
                />
              </div>
            </div>
          </div>
          <div className="company-struct">
            <Tree
              data={[{
                text: 'Staff',
                children: companyStruct,
                key: treeKey
              }]}
              showSelect
              selected={selectUsers}
              noSelected={selectedMap}
              onSelect={this.onTreeSelect}
              tree={tree}
              searchTree={searchTree}
              onClick={(u, t) => this.onTreeClick(u, t)}
            />
          </div>
        </div>
        <div className="members-right">
          <div className="header">已有联系人(共{selected.length}人)</div>
          {this.renderList()}
          <div className="footer">
            <div className="btn cancel" onClick={() => this.onClose()}>
              取消
            </div>
            <div className="btn ensure" onClick={() => this.addUser()}>
              确定
            </div>
          </div>
        </div>
      </div>
    );
  }
}
