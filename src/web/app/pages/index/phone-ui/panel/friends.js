import React, { Component } from 'react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';
import cls from 'classnames';
import actions from '../../actions';
// import $ from '../../../../common/lib/jstree';
import Tree from '../tree';
import { treeKey } from '../../consts';
// import AddFriends from '../modal/addFriends';
import sdk from '../../sdk';

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    companyStruct: state.getIn(['chat', 'companyStruct']),
    mucs: state.getIn(['friends', 'mucs']),
    friends: state.getIn(['friends', 'friends']),
    session: state.getIn(['chat', 'session']),
    currentSession: state.getIn(['chat', 'currentSession']),
    currentFriend: state.getIn(['chat', 'currentFriend'])
  }),
  actions
)
export default class Friends extends Component {
  constructor() {
    super();
    this.state = {
      // selected: []
      // showAddFriends: false, // modal 添加好友
      showMucs: false, // 群组
      showFris: false // 好友
    };
  }

  componentDidMount() {
    sdk.ready(async () => {
      const [res, res2] = await Promise.all([
        sdk.getIncrementMucs(),
        sdk.getUserFriends()
      ]);
      if (res.ret) {
        const mucs = res.data.map(item => `${item.M}@${item.D}`);
        this.cacheUserCard(mucs, false);
        this.props.setFriendsMucs(mucs);
      }
      if (res2.ret) {
        const friends = res2.data.map(item => `${item.F}@${item.H}`);
        this.cacheUserCard(friends, true);
        this.props.setFriendsUsers(friends);
      }
    });
  }

  onContextMenu(e, data) {
    e.preventDefault();
    const { setContentMenu } = this.props;
    setContentMenu({
      show: true,
      type: 'friends',
      data,
      pos: {
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }
    });
  }

  onSessionClick = async (data) => {
    const {
      setUserInfo,
      setCurrentSession,
      changeChatField
    } = this.props;
    if (data.mFlag === '2') {
      const res = await sdk.getGroupCard([data.user]);
      if (res.ret) {
        setUserInfo(res.data);
      }
    }
    setCurrentSession(data);
    changeChatField({ switchIndex: 'chat' });
    window.QtalkSDK.$('.session').scrollTop(0);
  }

  onFriendClick = (data) => {
    const { user } = data;
    if (user) {
      if (this.clickUser === user) {
        this.doubleClick = true;
      }
      this.clickUser = user;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.doubleClick) {
          this.onSessionClick(data);
        } else {
          this.props.changeChatField({ currentFriend: data });
        }
        this.doubleClick = false;
        this.clickUser = '';
      }, 200);
    }
  }

  async cacheUserCard(users, isChat) {
    const { setUserInfo } = this.props;
    const res = await sdk[isChat ? 'getUserCard' : 'getGroupCard'](users);
    if (res.ret) {
      setUserInfo(res.data);
    }
    return res;
  }

  showCard = () => {
    const { changeChatField } = this.props;
    changeChatField({ isCard: true });
  }

  renderGroup() {
    const { mucs, userInfo } = this.props;
    return (
      <ul className="result-list" onClick={()=>{this.showCard()}}>
        {
          mucs.map((item) => {
            const mucInfo = userInfo.get(item);
            return mucInfo ?
              (
                <li
                  key={`friends-mucs-${mucInfo.get('MN')}`}
                  onContextMenu={(e) => { this.onContextMenu(e, { user: item, mFlag: '2' }); }}
                  onClick={() => { this.onFriendClick({ user: item, mFlag: '2' }); }}
                  className={cls({ active: this.props.currentFriend.get('user') === item })}
                >
                  <div className="img-wrap">
                    <LazyLoad height={40} overflow>
                      <img src={mucInfo.get('MP')} alt="" />
                    </LazyLoad>
                  </div>
                  <p className="info">
                    <span className="l">{mucInfo.get('SN')}</span>
                    <span className="c">{mucInfo.get('MT')}</span>
                  </p>
                </li>
              ) : null;
          })
        }
      </ul>
    );
  }

  renderFriends() {
    const { friends, userInfo } = this.props;
    return (
      <ul className="result-list" onClick={()=>{this.showCard()}}>
        {
          friends.map((item) => {
            const friendInfo = userInfo.get(item);
            return friendInfo ?
              (
                <li
                  key={`friends-users-${friendInfo.get('username')}`}
                  onContextMenu={(e) => { this.onContextMenu(e, { user: item, mFlag: '1' }); }}
                  onClick={() => { this.onFriendClick({ user: item, mFlag: '1' }); }}
                  className={cls({ active: this.props.currentFriend.get('user') === item })}
                >
                  <div className="img-wrap">
                    <LazyLoad height={40} overflow>
                      <img src={friendInfo.get('imageurl')} alt="" />
                    </LazyLoad>
                  </div>
                  <p className="info name">
                    {friendInfo.get('nickname') || friendInfo.get('username')}
                  </p>
                </li>
              ) : null;
          })
        }
      </ul>
    );
  }

  // <div className="add" onClick={() => this.setState({ showAddFriends: true })}>加好友</div>
  // {
  //   this.state.showAddFriends &&
  //     <AddFriends
  //       userList={[]}
  //       hide={() => { this.setState({ showAddFriends: false }); }}
  //     />
  // }
  render() {
    const {
      show,
      mucs,
      friends,
      companyStruct
    } = this.props;
    return (
      <div className="box friends" style={{ display: show ? '' : 'none' }}>

        <div className="list-wrap">
          <div className="bar" onClick={() => this.setState({ showMucs: !this.state.showMucs })}>
            <div className="i">
              <i className={cls('iconfont', { 'arrow-right': !this.state.showMucs, 'arrow-down': this.state.showMucs })} />
            </div>
            <div className="title">
              群组
            </div>
            <div className="num">
              {mucs && mucs.size}
            </div>
          </div>
          {
            this.state.showMucs && this.renderGroup()
          }
        </div>
        <div className="list-wrap">
          <div className="bar" onClick={() => this.setState({ showFris: !this.state.showFris })}>
            <div className="i">
              <i className={cls('iconfont', { 'arrow-right': !this.state.showFris, 'arrow-down': this.state.showFris })} />
            </div>
            <div className="title">
              好友
            </div>
            <div className="num">
              {friends && friends.size}
            </div>
          </div>
          {
            this.state.showFris && this.renderFriends()
          }
        </div>
        <div className="list-wrap">
          <Tree
            data={[{
              text: 'Staff',
              children: companyStruct,
              key: treeKey
            }]}
            onClick={(item) => { this.onFriendClick({ user: item, mFlag: '1' }); }}
          />
        </div>
      </div>
    );
  }
}
