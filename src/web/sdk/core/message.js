import EventEmitter from 'events';
import $ from 'jquery';
import { Strophe, $pres, $msg } from './strophe';
import buildMessage from './buildMessage';
import { audioPlayer } from '../common/utils/utils';

/**
 * 消息类处理
 */
class Message extends EventEmitter {
  // 缓存handler, 断开后在连接要重新注册
  cacheHandler = [];

  // 这个 key 很重要，后面发消息都要用到
  key = '';

  // 当前会话ID，entry 获取历史消息会被赋值
  currentSessionId = '';

  constructor(stropheConnection) {
    super();
    this.stropheConnection = stropheConnection;
    // 消息类处理
    this.cacheHandler.push([
      (message) => {
        this.formatMessage(message);
        return true;
      }, null, 'message'
    ]);
    // this.cacheHandler.push([
    //   (message) => {
    //     return true;
    //   }, null, 'iq', 'result'
    // ]);
    this.cacheHandler.push([
      (message) => {
        this.analysisPresece(message);
        this.emit('presence', message);
        return true;
      }, null, 'presence'
    ]);
  }

  /**
   * 发送已读
   *
   */
  messageAlreadyRead(isChat, { from, to }, msgs, isSend3) {
    // 单聊
    if (isChat) {
      // 个人消息要 发送 read_type：3 ，代表已接收, 4：已读取
      msgs = msgs.map(id => ({ id }));
      msgs = JSON.stringify(msgs);
      // 发 read_type：3
      // this.send();
      // 发 read_type：4
      if (isSend3) {
        this.send($msg({
          type: 'readmark',
          read_type: '3',
          from,
          to
        }).c('body', {
          msgType: 1,
          maType: 3
        }).t(msgs));
      }
      if (this.currentSessionId === to) {
        this.send($msg({
          type: 'readmark',
          read_type: '4',
          from,
          to
        }).c('body', {
          msgType: 1,
          maType: 3
        }).t(msgs));
      }
    } else if (this.currentSessionId === to) {
      this.send($msg({
        type: 'readmark',
        read_type: '2',
        from,
        to: from
      }).c('body', {
        msgType: 1,
        maType: 3
      }).t(JSON.stringify([{
        domain: Strophe.getDomainFromJid(to),
        id: Strophe.getNodeFromJid(to),
        t: new Date().getTime()
      }])));
    }
  }

  formatMessage(message) {
    const $message = $(message);
    const $body = $message.find('body');
    const { jid } = this.stropheConnection;
    const myId = Strophe.getBareJidFromJid(jid);
    const type = $message.attr('type');
    const carbonMessage = $message.attr('carbon_message');
    // 非[]里面类型消息不接收
    if (['readmark', 'chat', 'groupchat'].indexOf(type) === -1) {
      return;
    }
    if (['chat', 'groupchat'].indexOf(type) > -1) {
      audioPlayer();
    }
    const from = Strophe.getBareJidFromJid($message.attr('from'));
    let muc = '';
    if (type === 'groupchat') {
      muc = from;
    }
    const time = $message.attr('msec_times') || new Date().getTime();
    const ret = {
      carbonMessage, // 抄送消息，from to 是反得，实际上是自己发的
      message: {
        type: $message.attr('type'),
        sendjid: Strophe.getBareJidFromJid($message.attr('sendjid') || '')
      },
      body: {
        id: $body.attr('id'),
        msgType: $body.attr('msgType'),
        content: $body.text(),
        backupinfo: $body.attr('backupinfo'),
        extendInfo: $body.attr('extendInfo')
      },
      from,
      t: parseInt(time, 10) / 1000,
      muc,
      read_flag: $message.attr('read_flag') || 0,
      readType: $message.attr('read_type')
    };
    const bmsg = buildMessage(ret, myId);
    // 设置消息已读
    if (type !== 'readmark' && !bmsg.isMe) {
      this.messageAlreadyRead(
        type === 'chat',
        {
          // 要发送已读消息  from -> to
          from: Strophe.getBareJidFromJid($message.attr('to') || ''),
          to: Strophe.getBareJidFromJid($message.attr('from') || '')
        }, [bmsg.id], true
      );
    }
    this.emit('message', bmsg);
  }

  registerHandler(...args) {
    if (args.length > 0) {
      this.stropheConnection.addHandler(args);
    } else {
      this.cacheHandler.forEach((arr) => {
        this.stropheConnection.addHandler(...arr);
      });
    }
  }

  clearKey() {
    this.key = '';
  }

  // 解析 presence 类型消息
  analysisPresece(presence) {
    if (!presence) {
      return;
    }
    const $presence = $(presence);
    const xmlns = $presence.attr('xmlns');
    const type = $presence.attr('type');
    let from;
    let $vcard;
    let $x;
    // 销毁群
    if (type === 'unavailable' && $presence.find('x destroy').length > 0) {
      this.emit('group_distory', Strophe.getBareJidFromJid($presence.attr('from')));
    }
    switch (xmlns) {
      case 'jabber:client':
        $x = $presence.find('x');
        $vcard = $x.find('item');
        // 更改用户角色
        if ($x.attr('xmlns') === 'http://jabber.org/protocol/muc#user') {
          this.emit('group_change_role', {
            from: Strophe.getBareJidFromJid($vcard.attr('jid')),
            role: $vcard.attr('affiliation')
          });
        }
        break;
      // 群成员退出
      case 'http://jabber.org/protocol/muc#del_register':
        from = Strophe.getBareJidFromJid($presence.attr('from'));
        this.emit('group_user_exit', {
          from,
          user: Strophe.getBareJidFromJid($presence.attr('del_jid'))
        });
        break;
      // 邀请进群
      case 'http://jabber.org/protocol/muc#invite':
        from = Strophe.getBareJidFromJid($presence.attr('from'));
        this.emit('group_invite', {
          from,
          user: Strophe.getBareJidFromJid($presence.attr('invite_jid'))
        });
        break;
      // 群名片更新
      case 'http://jabber.org/protocol/muc#vcard_update':
        from = Strophe.getBareJidFromJid($presence.attr('from'));
        $vcard = $presence.find('vcard_updte');
        this.emit('group_vcard_update', {
          from,
          nick: $vcard.attr('nick'),
          desc: $vcard.attr('desc'),
          title: $vcard.attr('title'),
          pic: $vcard.attr('pic')
        });
        break;

      // 收到这个key之后才能收发消息
      // 先获取token
      // 建立和qchat服务器的连接
      // 服务器给出key，chat ready
      // 后续收发消息都依赖这个key
      case 'config:xmpp:time_key':
        this.key = $presence.attr('key_value');
        this.emit('ready', this.key);
        break;
      default:
        break;
    }
  }

  /**
   * 连接成功后要 发送一个 Presence协议，告诉服务器我可以正常收发消息了
   */
  sendPresence() {
    const per = $pres()
      .c('priority', {}, 5)
      .c('c', {
        xmlns: 'http://jabber.org/protocol/caps',
        node: 'http://psi-im.org/caps',
        ver: 'caps-b75d8d2b25',
        ext: 'ca cs ep-notify-2 html'
      });
    this.send(per);
  }

  /**
   * 发送消息， xmpp 格式
   */
  send(xmppMessage) {
    this.stropheConnection.send(xmppMessage);
  }

  /**
   * 添加接收消息， 默认已有 message， presence 这两种类型
   *
   * addHandler (handler, ns, name, type, id, from, options)
   * the handler should return true if wish to invoke it again
   * if false, then the handle will be removed after the first invoked
   */
  addHandler(...args) {
    this.cacheHandler.push([...args]);
    this.registerHandler(...args);
  }

  /**
   * 添加接收消息处理，返回处理ID，可以调用remove删除
   */
  addTemplateHandler(...args) {
    return this.stropheConnection.addHandler(...args);
  }

  deleteTemplateHandler(handRef) {
    this.stropheConnection.deleteHandler(handRef);
  }
}

export default Message;
