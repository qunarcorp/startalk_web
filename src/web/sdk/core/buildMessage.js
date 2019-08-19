import { Strophe } from './strophe';
import messageHelper from '../common/utils/messageHelper';

/**
 * 生成公共消息内容
 */
export default (data, myId) => {
  let isMe = false;
  const { message, body, from, t, muc, carbonMessage, readType } = data; // read_flag
  const { type, sendjid } = message;
  const { id, msgType, content, backupinfo, extendInfo } = body;
  const fromName = Strophe.getBareJidFromJid(sendjid || '');
  let sj = '';
  let ids = [];
  if (type === 'chat') {
    // carbonMessage --> 抄送消息，from to 是反得，实际上是自己发的
    if (from === myId || carbonMessage) {
      isMe = true;
    }
    sj = from;
  } else if (type === 'groupchat') {
    if (fromName === myId) {
      isMe = true;
    }
    sj = fromName;
  } else if (type === 'readmark') {
    try {
      ids = JSON.parse(content);
    } catch (e) {
      ids = [];
    }
    ids = ids.map(item => item.id);
  } else if (type === 'revoke') {
    if (muc) {
      sj = message.from;
    } else {
      sj = from;
    }
  }
  return {
    // 公共
    id, // 消息ID，
    msgType, // 消息类型
    content: messageHelper.decode(content, msgType), // 消息内容
    simpcontent: messageHelper.filter(content, msgType),
    time: t * 1000, // 消息时间
    isMe, // 是否自己
    type, // 消息类型  groupchat 群消息， chat 单人消息
    sendjid: sj, // 发送者的jid
    backupinfo,
    extendInfo,
    carbonMessage, // 是否抄送

    // 单聊属性
    isRead: Math.floor(data.read_flag / 2) % 2 === 1,

    // 群属性
    muc, // 群ID

    // readmark
    readType,
    ids

    // revoke
  };
};
