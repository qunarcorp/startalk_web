/***
 * 根据导航连接返回的json数据，找到相应的值
 * 其中 pub_key_fullkey的值需要生成，详见node项目readme.md
 * */
module.exports = {
    "host":"",//主机名 websock  baseaddess.host
    "debug":true,//调试
    "maType":6,//平台类型web端：6
    "fileurl":"",//静态文件 baseaddess.fileurl
    "javaurl":"",//后台接口 baseaddess.javaurl
    "httpurl":"",//后台接口 baseaddess.httpurl
    "apiurl":"",//后台接口 baseaddess.apiurl
    "searchurl":"",//搜索接口 ability.searchurl
    "emails":""//email后缀
}