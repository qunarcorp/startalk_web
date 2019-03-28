/**
 * qtlk sdk
 */
import webConfig from '../../../../web_config';
// 初始化sdk
const sdk = new window.QtalkSDK({
  // 调试
  debug: true,
  xmpp:webConfig.xmpp,
  // 链接配置
  connect: {
    host: webConfig.websocket // 主机名
  },
  maType: 6 // 平台类型web端：6
});

export default sdk;
