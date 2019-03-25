import { handleActions } from 'redux-actions';

function appendNs(namespace, reducerMap, initialState) {
  const reducerMapWithNs = Object.keys(reducerMap).reduce((result, key) => {
    const reducer = reducerMap[key];
    result[`${namespace}/${key}`] = reducer;
    return result;
  }, {});
  return handleActions(reducerMapWithNs, initialState);
}

export default namespace => (...args) => (appendNs(namespace, ...args));
