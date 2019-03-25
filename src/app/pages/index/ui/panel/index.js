import React, { Component } from 'react';
import Info from './info';
import Search from './search';
import Tab from './tab';
// import sdk from '../../sdk';

export default class Panel extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div id="panel">
        <Info />
        <Search />
        <Tab />
      </div>
    );
  }
}
