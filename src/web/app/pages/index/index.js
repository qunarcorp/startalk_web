/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-13 12:14:22
 * @LastEditors: Please set LastEditors
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
import { treeKey } from './consts';
import sdk from './sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}
const users = {};
const bu = [];

Notification.requestPermission();//用户是否同意显示通知

@connect(
  state => ({
    connectStatus: state.getIn(['chat','connectStatus']),
    nav: state.getIn(['nav'])
  }),
  actions
)
export default class Page extends Component {
  constructor(props) {
    super(props)

    // this.getStartalkNav()
    // this.state = {
    //   flag: false
    // }
  }
  
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

  async getStartalkNav() {
    const { setStartalkNav, setPublicKey } = this.props
    const req = await axios({
      method: 'get',
      url: '/startalk_nav',
      headers: { 'Content-Type': 'application/json' }
    });
    const { data } = req;

    setStartalkNav(data);

    const publicKeyReq = await this.getPublicKey(data.baseaddess.javaurl)
    const { data: publicKeyData } = publicKeyReq
    console.log(publicKeyData)
    if (publicKeyData.ret) {
      initSdk(data, publicKeyData.data.pub_key_fullkey)
        .then(sdk => {
          console.log(sdk)
          this.setState({ flag: true })
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
        })

      setPublicKey(publicKeyData.data)
    } else {
      alert(publicKeyData.errmsg)
    }
  }

  getPublicKey() {
    return axios({
      method: 'get',
      url: '/package/qtapi/nck/rsa/get_public_key.do',
      headers: { 'Content-Type': 'application/json' }
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
