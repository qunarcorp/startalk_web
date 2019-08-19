import React, { Component } from 'react';

export default class Empty extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div id="chat">
        <i
          style={{
            fontSize: 180,
            color: '#eee',
            position: 'absolute',
            left: '50%',
            top: '50%',
            margin: '-144px 0 0 -90px'
          }}
          className="iconfont empty"
        />
      </div>
    );
  }
}
