import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import { createStore, applyMiddleware } from 'redux';
import { createStore } from 'redux';
// import createSagaMiddleware from 'redux-saga';
import reducer from './reducer';
// import saga from './saga';
import Page from './';
import './import-less';

const root = document.getElementById('app');
// const sagaMiddleware = createSagaMiddleware();
// const store = createStore(reducer, applyMiddleware(sagaMiddleware));
const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
// sagaMiddleware.run(saga);

const render = (Entry) => {
  ReactDOM.render(
    <Provider store={store}>
      <Entry />
    </Provider>,
    root
  );
};

render(Page);

if (module.hot) {
  module.hot.accept(['.'], () => {
    eslint-disable-next-line
    render(require('.'));
  });
}
