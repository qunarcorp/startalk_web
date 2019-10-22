/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:03
 * @LastEditTime: 2019-08-13 12:10:29
 * @LastEditors: Please set LastEditors
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cls from 'classnames';
import actions from '../../actions';
import './index.less';
import sdk from '../../sdk';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl,
  domain: startalkNav.baseaddess && startalkNav.baseaddess.domain
}

@connect(
  state => ({
    userInfo: state.get('userInfo')
  }),
  actions
)
class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: {}, // { key: true } key=true 展开 false 闭合
      selected: {}, // { key: true } key=true 被选择的
      searchTree: {} // { key: true } key=true 搜索的结果
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selected, tree, searchTree } = this.state;
    if (nextProps.data.length === 0) {
      return null;
    }
    this.setState({
      selected: nextProps.selected ? nextProps.selected : selected,
      tree: nextProps.tree ? nextProps.tree : tree,
      searchTree: nextProps.searchTree ? nextProps.searchTree : searchTree
    });
    return true;
  }

  onTreeClick(e, data, disable) {
    e.stopPropagation();
    if (disable) {
      return null;
    }
    const { key } = data;
    const { tree } = this.state;
    const newTree = Object.assign({}, tree, {
      [key]: !tree[key]
    });
    this.setState({
      tree: newTree
    });
    let u = '';
    if (data.U && this.props.onClick) {
      u = `${data.U}@${webConfig.domain}`;
    }
    if (data.children) {
      const users = [];
      data.children.forEach((item) => {
        if (item.U) {
          users.push(`${item.U}@${webConfig.domain}`);
        }
      });
      if (users.length > 0) {
        this.cacheUserCard(users);
      }
    }
    this.props.onClick(u, newTree);
    if (this.props.showSelect && !data.children) {
      this.onSelect(data);
    }
    return true;
  }

  onSelect(item) {
    const { selected } = this.state;
    const newSelected = Object.assign(
      {},
      selected,
      {
        [item.key]: {
          flag: !(selected[item.key] && selected[item.key].flag),
          value: item
        }
      }
    );
    this.setState({
      selected: newSelected
    });

    this.props.onSelect(newSelected);
  }

  async cacheUserCard(users) {
    const { setUserInfo } = this.props;
    const res = await sdk.getUserCard(users);
    if (res.ret) {
      setUserInfo(res.data);
    }
    return res;
  }

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn'
  }

  renderItems(data) {
    const { selected, searchTree } = this.state;
    const { showSelect, noSelected } = this.props;
    return (
      <ul className="tree-list" style={{ paddingLeft: 20 }}>
        {
          data.map((item) => {
            const tree = this.state.tree[item.key];
            const active = !item.children && selected[item.key] && selected[item.key].flag;
            const disable = showSelect && !item.children && noSelected[item.U];
            if (Object.keys(searchTree).length > 0 && tree === undefined) {
              return null;
            }
            return (
              <li
                key={item.key}
                onClick={e => this.onTreeClick(e, item, disable)}
                className={cls('tree-list-item', {
                  deep: !item.children,
                  disabled: showSelect && !item.children && noSelected[item.U]
                })}
              >
                {
                  item.children ?
                    <i
                      className={cls('iconfont', {
                        'arrow-right': !tree,
                        'arrow-down': tree
                      })}
                    /> :
                    <img
                      src={this.props.userInfo.getIn([`${item.U}@${webConfig.domain}`, 'imageurl']) || item.icon}
                      alt=""
                      onError={this.imgError}
                    />
                }
                <p className={cls('text', { 'text-active': active })}>{item.text}</p>
                {
                  showSelect && !item.children && !noSelected[item.U] &&
                    <i
                      className={cls('iconfont nike', { active })}
                    />
                }
                {
                  tree && item.children && this.renderItems(item.children)
                }
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <div className={cls('tree', this.props.className)}>
        {this.renderItems(data)}
      </div>
    );
  }
}

const noob = () => {};
Tree.defaultProps = {
  className: '',
  data: [],
  showSelect: false,
  onSelect: noob,
  onClick: '',
  selected: [],
  noSelected: {}
};

export default Tree;
