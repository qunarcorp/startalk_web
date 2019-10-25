import React, { Component } from 'react';
import { connect } from 'react-redux';
import Clipboard from 'clipboard';
import MessageBox from '../../../../common/components/message-box';
import actions from '../../actions';
import sdk from '../../sdk';

const { $ } = window.QtalkSDK;

@connect(
  state => ({
    contentmenu: state.get('contentmenu'),
    currentSession: state.getIn(['chat', 'currentSession']),
    editor: state.getIn(['chat', 'editor']),
    message: state.get('message').toJS(),
    userInfo: state.get('userInfo')
  }),
  actions
)
export default class ContentMenu extends Component {
  componentDidMount() {
    const { setContentMenu } = this.props;
    $(window).on('click', (e) => {
      const $target = $(e.target);
      if ($target.closest('.content-menu').length === 0
        && this.props.contentmenu.get('show')
      ) {
        setContentMenu({
          show: false
        });
      }
    });
    this.clipboard = new Clipboard('.copy');
    this.clipboard.on('success', (e) => {
      e.clearSelection();
    });
  }

  async onTop(isTop) {
    const { contentmenu, setSessionTop, setContentMenu } = this.props;
    const { user } = contentmenu.get('data');
    const res = await sdk.setTopInfo({ [user]: isTop });
    if (res.ret) {
      setSessionTop({ user, isTop });
      setContentMenu({
        show: false
      });
    }
  }

  onGroupExit(user) {
    const { setContentMenu } = this.props;
    MessageBox.confirm(
      '即将从该群退出，如果继续且需要恢复此操作，<br />你需要让当前群成员重新邀请。是否继续?',
      '警告'
    ).ok(() => {
      sdk.groupExit(user);
    });
    setContentMenu({
      show: false
    });
  }

  onViewGroupInfo(groupId) {
    const { setContentMenu, setModalGroupCard, contentmenu } = this.props;
    const pos = contentmenu.get('pos');
    // if (parseInt(pos.top, 10) + 500 > $(window).height()) {
    //   delete pos.top;
    //   pos.bottom = 20;
    // }
    setModalGroupCard({
      show: true,
      pos,
      groupId
    });
    setContentMenu({
      show: false
    });
  }

  onViewUserInfo(user) {
    const { setModalUserCard, contentmenu, setContentMenu } = this.props;
    const pos = contentmenu.get('pos');
    // if (parseInt(pos.top, 10) + 500 > $(window).height()) {
    //   delete pos.top;
    //   pos.bottom = 20;
    // }
    setModalUserCard({
      show: true,
      pos,
      user
    });
    setContentMenu({
      show: false
    });
  }

  onGroupRemoveUser(user, groupId) {
    const { setContentMenu } = this.props;
    sdk.groupRemoveUser(user, groupId);
    setContentMenu({
      show: false
    });
  }

  onGroupSetAdmin(user, groupId, b) {
    const { setContentMenu } = this.props;
    sdk.groupSetAdmin(user, groupId, b);
    setContentMenu({
      show: false
    });
  }

  onCopy() {
    const { setContentMenu } = this.props;
    setContentMenu({
      show: false
    });
  }

  onQuote(msg) {
    const { setContentMenu, editor } = this.props;
    const html = editor.html();
    editor.html('');
    const sendName = this.props.userInfo.get(msg.sendjid).get('nickname');
    const content = msg.content.replace(/\n/g, '<br>');
    const newHtml = `⌈${sendName}: ${content}⌋<br>— — — — — — — — —<br>${html}<span id='input-textarea-caret-position-mirror-span'>.</span>\u200B`;
    editor.insertHtml(newHtml);
    const span = editor.edit.doc
      .getElementById('input-textarea-caret-position-mirror-span');
    const range = editor.edit.doc.createRange();
    range.selectNodeContents(span);
    range.collapse(false);
    const sel = editor.edit.win.getSelection();
    sel.removeAllRanges();
    sel.addRange(range); // hack：修正下一次startOffset
    span.parentNode.removeChild(span);
    setContentMenu({
      show: false
    });
  }

  revokeMsg(msg) {
    const { setContentMenu, currentSession, revokeMessage } = this.props;
    const time = +new Date();
    const revoke = time - msg.time <= 120000;
    if (revoke) {
      sdk.revokeMsg(msg.id, currentSession.get('user'));
      revokeMessage({ time, id: msg.id });
    }
    setContentMenu({
      show: false
    });
  }

  renderTypeSession() {
    const { contentmenu } = this.props;
    const { isTop, mFlag, user } = contentmenu.get('data');
    return (
      <div
        className="content-menu"
        style={contentmenu.get('pos')}
      >
        {
          isTop
            ? <a onClick={() => { this.onTop(false); }}>取消置顶</a>
            : <a onClick={() => { this.onTop(true); }}>置顶</a>
        }
        {
          mFlag === '2'
            ? <a className="group-card" onClick={() => { this.onViewGroupInfo(user); }}>查看群资料</a>
            : <a className="user-card" onClick={() => { this.onViewUserInfo(user); }}>查看名片</a>
        }
        {
          mFlag === '2'
            ? <a onClick={() => { this.onGroupExit(user); }}>退出该群</a>
            : null
        }
      </div>
    );
  }

  renderTypeMember() {
    const { contentmenu } = this.props;
    const {
      user,
      owner,
      admin,
      userRole,
      groupId
    } = contentmenu.get('data');
    if (admin && userRole !== 'owner') {
      return (
        <div
          className="content-menu"
          style={contentmenu.get('pos')}
        >
          {
            user === sdk.bareJid
              ? <a onClick={() => { this.onGroupExit(user); }}><span className="red">退出</span>该群</a>
              : <a onClick={() => { this.onGroupRemoveUser(user, groupId); }}>移出群组</a>
          }
        </div>
      );
    } else if (owner) {
      return (
        <div
          className="content-menu"
          style={contentmenu.get('pos')}
        >
          {
            user === sdk.bareJid
              ? (
                <div>
                  <a onClick={() => { this.onGroupExit(user); }}><span className="red">退出</span>该群</a>
                </div>
              )
              : (
                <div>
                  <a onClick={() => { this.onGroupRemoveUser(user, groupId); }}>移出群组</a>
                  {
                    userRole === 'admin'
                      ? <a onClick={() => { this.onGroupSetAdmin(user, groupId, false); }}>解除管理员</a>
                      : <a onClick={() => { this.onGroupSetAdmin(user, groupId, true); }}>设为管理员</a>
                  }
                </div>
              )
          }
        </div>
      );
    }
    return null;
  }

  renderTypeFriends() {
    const { contentmenu } = this.props;
    const { mFlag, user } = contentmenu.get('data');
    return (
      <div
        className="content-menu"
        style={contentmenu.get('pos')}
      >
        {
          mFlag === '2'
            ? <a className="group-card" onClick={() => { this.onViewGroupInfo(user); }}>查看群资料</a>
            : <a className="user-card" onClick={() => { this.onViewUserInfo(user); }}>查看名片</a>
        }
        {
          mFlag === '2'
            ? <a onClick={() => { this.onGroupExit(user); }}>退出该群</a>
            : null
        }
      </div>
    );
  }

  renderTypeMessage() {
    const { contentmenu } = this.props;
    const { msg } = contentmenu.get('data');
    const content = msg.content.replace(/<a.*?>(.*?)<\/a>/g, '$1');
    const time = +new Date();
    const revoke = (time - msg.time <= 120000) && (msg.sendjid === sdk.bareJid);
    return (
      <div
        className="content-menu"
        style={contentmenu.get('pos')}
      >
        {
          revoke && <a onClick={() => { this.revokeMsg(msg); }}>撤销</a>
        }
        <a onClick={() => { this.onQuote(msg); }}>引用</a>
        {
          msg.simpcontent && (msg.simpcontent.indexOf('[图片]') > -1 ||
            msg.simpcontent.indexOf('[文件]') > -1 ||
              msg.simpcontent.indexOf('[表情]') > -1 ||
                msg.simpcontent.indexOf('[分享]') > -1) ?
            null :
            <a className="copy" data-clipboard-text={content} onClick={() => { this.onCopy(); }}>复制</a>
        }
      </div>
    );
  }

  render() {
    const { contentmenu } = this.props;
    const type = contentmenu.get('type');
    if (!contentmenu.get('show')) {
      return null;
    }
    if (type === 'session') {
      return this.renderTypeSession();
    } else if (type === 'member') {
      return this.renderTypeMember();
    } else if (type === 'friends') {
      return this.renderTypeFriends();
    } else if (type === 'message') {
      return this.renderTypeMessage();
    }

    return null;
  }
}
