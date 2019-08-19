import React from 'react';
import {
  Prompt,
  Link,
  BrowserRouter,
  HashRouter,
  Route
} from 'react-router-dom';

const MyRoute = ({
  component: Component,
  exact,
  path,
  strict,
  ...rest
}) => (
  <Route
    {...{ exact, path, strict }}
    render={
      props => (<Component {...{ ...rest, ...props }} />)
    }
  />
);

export default {
  Prompt,
  Link,
  BrowserRouter,
  HashRouter,
  Route: MyRoute
};
