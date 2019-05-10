import React, { Component } from 'react';
import { connect } from 'react-redux';
// import moment from 'moment';
import actions from './actions';
import Login from './ui/login';
import Chat from './ui/chat';
import Panel from './ui/panel';
import UserCard from './ui/modal/userCard';
import GroupCard from './ui/modal/groupCard';
import ContentMenu from './ui/modal/contentmenu';
import Members from './ui/modal/members';
import { treeKey } from './consts';
import sdk from './sdk';
import webConfig from '../../../../web_config';
const users = {};
const bu = [];
Notification.requestPermission();//用户是否同意显示通知

@connect(
  state => ({
    connectStatus: state.getIn(['chat','connectStatus'])
  }),
  actions
)
export default class Page extends Component {
  componentDidMount() {
    sdk.ready(async () => {
      const res = await sdk.getCompanyStruct();
      if (res.ret) {
        // res.data 处理成jstree结构
        this.props.setChatField({
          companyStruct: this.genTreeData(res.data || [], treeKey),
          companyUsers: users
        });
      }
    });
  }

  genTreeData(data, id) {
    const ret = [];
    data.length&&data.forEach((item, idx) => {
      const key = `${id}-${idx}`;
      bu.push(item.D);
      const ul = [];
      item.UL.forEach((u) => {
        users[u.U] = {
          bu: bu.slice(0),
          U: u.U,
          N: u.N,
          text: `${u.U}[${u.N}]`,
          icon: webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png',
          key: `${key}-${u.U}`
        };
        ul.push(users[u.U]);
      });
      ret.push({
        text: item.D,
        children: [].concat(ul, this.genTreeData(item.SD, key)),
        key
      });
      bu.pop();
    });
    return ret;
  }

  render() {
    const { connectStatus } = this.props;
    if (connectStatus === 'success') {
      return (
        <div id="main">
          <Panel />
          <Chat />
          <UserCard />
          <GroupCard />
          <ContentMenu />
          <Members />
        </div>
      );
    }
    return (
      <Login />
    );
  }
}
