import React, { Component } from 'react';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';
import LazyLoad from 'react-lazyload';
import Modal from '../../../../common/components/modal';
import Select from '../../../../common/components/select2-one';
import actions from '../../actions';
import sdk from '../../sdk';
import webConfig from '../../../../../../web_config';

@connect(
  state => ({
    userInfo: state.get('userInfo'),
    companyStruct: state.getIn(['chat', 'companyStruct']),
    currentSession: state.getIn(['chat', 'currentSession'])
  }),
  actions
)
export default class AddFriends extends Component {
  constructor() {
    super();
    this.state = {
      domainList: [], // 域列表
      selectDomain: {}, // 选中的域
      users: []
    };
  }

  componentDidMount() {
    sdk.ready(async () => {
      const res = await sdk.getDomainList();
      if (res.ret) {
        this.setState({ domainList: res.data.domains, selectDomain: res.data.domains[0] || {} });
      }
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   // if (nextProps.userList.length > 0) {
  //   // this.initTree(nextProps);
  //   // }
  // }

  onSearch = (e) => {
    const val = e.target.value.trim();
    clearTimeout(this.time);
    this.time = setTimeout(async () => {
      const res = await sdk.searchSbuddy({
        id: this.state.selectDomain.id,
        key: val,
        ckey: Cookies.get('q_ckey'),
        limit: 12,
        offset: 0
      });
      if (res.ret) {
        this.setState({
          users: res.data.users
        });
      }
    }, 250);
  };

  render() {
    return (
      <Modal className="m-add-friends" show>
        <div className="title">
          查找联系人
          <i onClick={() => { this.props.hide(); }} className="icon close" />
        </div>
        <div className="content">
          <div className="range">
            <p className="range-label">查找范围:</p>
            <Select
              className="range-select"
              data={this.state.domainList}
              value={this.state.selectDomain}
              mapKey={{ text: 'name', value: 'id' }}
              onSelect={item => this.setState({ selectDomain: item })}
            />
          </div>
          <div className="selector">
            <i className="icon add-user-search" />
            <input
              type="text"
              className="input"
              placeholder="搜索"
              onInput={this.onSearch}
            />
          </div>
          <ul className="list">
            {
              this.state.users.map(item => (
                <li key={`user-list-${item.uri}`}>
                  <div className="img-wrap">
                    <LazyLoad height={40} overflow>
                      <img src={item.icon || webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png'} alt="" />
                    </LazyLoad>
                  </div>
                  <div className="button">
                    添加好友
                  </div>
                  <p className="info">
                    <span className="l">{item.label || item.uri}</span>
                    <span className="c">{item.content}</span>
                  </p>
                </li>
              ))
            }
          </ul>
        </div>
      </Modal>
    );
  }
}
