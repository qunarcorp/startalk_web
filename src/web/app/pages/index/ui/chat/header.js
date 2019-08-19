import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import AddUser from '../modal/addUser';
import MessageBox from '../../../../common/components/message-box';
import actions from '../../actions';
import sdk from '../../sdk';

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    currentSession: state.getIn(['chat', 'currentSession'])
  }),
  actions
)
export default class Header extends Component {
  constructor() {
    super();
    this.state = {
      showAddUser: false,
      showSetting: false,
      onLineStatus: ''
    };
  }

  componentDidMount() {
    const {
      removeSession,
      removeCurrentSessionUser,
      // mergeCurrentSessionUser,
      userInfo,
      setUserInfo,
      currentSession
    } = this.props;
    // const { currentSession } = this.props;
    // if (currentSession.mFlag === '2') {
    this.getUserList();
    // }
    this.getOnLineStatus(currentSession);

    sdk.message
      // 群成员角色变化
      .on('group_change_role', () => {
        // mergeCurrentSessionUser({
        //   jid: msg.from,
        //   affiliation: msg.role
        // });
        this.getUserList();
      })
      // 群成员退出
      .on('group_user_exit', (msg) => {
        // 发现是自己的话，移除会话
        if (msg.user === sdk.bareJid) {
          removeSession(msg.from);
        } else if (this.props.currentSession.get('user') === msg.from) {
          // 从当前群成员列表里面删除
          removeCurrentSessionUser(msg.user);
        }
      })
      // 群成员邀请
      .on('group_invite', async (msg) => {
        // 用户卡片如果不存在，请求
        if (!userInfo.get(msg.user)) {
          const res = await sdk.getUserCard([msg.user]);
          if (res.ret) {
            setUserInfo(res.data);
          }
        }
        this.getUserList();
        // mergeCurrentSessionUser({
        //   jid: msg.user
        // });
      });
  }

  async componentWillReceiveProps(nextProps) {
    const { currentSession } = this.props;
    if (currentSession.get('user') !== nextProps.currentSession.get('user')) {
      // if (nextProps.currentSession.mFlag === '2') {
      this.getUserList(nextProps);
      this.getOnLineStatus(nextProps.currentSession);
    }
    if (!nextProps.currentSession.get('userList')) {
      this.getUserList(nextProps);
    }
  }

  onViewGroupInfo(groupId) {
    const { setModalGroupCard } = this.props;
    setModalGroupCard({
      show: true,
      groupId
    });
  }

  onGroupExit(user) {
    MessageBox.confirm(
      '即将从该群退出，如果继续且需要恢复此操作，<br />你需要让当前群成员重新邀请。是否继续?',
      '警告'
    ).ok(() => {
      sdk.groupExit(user);
    });
  }

  onGroupDistory(user) {
    MessageBox.confirm(
      '当前群即将被系统回收。<br />该操作不可挽回，是否继续?',
      '警告'
    ).ok(() => {
      sdk.groupDistory(user);
    });
  }

  async getOnLineStatus(currentSession) {
    const user = currentSession.get('user');
    const mFlag = currentSession.get('mFlag');
    if (user && mFlag === '1') {
      const userArr = user.split('@');
      const domain = userArr[1];
      const u = userArr[0];
      const res = await sdk.onLineStatus([{
        domain,
        users: [u]
      }]);
      if (
        res.ret
        && res.data.length > 0
        && res.data[0]
      ) {
        const { ul } = res.data[0];
        let status = '';
        if (ul.length > 0 && ul[0]) {
          status = ul[0].o;
        }
        this.setState({
          onLineStatus: status
        });
      }
      // away online []
    } else {
      this.setState({
        onLineStatus: ''
      });
    }
  }

  async getUserList(nextProps) {
    const {
      currentSession,
      setCurrentSessionUsers,
      setUserInfo
    } = nextProps || this.props;
    if (currentSession.get('mFlag') === '2') {
      const res = await sdk.getGroupUserList(currentSession.get('user'));
      if (res.ret) {
        setCurrentSessionUsers(res.data);
        const usersRes = await sdk.getUserCard(res.data.map(item => item.jid));
        if (usersRes.ret) {
          setUserInfo(usersRes.data);
        }
      }
    } else {
      // 把自己跟对方加入
      setCurrentSessionUsers([
        { jid: currentSession.get('user') }
      ]);
    }
  }

  toggleMember = () => {
    // this.setState({
    //   showMember: !this.state.showMember
    // });
    this.props.setMembersInfo({
      show: true,
      isNew: false
    });
  };

  showSettingMenu(b) {
    clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.setState({ showSetting: b });
    }, 100);
  }

  renderOptions(user, userList) {
    const { showSetting } = this.state;
    let isOwner = false;
    if (showSetting && userList) {
      userList.forEach((item) => {
        if (item.get('jid') === sdk.bareJid && item.get('affiliation') === 'owner') {
          isOwner = true;
        }
      });
    }
    return (
      <div
        className="setting"
        onMouseLeave={() => { this.showSettingMenu(false); }}
        onMouseEnter={() => { this.showSettingMenu(true); }}
      >
        <i className="icon panel-menu" />
        <div
          className={cls('menu', {
            'animation animating bounceIn': showSetting
          })}
        >
          <a onClick={() => { this.onViewGroupInfo(user); }}>查看群资料</a>
          <a onClick={() => { this.onGroupExit(user); }}>退出该群</a>
          {
            isOwner ? (<a onClick={() => { this.onGroupDistory(user); }}>销毁该群</a>) : null
          }
        </div>
      </div>
    );
  }

  render() {
    const { showAddUser } = this.state;
    const { userInfo, currentSession } = this.props;
    const mFlag = currentSession.get('mFlag');
    const user = currentSession.get('user');
    const userList = currentSession.get('userList');
    let name = user;
    const isGroup = mFlag === '2';
    const popleNum = userList ? userList.size : 0;
    if (!isGroup && userInfo.get(user)) {
      name = userInfo.getIn([user, 'nickname']);
    } else if (isGroup && userInfo.get(user)) {
      name = userInfo.getIn([user, 'SN']) || user;
    }
    return (
      <div className="chat-header">
        <div className="title-wrap">
          <div className="title">
            <a className="title-name">{name}</a>
            <span>
              {isGroup ? (<span className="title-count">({popleNum})</span>) : null}
            </span>
            {
              this.state.onLineStatus === 'online' && <span className="status" />
            }
            {
              this.state.onLineStatus === 'away' && <i className="iconfont clock" />
            }
          </div>
          <div className="members" onClick={this.toggleMember}>
            <i className="icon people3" />
          </div>
        </div>
        {
          showAddUser
            ? (<AddUser
              hide={() => { this.setState({ showAddUser: false }); }}
            />
            )
            : null
        }
      </div>
    );
  }
}
