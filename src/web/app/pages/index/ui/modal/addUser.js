/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-08-13 12:01:48
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import Modal from '../../../../common/components/modal';
import actions from '../../actions';
import $ from '../../../../common/lib/jstree';
import sdk from '../../sdk';

const webConfig = {
  domain: startalkNav.baseaddess && startalkNav.baseaddess.domain
}

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    companyStruct: state.getIn(['chat', 'companyStruct']),
    currentSession: state.getIn(['chat', 'currentSession'])
  }),
  actions
)
export default class AddUser extends Component {
  constructor() {
    super();
    this.state = {
      selected: []
    };
  }

  componentDidMount() {
    this.initTree();
  }

  onSearch = (e) => {
    const val = e.target.value.trim();
    clearTimeout(this.time);
    this.time = setTimeout(() => {
      $('#addUserTree').jstree(true).search(val);
    }, 300);
  };

  time = null;

  initTree(nextProps) {
    const { companyStruct, currentSession, userInfo } = nextProps || this.props;
    $('#addUserTree')
      .on('changed.jstree', (e, data) => {
        const ret = [];
        data.selected.forEach((id, index) => {
          const json = data.instance.get_node(data.selected[index]).original;
          if (json.U) {
            ret.push(json);
          }
        });
        // 单聊，要把会话对象加入
        if (ret.length > 0 && currentSession.get('mFlag') === '1') {
          const u = userInfo.get(currentSession.get('user'));
          ret.push({
            U: u.get('username') || window.QtalkSDK.env.Strophe.getNodeFromJid(currentSession.get('user')),
            N: u.get('nickname') || ''
          });
        }
        this.setState({
          selected: ret
        });
      })
      .jstree({
        core: {
          data: [
            {
              text: 'Staff',
              state: {
                opened: true
              },
              children: companyStruct
            }
          ]
        },
        plugins: [
          'checkbox',
          'search'
        ]
      });
    // this.initTree = () => { };
  }

  addUser = async () => {
    const { selected } = this.state;
    const { changeChatField, currentSession, clearSessionCnt } = this.props;
    const users = selected.map(u => ({ jid: `${u.U}@${webConfig.domain}`, nick: u.N }));
    if (users.length > 0) {
      const res = await sdk.addUser(users);
      if (res.ret) {
        this.props.hide();
        // 单聊创建新群后，激活会话
        if (currentSession.get('mFlag') === '1') {
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
        alert(res.errmsg);
      }
    }
  };

  render() {
    const { selected } = this.state;
    return (
      <Modal className="m-add-user" show>
        <div className="title">
          添加会话成员
          <i onClick={() => { this.props.hide(); }} className="icon close" />
        </div>
        <div className="content">
          <div className="selector">
            <i className="icon add-user-search" />
            <input
              type="text"
              className="input"
              placeholder="搜索"
              onInput={this.onSearch}
            />
          </div>
          <div className="list">
            <div id="addUserTree" />
          </div>
        </div>
        <div className="footer">
          <a
            onClick={this.addUser}
            className={cls('btn', {
              'btn-default': selected.length === 0,
              'btn-primary': selected.length > 0
            })}
          >
            确定
          </a>
        </div>
      </Modal>
    );
  }
}
