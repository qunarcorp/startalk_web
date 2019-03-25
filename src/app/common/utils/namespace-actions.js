import { createActions } from 'redux-actions';

function appendNs(namespace, ...args) {
  const actions = createActions.apply(this, args);
  Object.keys(actions).forEach((key) => {
    const fn = actions[key];
    actions[key] = (...actionArgs) => {
      const action = fn.apply(this, actionArgs);
      action.type = `${namespace}/${action.type}`;
      return action;
    };
  });
  args.forEach((name) => {
    actions[name] = `${namespace}/${name}`;
  });
  return actions;
}

export default namespace => (...args) => (appendNs(namespace, ...args));
