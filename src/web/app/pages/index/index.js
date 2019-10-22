/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-20 17:25:02
 * @LastEditors: chaos.dong
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
// import moment from 'moment';
import actions from './actions';
import Login from './ui/login';
import Chat from './ui/chat';
import Panel from './ui/panel';
import UserCard from './ui/modal/userCard';
import GroupCard from './ui/modal/groupCard';
import ContentMenu from './ui/modal/contentmenu';
import Members from './ui/modal/members';

import PhonePanel from './phone-ui/panel';
import PhoneUserCard from './phone-ui/modal/userCard';
import PhoneGroupCard from './phone-ui/modal/groupCard';
import PhoneMembers from './phone-ui/modal/members';
import PhoneChat from './phone-ui/chat';
import PhoneContentMenu from './phone-ui/modal/contentmenu';

import { treeKey } from './consts';
import sdk from './sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}
const users = {};
const usersName = {};
const bu = [];

@connect(
  state => ({
    connectStatus: state.getIn(['chat', 'connectStatus']),
    nav: state.getIn(['nav'])
  }),
  actions
)
export default class Page extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    sdk.ready(async () => {
      const res = await sdk.getCompanyStruct();
      if (res.ret) {
        const treeData = this.createTree(res.data);
        // res.data 处理成jstree结构
        this.props.setChatField({
          companyStruct: this.genTreeData(treeData || [], treeKey),
          companyUsers: users,
          companyUsersName: usersName
        });
      }
    });
  }
  
  // 把平级数组转化为树状结构
  createTree(data) {
    // 控制每个人的可视数据
    const visible = [];
    data.forEach((item) => {
      if (item.visibleFlag === true) {
        visible.push(item);
      }
    });
    const treeArray = [];
    visible.forEach((item) => {
      const d = item.D;
      let floor = [];
      floor = d.split('/').slice(1);
      let nowArray = treeArray;
      for (let i = 0; i < floor.length; i++) {
        const index = this.checkIfExist(nowArray, floor[i]);
        const vote = {};
        vote.N = item.N;
        vote.U = item.U;
        vote.S = item.S;
        if (index !== false && i !== floor.length - 1) {
          nowArray = nowArray[index].SD;
        } else if (index !== false && i === floor.length - 1) {
          nowArray[index].UL.push(vote);
        } else if (index === false && i === floor.length - 1) {
          nowArray.push({
            D: floor[i],
            UL: [vote],
            SD: []
          });
        } else {
          nowArray.push({
            D: floor[i],
            UL: [],
            SD: []
          });
          nowArray = nowArray[nowArray.length - 1].SD;
        }
      }
    });
    return treeArray;
  }

  // 判断当前数组中有没有传进去的name的这个部门
  checkIfExist(array = [], name = '') {
    let flag = false;
    if (array.length === 0) {
      flag = false;
    } else {
      for (let i = 0; i < array.length; i++) {
        if (array[i].D === name) {
          flag = i;
          break;
        }
      }
    }
    return flag;
  }

  genTreeData(data, id) {
    const ret = [];
    data.length && data.forEach((item, idx) => {
      const key = `${id}-${idx}`;
      bu.push(item.D);
      const ul = [];
      item.UL.forEach((u) => {
        users[u.U] = {
          bu: bu.slice(0),
          U: u.U,
          N: u.N,
          text: `${u.N}[${u.U}]`,
          icon: webConfig.fileurl + '/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png',
          key: `${key}-${u.U}`
        };
        usersName[u.N] = {
          bu: bu.slice(0),
          U: u.U,
          N: u.N,
          text: `${u.N}[${u.U}]`,
          icon: webConfig.fileurl + '/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png',
          key: `${key}-${u.U}`
        };
        usersName[u.U] = {
          bu: bu.slice(0),
          U: u.U,
          N: u.N,
          text: `${u.N}[${u.U}]`,
          icon: webConfig.fileurl + '/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png',
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
    const phone = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

    if (connectStatus === 'success' && !phone) {
      Notification.requestPermission();//用户是否同意显示通知
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
    } else if(connectStatus === 'success' && phone) {
      return (
        <div id="phone_main">
          <PhonePanel />
          <PhoneUserCard />
          <PhoneGroupCard />
          <PhoneMembers />
          <PhoneChat />
          <PhoneContentMenu />
        </div>
      )
    }
    return (
      <Login />
    );
  }
}
