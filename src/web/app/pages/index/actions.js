import nsActions from '../../common/utils/namespace-actions';

const createActions = nsActions('INDEX');

export default createActions(
  'CHANGE_CHAT_FIELD',
  'SET_CHAT_FIELD',
  'SET_USER_INFO',
  // 会话
  'SET_SESSION_LIST',
  'SET_SESSION_TOP',
  'MOVE_SESSION',
  'CLEAR_SESSION_CNT',
  'SET_LAST_SESSION_MESSAGE',
  'SET_CURRENT_SESSION_USERS',
  'REMOVE_CURRENT_SESSION_USER',
  // 'MERGE_CURRENT_SESSION_USER',
  'SET_CURRENT_SESSION',
  'REMOVE_SESSION',
  // 右键菜单
  'SET_CONTENT_MENU',
  // 消息
  'SET_MESSAGE',
  'APPEND_MESSAGE',
  'CLEAR_MESSAGE',
  'SET_MESSAGE_READ',
  'REVOKE_MESSAGE',
  // 卡片弹层信息
  'SET_MODAL_USER_CARD',
  'SET_MODAL_GROUP_CARD',
  // 通讯录
  'SET_FRIENDS_MUCS',
  'SET_FRIENDS_USERS',
  // 发起会话
  'SET_MEMBERS_INFO',
  // 导航
  'SET_STARTALK_NAV',
  'SET_PUBLIC_KEY'
);
