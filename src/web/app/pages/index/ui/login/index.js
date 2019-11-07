/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-08-19 10:30:26
 * @LastEditors: Please set LastEditors
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';
import cls from 'classnames';
import actions from '../../actions';
import sdk from '../../sdk';

const webConfig = {
  domain: startalkNav.baseaddess && startalkNav.baseaddess.domain
}

const { $ } = window.QtalkSDK;

@connect(
  state => ({
    status: state.getIn(['chat', 'connectStatus'])
  }),
  actions
)
export default class Login extends Component {
  constructor() {
    super();
    const user = Cookies.get('qt_username') || '';
    const pwd = Cookies.get('qt_password') || '';
    const avatar = Cookies.get('qt_avatar') || '';
    const domainMap = JSON.parse(Cookies.get('qt_domain_map') || JSON.stringify({ [webConfig.domain]: true }));
    const domainMapArr = Object.keys(domainMap);
    let selectDomain = '';
    domainMapArr.forEach((item) => {
      if (domainMap[item]) {
        selectDomain = item;
      }
    });
    this.state = {
      showDomain: false,
      showAddDomain: false,
      loading: false,
      selectDomain,
      domain: '',
      domainMapArr,
      domainMap,
      user,
      avatar,
      pwd
    };
  }

  componentDidMount() {
    const { changeChatField } = this.props;
    // 监听链接
    sdk.connection
      .on('connect:success', () => {
        const day = 1;
        const domainMap = JSON.parse(Cookies.get('qt_domain_map') || JSON.stringify({ [webConfig.domain]: true }));
        Object.keys(domainMap).forEach((item) => {
          domainMap[item] = false;
        });
        domainMap[this.state.selectDomain] = true;
        Cookies.set('qt_username', sdk.connection.auth.user, { expires: day });
        Cookies.set('qt_password', sdk.connection.auth.pwd, { expires: day });
        Cookies.set('qt_domain_map', domainMap, { expires: day });
        changeChatField({ connectStatus: 'success' });
      })
      .on('connect:authfail', () => {
        changeChatField({ connectStatus: 'authfail' });
        this.resetStatus();
      })
      .on('connect:fail', () => {
        changeChatField({ connectStatus: 'fail' });
        this.resetStatus();
      })
      .on('connect:disconnected', () => {
        changeChatField({ connectStatus: 'disconnected' });
        this.resetStatus();
      });

    const { user, pwd, selectDomain } = this.state;
    if (user && pwd && selectDomain) {
      this.login(true);
    }
  }

  componentWillUnmount() {
    sdk.connection.removeAllListeners('connect:success')
      .removeAllListeners('connect:authfail')
      .removeAllListeners('connect:fail')
      .removeAllListeners('connect:disconnected');
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  onEnter(e) {
    if (e.keyCode === 13) {
      this.login(false);
    }
  }

  onAddDomain() {
    const { domainMapArr, domainMap, domain } = this.state;
    if (/^@{1}/.test(domain)) {
      const val = domain.replace(/^@{1}/, '');
      domainMapArr.push(val);
      domainMap[val] = true;
      this.setState({
        showAddDomain: false,
        selectDomain: val,
        domainMapArr,
        domainMap
      });
    }
  }

  onShowAddDomain() {
    const { domainMapArr, domainMap } = this.state;
    domainMapArr.forEach((item) => {
      domainMap[item] = false;
    });
    this.setState({
      showAddDomain: true,
      domainMapArr,
      domain: ''
    }, () => {
      let top = 1000;
      const $dl = $('.domain-list')[0];
      if ($dl.offsetTop) {
        top = $dl.offsetTop;
      }
      $('.domain-list').scrollTop(top);
    });
  }

  onDomainClick(d) {
    const { domainMapArr, domainMap } = this.state;
    domainMapArr.forEach((item) => {
      if (d === item) {
        domainMap[item] = true;
      } else {
        domainMap[item] = false;
      }
    });
    this.setState({
      showAddDomain: false,
      domainMapArr,
      selectDomain: d,
      domain: d
    });
  }

  login(autologin) {
    if (!webConfig.domain) {
      alert('请正确配置导航地址');
      return;
    }
    const {
      user,
      pwd,
      loading,
      selectDomain
    } = this.state;
    if (loading) {
      return;
    }
    this.props.changeChatField({
      connectStatus: 'loading'
    });
    this.setState({ loading: true }, () => {
      sdk.connection.connect(user, pwd, selectDomain, autologin);
    });
  }

  resetStatus() {
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 2000);
  }

  renderDomain() {
    const {
      domain,
      domainMap,
      domainMapArr,
      showAddDomain
    } = this.state;
    return (
      <div className="domain-list">
        {
          domainMapArr.map((item, idx) => (
            <div key={`domain-${item}`} className="item" onClick={() => this.onDomainClick(item)}>
              {
                domainMap[item] ?
                  <i className="iconfont nike" /> :
                  <i className="iconfont circle" />
              }
              <span>
                域名{idx + 1}&nbsp;:
              </span>
              <span>
                @{item}
              </span>
            </div>
          ))
        }
        {
          showAddDomain &&
            <div className="item">
              <i className="iconfont nike" />
              <span>
                域名&nbsp;:
              </span>
              <div className="input">
                <input
                  className="input"
                  type="text"
                  placeholder="@"
                  name="domain"
                  value={domain}
                  onInput={this.onChange}
                  onFocus={(e) => {
                    if (e.target.value === '') {
                      this.setState({
                        domain: '@'
                      });
                    }
                  }}
                />
                <div
                  className={cls('check', { right: domain })}
                  onClick={() => this.onAddDomain()}
                >
                  <i className="iconfont nike2" />
                </div>
              </div>
            </div>
        }
      </div>
    );
  }

  render() {
    const { status } = this.props;
    const {
      user,
      pwd,
      loading,
      showDomain,
      selectDomain,
      avatar
    } = this.state;
    return (
      <div className="login-wrap">
        <div className="login">
          {
            avatar ?
              <div className="avatar">
                <img className="img" src={avatar} alt="" />
              </div> :
              <div className="avatar green">
                <i className="iconfont camel" />
              </div>
          }
          <p className="status">{status}</p>
          {
            loading ?
              <div
                className="cancel"
                onClick={() => {
                  this.setState({ loading: false });
                  sdk.connection.disConnection();
                }}
              >
                取消
              </div> :
              <div className="form">
                <div className="account-info">
                  <div className="item bb">
                    <input
                      defaultValue={user}
                      className="input"
                      type="text"
                      placeholder="用户名"
                      name="user"
                      onInput={this.onChange}
                      style={{ width: 100 }}
                    />
                    <div className="domain">
                      @{selectDomain}
                    </div>
                  </div>
                  <div className="item">
                    <input
                      defaultValue={pwd}
                      className="input"
                      type="password"
                      placeholder="密码"
                      name="pwd"
                      onInput={this.onChange}
                      onKeyUp={(e) => { this.onEnter(e); }}
                      style={{ width: 188 }}
                    />
                  </div>
                </div>
                <a
                  onClick={() => { this.login(false); }}
                  className={cls('btn-login', { disabled: loading })}
                >
                  登录
                </a>
              </div>
          }
          {/* <div className="domain-choose" onClick={() => this.setState({ showDomain: !showDomain })}>
            <i
              className={cls('iconfont', {
                'double-arrow-down': !showDomain,
                'double-arrow-up': showDomain
              })}
            />
          </div> */}
        </div>
        {
          showDomain &&
            <div className="domain-block">
              {this.renderDomain()}
              <div className="domain-add-btn" onClick={() => this.onShowAddDomain()}>
                <i className="iconfont plus" />
                新增
              </div>
            </div>
        }
      </div>
    );
  }
}
