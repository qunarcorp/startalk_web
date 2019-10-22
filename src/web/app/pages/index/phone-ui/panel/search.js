import React, { Component } from 'react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';
import Cookies from 'js-cookie';
// import cls from 'classnames';
import actions from '../../actions';
import sdk from '../../sdk';

@connect(
  state => ({
    currentSession: state.getIn(['chat', 'currentSession'])
  }),
  actions
)
export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      value: '',
      result: []
    };
  }

  componentDidMount() {
  }

  onClearClick() {
    this.setState({
      value: '',
      showModal: false
    });
  }

  onSessionClick = async (data) => {
    const {
      setUserInfo,
      setCurrentSession,
      changeChatField
    } = this.props;
    this.setState({
      value: '',
      showModal: false
    });
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

  onChange = (e) => {
    const val = e.target.value.trim();
    this.setState({ value: val });
    clearTimeout(this.timer);
    this.timer = setTimeout(async () => {
      const state = {};
      if (val.length > 1) {
        state.showModal = true;
        // 获取查询结果
        const res = await sdk.searchUser(val);
        if (res.data) {
          state.result = res.data;
        }
      } else {
        state.showModal = false;
      }
      this.setState(state);
    }, 250);
  }

  timer = null;
  renderResult = () => {
    const { result } = this.state;
    if (result && result.length < 1) {
      return null;
    }
    return (
      <ul className="result-list">
        {
          result.map((group) => {
            const arr = [];
            if (result.length > 1) {
              arr.push(<li className="title">{group.groupLabel}</li>);
            }
            const lis = group.info.map(item => (
              <li key={`search-${item.uri}`} onClick={() => this.onSessionClick({ user: item.uri, mFlag: `${group.groupPriority + 1}` })}>
                <div className="img-wrap">
                  <LazyLoad height={40} overflow>
                    <img src={item.icon || result[0].defaultportrait} alt="" />
                  </LazyLoad>
                </div>
                <p className="info">
                  <span className="l">{item.label}</span>
                  <span className="c">{item.content}</span>
                </p>
              </li>
            ));
            return arr.concat(lis);
          })
        }
      </ul>
    );
  }
  render() {
    return (
      <div className="search-bar">
        <i className="iconfont search" />
        <input
          className="keyword"
          type="search"
          placeholder="搜索"
          value={this.state.value}
          onChange={this.onChange}
          onBlur={() => { setTimeout(() => { this.setState({ showModal: false }); }, 300); }}
        />
        {
          this.state.showModal &&
          <div className="result">
            {this.renderResult()}
            {/* <p className="find">找不到?尝试打开会话</p>
            <p className="try" onClick={() => this.onSessionClick({ user: this.state.value, mFlag: '1' })}>打开ID为[<span>{this.state.value}</span>]的对话</p> */}
          </div>
        }
      </div>
    );
  }
}
