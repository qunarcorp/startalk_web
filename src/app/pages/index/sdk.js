/**
 * qtlk sdk
 */
import webConfig from '../../../../web_config';
// 初始化sdk
const sdk = new window.QtalkSDK({
  // 调试
  debug: webConfig.debug,
  // 链接配置
  connect: {
    host: webConfig.host // 主机名
  },
  maType: webConfig.maType // 平台类型web端：6
});

export default sdk;
