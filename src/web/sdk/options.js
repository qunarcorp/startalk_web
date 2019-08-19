/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 21:14:24
 * @LastEditTime: 2019-08-13 11:47:33
 * @LastEditors: Please set LastEditors
 */
export default {
  debug: false,
  xmpp:"",
  // 链接配置
  connect: {
    reconnectCount: 10, // 最多重连10次
    delay: 5000, // 重新连接间隔
    host: '', // 主机名
    // port: 80, // 端口
    path: '' // 路径
  },
  maType: 6, // 平台类型web端：6
  // 20 秒ping一次
  pingInterval: 20
};
