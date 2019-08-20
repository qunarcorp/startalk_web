"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-12 19:55:02
 * @LastEditors: Please set LastEditors
 */
const getNowDate = exports.getNowDate = () => {
  const time = new Date();
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const day = time.getDate();
  return `${year}-${month}-${day}`;
};

const insertStr = exports.insertStr = (soure, start, newStr) => {
  return soure.slice(0, start) + newStr + soure.slice(start);
};