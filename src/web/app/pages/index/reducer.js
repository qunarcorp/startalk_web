/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-06 11:24:02
 * @LastEditTime: 2019-08-12 22:13:41
 * @LastEditors: Please set LastEditors
 */
import { combineReducers } from 'redux-immutable';
import { Map, List } from 'immutable';
import nsReducers from '../../common/utils/namespace-reducers';
import { atTips } from './consts';

const handleActions = nsReducers('INDEX');

const chat = handleActions({
  SET_CHAT_FIELD: (state, action) => {
    Object.keys(action.payload).forEach((key) => {
      state = state.set(key, action.payload[key]);
    });
    return state;
  },
  CHANGE_CHAT_FIELD: (state, action) => state.merge(action.payload),
  SET_SESSION_LIST: (state, action) =>
    state.set('session', List(action.payload).sortBy(a => !a.isTop)),
  SET_SESSION_TOP: (state, action) => {
    const { isTop, user } = action.payload;
    const session = state.get('session');
    const index = session.findIndex(item => item.user === user);
    if (index > -1) {
      return state.set(
        'session',
        session.set(
          index,
          Object.assign({}, session.get(index), {
            isTop
          })
        ).sortBy(a => !a.isTop)
      );
    }
    return state;
  },
  SET_LAST_SESSION_MESSAGE: (state, action) => {
    const { simpmsg, user } = action.payload;
    const session = state.get('session');
    const index = session.findIndex(item => item.user === user);
    if (index > -1) {
      return state.set('session', session.set(index, Object.assign({}, session.get(index), {
        sdk_msg: simpmsg
      })));
    }
    return state;
  },
  MOVE_SESSION: (state, action) => {
    const {
      simpmsg, user, mFlag, isMe, currentSessionUser, backupinfo, bareJid
    } = action.payload;
    const session = state.get('session');
    const index = session.findIndex(item => item.user === user);
    let newSession = {
      cnt: isMe ? 0 : 1, // 自己的消息不会累加到未读数里面
      sdk_msg: simpmsg,
      mFlag,
      user
    };
    if (index > -1) {
      let { atContent, cnt } = session.get(index);
      if (/@([a,A][l,L][l,L])\s/.test(simpmsg)) {
        atContent = `${atTips.all} ${simpmsg}`;
      }
      if (backupinfo) {
        const backupinfoObj = JSON.parse(backupinfo || '[]')[0];
        if (backupinfoObj && backupinfoObj.data) {
          backupinfoObj.data.forEach((item) => {
            if (item.jid === bareJid) {
              atContent = atTips.single;
            }
          });
        }
      }
      cnt = parseInt(cnt, 10);
      if (!isMe) {
        cnt += 1;
      }
      // 正在会话设置 0
      if (currentSessionUser === session.get(index).user) {
        cnt = 0;
        atContent = '';
      }
      newSession = Object.assign({}, session.get(index), {
        sdk_msg: simpmsg,
        atContent,
        cnt
      });
    }
    return state.set(
      'session',
      session.filter(item => item.user !== user)
        .unshift(newSession).sortBy(a => !a.isTop)
    );
  },
  CLEAR_SESSION_CNT: (state) => {
    // 当前会话ID
    const currentUser = state.getIn(['currentSession', 'user']);
    // 会话列表
    const session = state.get('session');
    const index = session.findIndex(item => item.user === currentUser);
    if (index > -1) {
      return state.set('session', session.set(index, Object.assign({}, session.get(index), {
        cnt: 0,
        atContent: ''
      })));
    }
    return state;
  },
  SET_CURRENT_SESSION_USERS: (state, action) =>
    state.set(
      'currentSession',
      state.get('currentSession').set('userList', List(action.payload.map(item => Map(item))))
    ),
  REMOVE_CURRENT_SESSION_USER: (state, action) => {
    let userList = state.getIn(['currentSession', 'userList']);
    userList = userList.filter(item => item.get('jid') !== action.payload);
    return state.setIn(
      ['currentSession', 'userList'],
      userList
    );
  },
  // MERGE_CURRENT_SESSION_USER: (state, action) => {
  //   const userList = state.getIn(['currentSession', 'userList']);
  //   const index = userList.findIndex(item => item.get('jid') === action.payload.jid);
  //   // 存在
  //   if (index > -1) {
  //     userList.set(index, Map(action.payload));
  //   } else {
  //     userList.push(Map(action.payload));
  //   }
  //   return state.setIn(
  //     ['currentSession', 'userList'],
  //     userList
  //   );
  // },
  SET_CURRENT_SESSION: (state, action) => {
    const { user, mFlag } = action.payload;
    const session = state.get('session');
    const index = session.findIndex(item => item.user === user);
    let newSession = {
      cnt: 0,
      sdk_msg: '',
      mFlag,
      user
    };
    // 存在，直接移动到顶部
    if (index > -1) {
      newSession = Object.assign({}, session.get(index), {
        cnt: 0
      });
    }
    return state.set(
      'session',
      session.filter(item => item.user !== user)
        .unshift(newSession)
        .sortBy(a => !a.isTop)
    ).set('currentSession', Map(newSession));
  },
  REMOVE_SESSION: (state, action) => {
    // 如果为当前会话，则清除当前会话
    const currentSession = state.get('currentSession');
    if (currentSession.get('user') === action.payload) {
      state = state.set('currentSession', Map({}));
    }
    // 移除会话列表
    return state.set('session', state.get('session').filter(item => item.user !== action.payload));
  }
}, Map({
  // 登录状态 loading, success, authfail, fail, disconnected
  connectStatus: '',
  switchIndex: 'chat', // chat friends
  isChat: true,
  isCard: true,
  // 会话列表
  session: List([]),
  // 当前会话信息
  currentSession: Map({}),
  // 组织结构
  companyStruct: [],
  companyUsers: {},
  // 用于组织架构搜索
  companyUsersName: {},
  // 朋友列表当前选择的
  currentFriend: Map({})
}));

const userInfo = handleActions({
  SET_USER_INFO: (state, action) => state.merge(action.payload)
}, Map({}));

const defaultMessage = Map({
  haveOther: false,
  msgs: List([])
});

const message = handleActions({
  CLEAR_MESSAGE: () => defaultMessage,
  SET_MESSAGE: (state, action) => {
    const { haveOther, msgs } = action.payload;
    return state.merge({
      haveOther,
      msgs: List(msgs).concat(state.get('msgs'))
    });
  },
  APPEND_MESSAGE: (state, action) => {
    const msgs = state.get('msgs').push(action.payload);
    return state.set('msgs', msgs);
  },
  SET_MESSAGE_READ: (state, action) => {
    let msgs = state.get('msgs');
    msgs = msgs.map((item) => {
      if (action.payload.indexOf(item.id) > -1) {
        return Object.assign({}, item, { isRead: true });
      }
      return item;
    });
    return state.set('msgs', msgs);
  },
  REVOKE_MESSAGE: (state, action) => {
    let msgs = state.get('msgs');
    msgs = msgs.map((item) => {
      if (item.id === action.payload.id) {
        return Object.assign({}, item, {
          content: '[撤销一条消息]',
          extendInfo: JSON.stringify({
            messageId: action.payload.id,
            fromId: item.sendjid
          }),
          simpcontent: '[撤销一条消息]',
          msgType: '-1',
          type: 'revoke',
          isMe: 'false',
          time: action.payload.time
        });
      }
      return item;
    });
    return state.set('msgs', msgs);
  }
}, defaultMessage);

const contentmenu = handleActions({
  SET_CONTENT_MENU: (state, action) => {
    Object.keys(action.payload).forEach((key) => {
      state = state.set(key, action.payload[key]);
    });
    return state;
  }
}, Map({
  show: false, // 显示
  data: {}, // 右键的会话数据
  pos: {} // 位置信息
}));

const modalUserCard = handleActions({
  SET_MODAL_USER_CARD: (state, action) => {
    Object.keys(action.payload).forEach((key) => {
      state = state.set(key, action.payload[key]);
    });
    return state;
  }
}, Map({
  show: false,
  pos: { left: 0, top: 0 },
  user: null
}));

const modalGroupCard = handleActions({
  SET_MODAL_GROUP_CARD: (state, action) => {
    Object.keys(action.payload).forEach((key) => {
      state = state.set(key, action.payload[key]);
    });
    return state;
  }
}, Map({
  show: false,
  pos: { left: 0, top: 0 },
  groupId: null
}));

const friends = handleActions({
  SET_FRIENDS_MUCS: (state, action) => state.set('mucs', List(action.payload)),
  SET_FRIENDS_USERS: (state, action) => state.set('friends', List(action.payload))
}, Map({
  mucs: List([]),
  friends: List([])
}));

const members = handleActions({
  SET_MEMBERS_INFO: (state, action) => {
    Object.keys(action.payload).forEach((key) => {
      state = state.set(key, action.payload[key]);
    });
    return state;
  }
}, Map({
  show: false,
  isNew: false
}));

const nav = handleActions({
  SET_STARTALK_NAV: (state, action) => state.merge(action.payload)
}, Map({}));

const publicKey = handleActions({
  SET_PUBLIC_KEY: (state, action) => state.merge(action.payload)
}, Map({}));

export default combineReducers({
  chat,
  userInfo,
  message,
  contentmenu,
  modalUserCard,
  modalGroupCard,
  friends,
  members,
  nav,
  publicKey
});
