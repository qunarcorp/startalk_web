/**
 * 模版文件初始化数据模拟文件
 * 该模块返回的数据在所有的模版中都能获取到
 * @module mock/pages/__global
 * @param {object} req - HTTP request object
 * @param {object} res - HTTP response object
 * @return {object} Mock json data
 */

 export default function(req, res) {
   return {
     isLogin: true,
     deep: {
       a: {
         b: 'deep value'
       }
     }
   };
  //  return new Promise(function(resolve, reject) {
  //    resolve({
  //      isLogin: false
  //    });
  //  });
};
