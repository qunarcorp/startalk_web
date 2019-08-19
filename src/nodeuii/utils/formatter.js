/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-12 19:55:02
 * @LastEditors: Please set LastEditors
 */
export const getNowDate = () => {
  const time = new Date()
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const day = time.getDate()

  return `${year}-${month}-${day}`
}

export const insertStr = (soure,start, newStr) => {
  return soure.slice(0, start) + newStr + soure.slice(start)
}
