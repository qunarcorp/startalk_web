/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-21 16:44:57
 * @LastEditors: chaos.dong
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';
import cls from 'classnames';
import { Map } from 'immutable';
import '../../../../common/lib/kindeditor/kindeditor-all';
import Emotions from './emotions';
import actions from '../../actions';
import sdk from '../../sdk';
import $ from '../../../../common/lib/caret';
import footera3faf4373242d1 from '../../../../../../assets/footer/a3faf4373242d1.png';

const webConfig = {
  fileurl: startalkNav.baseaddess && startalkNav.baseaddess.fileurl
}

$(window).on('drop dragover', (e) => {
  e.preventDefault();
});
window.KindEditor.ready(() => { });
@connect(
  state => ({
    userInfo: state.get('userInfo'),
    currentSession: state.getIn(['chat', 'currentSession'])
  }),
  actions
)
export default class Footer extends Component {
  constructor() {
    super();
    this.state = {
      showFileMenu: false,
      // key(会话ID)：value(输入框内容)
      atListPos: {}, // @展示列表坐标
      showAtList: false, // 展示@
      userList: [], // 展示的列表
      active: 0,
      atUsers: {}
    };
  }

  componentDidMount() {
    window.KindEditor.ready((K) => {
      this.K = K;
      this.editor = K.create('#editor', {
        loadStyleMode: false,
        pasteType: 1,
        items: [],
        newlineTag: 'br',
        htmlTags: {
          br: [],
          img: ['src', 'data-emoticon', 'data-type', 'data-categery', 'width', 'height', 'alt', 'title', '.width', '.height']
        },
        afterChange: () => {
          // 只有群可以使用@功能
          if (this.props.currentSession.get('mFlag') === '1') {
            return false;
          }
          setTimeout(() => {
            const el = this.editor;
            // 获取选定对象
            const selection = el.edit.win.getSelection();
            if (selection.type === 'None') {
              return false;
            }
            // 设置最后光标对象
            const lastEditRange = selection.getRangeAt(0);
            const val = lastEditRange.startContainer.data || '';
            const currentPos = lastEditRange.startOffset;
            for (let i = currentPos; i >= 0; i--) {
              const subChar = $.trim(val.substring(i - 1, i));
              if (!subChar) {
                this.setState({
                  showAtList: false
                });
                break;
              }
              if (subChar === '@') {
                const query = val.substring(i, currentPos);
                const rltData = [];
                const userList = this.props.currentSession.get('userList');
                const { userInfo } = this.props;
                const atList = this.createAtList(userList, userInfo);
                atList.forEach((item) => {
                  const [username] = item.userInfo.get('username').split('@');
                  const [nickname] = item.userInfo.get('nickname').split('@');
                  if ((username && username.indexOf(query) > -1) ||
                      (nickname && nickname.indexOf(query) > -1)) {
                    rltData.push(item);
                  }
                });
                const state = {
                  userList: rltData,
                  showAtList: rltData.length > 0
                };
                if (rltData.length !== this.state.userList.length) {
                  state.active = 0;
                }
                this.setState(state, () => {
                  const offset = $(this.ifrBody).caret('offset', { iframe: this.ifr });
                  const { userList: ul } = this.state;
                  // 200 接近列表高度位置 40 输入框和列表框距离
                  const top = ul.length * 26 > 200 ? 200 : ul.length * 26;
                  const atListPos = {
                    top: offset.top - 40 - (top),
                    left: offset.left - 40
                  };
                  this.setState({
                    atListPos
                  });
                });
                break;
              }
            }
            return true;
          }, 0);
          return true;
        }
      });

      // 获取光标的坐标
      [this.ifr] = $('.ke-edit-iframe');
      this.ifrBody = this.ifr.contentDocument.body;
      this.ifrBody.contentEditable = true;
      // 屏蔽内置右键的菜单，不屏蔽浏览器右键
      // eslint-disable-next-line
      this.editor['_contextmenus'] = [];
      $(this.editor.edit.iframe[0].contentWindow.window)
        .on('keydown', (e) => {
          if (this.state.showAtList) {
            const { userList } = this.state;
            if (e.keyCode === 13) {
              this.onAtItemClick(userList[this.state.active]);
              return true;
            } else if (e.keyCode === 40) {
              this.setState({
                active: this.state.active + 1 < userList.length ? this.state.active + 1 : 0
              }, () => {
                this.calculateScroll();
              });
              return false;
            } else if (e.keyCode === 38) {
              this.setState({
                active: this.state.active - 1 < 0 ? userList.length - 1 : this.state.active - 1
              }, () => {
                this.calculateScroll();
              });
              return false;
            }
          }

          if (e.keyCode === 13 && e.ctrlKey) {
            this.editor.insertHtml('<br>\u200B');
            return false;
          } else if (e.keyCode === 13) {
            this.sendMessage();
            return false;
          }
          return true;
        })
        .on('blur', () => {
          setTimeout(() => {
            this.setState({ showAtList: false, active: 0 });
          }, 300);
        })
        .on('paste', this.onPaste);
      $(this.editor.edit.iframe[0].contentWindow.window)
        .on('drop', this.onDrop);

      this.props.setChatField({ editor: this.editor });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { currentSession } = this.props;
    if (currentSession.get('user') !== nextProps.currentSession.get('user')) {
      this.setState({
        [currentSession.get('user')]: this.editor.html()
      });
      this.editor.html(this.state[nextProps.currentSession.get('user')] || '');
    }
    const userList = nextProps.currentSession.get('userList');
    const { userInfo } = nextProps;
    const atList = this.createAtList(userList, userInfo);

    this.setState({
      userList: atList
    });
  }

  onDrop = (e) => {
    const {
      appendMessage,
      setLastSessionMessage,
      currentSession,
      messageScrollToBottom
    } = this.props;
    e = e.originalEvent;
    if (e.dataTransfer && e.dataTransfer.files) {
      const file = e.dataTransfer.files[0];
      if (file && file.type && JSON.stringify(file.type).search('image') === -1) {
        sdk.uploadImg({
          type: 'file',
          success: (msg) => {
            if (currentSession.get('mFlag') === '1') {
              appendMessage(msg);
              messageScrollToBottom();
            }
            setLastSessionMessage({
              user: currentSession.get('user'),
              simpmsg: msg.simpcontent
            });
          },
          filesList: [file]
        });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (r) => {
          const img = `<img src="${r.target.result}" data-type="base64" style="max-width: 300px; max-height: 300px;" />`;
          this.editor.insertHtml(img);
        };
      }
    }
  };

  onPaste = (e) => {
    // const {
    //   appendMessage,
    //   setLastSessionMessage,
    //   currentSession,
    //   messageScrollToBottom
    // } = this.props;
    e = e.originalEvent;
    if (e.clipboardData) {
      if (typeof (e.clipboardData.files[0]) !== 'undefined' && e.clipboardData.files[0].name.search('image') !== -1) { // 粘贴的是图片
        // const imageFile = item.getAsFile();
        const file = e.clipboardData.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (r) => {
          const img = `<img src="${r.target.result}" data-type="base64" style="max-width: 300px; max-height: 300px;" />`;
          this.editor.insertHtml(img);
        };
        // sdk.uploadImg({
        //   type: 'image',
        //   success: (msg) => {
        //     if (currentSession.get('mFlag') === '1') {
        //       appendMessage(msg);
        //       messageScrollToBottom();
        //     }
        //     setLastSessionMessage({
        //       user: currentSession.get('user'),
        //       simpmsg: msg.simpcontent
        //     });
        //   },
        //   filesList: [imageFile]
        // });
      } else if (JSON.stringify(e.clipboardData.types).search('Files') !== -1) {
        alert('该页不支持粘贴发送文件,请直接拖动发送~');
      }
    }
  };

  onAtItemClick(item) {
    const el = this.editor;
    const dType = el.cmd.range.startContainer.data ? 'data' : 'innerHTML';
    const sVal = el.cmd.range.startContainer[dType];
    const lAt = sVal.lastIndexOf('@');
    el.cmd.range.startContainer[dType] = sVal.substring(0, lAt);
    const nickname = item.userInfo.get('nickname');
    el.insertHtml(`<span contenteditable='false'>@${nickname}</span>&nbsp;<span id='input-textarea-caret-position-mirror-span'></span>`);
    const span = el.edit.doc
      .getElementById('input-textarea-caret-position-mirror-span');
    const range = el.edit.doc.createRange();
    range.selectNodeContents(span);
    range.collapse(false);
    const sel = el.edit.win.getSelection();
    sel.removeAllRanges();
    sel.addRange(range); // hack：修正下一次startOffset
    span.parentNode.removeChild(span);
    // 存被@的人
    this.state.atUsers[item.jid] = nickname;
    this.setState({
      showAtList: false,
      atUsers: this.state.atUsers
    });
  }
  /**
   * 合并 userList userList
   * @param userList: [{jid: weidongxu.xu@ej, affiliation: 'owner'}]
   *        userInfo: Map
   * @return [{ jid: weidongxu.xu, affiliation: 'owner', userInfo}]
   * */
  createAtList(userList, userInfo) {
    const atList = [];
    if (!userList || !userInfo) {
      return [];
    }
    userList.forEach((item) => {
      const jid = item.get('jid');
      const affiliation = item.get('affiliation');
      if (userInfo.get(jid)) {
        atList.push({
          jid,
          affiliation,
          userInfo: userInfo.get(jid)
        });
      } else {
        atList.push({
          jid,
          affiliation,
          userInfo: Map({
            nickname: jid.split('@')[0],
            username: jid,
            imageurl: footera3faf4373242d1
          })
        });
      }
    });
    return atList;
  }

  showFileMenu = (b) => {
    this.setState({ showFileMenu: b });
  };

  upload = (type) => {
    const {
      appendMessage,
      setLastSessionMessage,
      currentSession,
      messageScrollToBottom
    } = this.props;
    sdk.uploadImg({
      type,
      success: (msg) => {
        if (currentSession.get('mFlag') === '1') {
          appendMessage(msg);
          messageScrollToBottom();
        }
        setLastSessionMessage({
          user: currentSession.get('user'),
          simpmsg: msg.simpcontent
        });
      }
    });
  }

  async sendMessage() {
    const {
      currentSession,
      appendMessage,
      setLastSessionMessage,
      messageScrollToBottom
    } = this.props;
    const html = this.K.trim(this.editor.html());
    if (!this.editor.isEmpty()) {
      const { atUsers } = this.state;
      const data = [];
      const backupinfo = { type: 10001 };
      Object.keys(atUsers).forEach((item) => {
        if (html.indexOf(`@${atUsers[item]}&nbsp;`) > -1) {
          data.push({ jid: item, text: atUsers[item] });
        }
      });
      let msg = '';
      if (data.length > 0) {
        backupinfo.data = data;
        msg = await sdk.sendMessage(html, 12, JSON.stringify([backupinfo]));
      } else {
        msg = await sdk.sendMessage(html);
      }
      // 单聊时候追加， 群聊有服务器推送过来
      if (currentSession.get('mFlag') === '1') {
        appendMessage(msg);
        setLastSessionMessage({
          user: currentSession.get('user'),
          simpmsg: msg.simpcontent
        });
        messageScrollToBottom();
      }
      this.setState({
        [currentSession.get('user')]: ''
      });
      this.editor.html('');
    }
  }

  calculateScroll() {
    const $al = $('.at-list');
    const wrapH = $al.height();
    const st = $al.scrollTop();
    const $li = $al.find('li').eq(this.state.active);
    const liH = $li.height();
    if ($al.find('li').eq(this.state.active)[0].offsetTop + liH > wrapH + st) {
      // 5 margin-top
      $al.scrollTop(((this.state.active + 1) * (liH + 5)) - wrapH);
    } else if ($al.find('li').eq(this.state.active)[0].offsetTop + liH <= st) {
      // 5 margin-top
      $al.scrollTop(this.state.active * (liH + 5));
    }
  }

  selected(emotions, face) {
    const style = `style="width:${emotions.width};height:${emotions.height}"`;
    const img = `<img src="${face.url}" data-emoticon="${face.shortcut}" data-categery="${emotions.categery}" ${style} />`;
    this.editor.insertHtml(img);
  }

  imgError(e) {
    e.target.src = webConfig.fileurl+'/file/v2/download/8c9d42532be9316e2202ffef8fcfeba5.png';//darlyn
  }

  render() {
    // const { userInfo } = this.props;
    // const cacheContent = this.state[currentSession.user] || '';
    // if (this.editor) {
    //   this.editor.html(cacheContent);
    // }
    const { userList } = this.state;
    const ulen = userList.length;
    return (
      <div className="chat-footer">
        <div className="toolbar">
          <Emotions
            selected={(emotions, face) => { this.selected(emotions, face); }}
          />
          <span
            className="bar"
            onMouseLeave={() => { this.showFileMenu(false); }}
            onMouseEnter={() => { this.showFileMenu(true); }}
          >
            <i className="iconfont folder" />
            <div className={cls('menu file', { 'animation animating bounceIn': this.state.showFileMenu })}>
              <a onClick={() => { this.upload('image'); }}>发送图片</a>
              <a onClick={() => { this.upload('file'); }}>发送文件</a>
            </div>
          </span>
        </div>
        <div className="content">
          <div
            id="editor"
            className="edit-area"
          />
          {
            this.state.showAtList &&
              <ul className={cls('at-list', { 'animation animating bounceIn': this.state.showAtList })} style={{ left: this.state.atListPos.left, top: this.state.atListPos.top }}>
                {
                  userList.map((item, idx) => (
                    <li
                      key={`at-list-${item.userInfo.get('username')}`}
                      onClick={() => this.onAtItemClick(item)}
                      className={cls({ active: this.state.active === idx })}
                    >
                      <div className="icon-wrap">
                        <i
                          className={cls('icon', { admin: item.affiliation === 'admin', owner: item.affiliation === 'owner' })}
                        />
                      </div>
                      <div className="img-wrap">
                        {
                          ulen > 20 ?
                            <LazyLoad height={26} overflow>
                              <img src={item.userInfo.get('imageurl')} alt='' onError={this.imgError} />
                            </LazyLoad> :
                            <img src={item.userInfo.get('imageurl')} alt='' onError={this.imgError} />
                        }
                      </div>
                      <div className="name">{item.userInfo.get('nickname')}</div>
                    </li>
                  ))
                }
              </ul>
          }
        </div>
      </div>
    );
  }
}
