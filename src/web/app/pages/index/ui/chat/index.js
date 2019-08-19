import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../../actions';
import Header from './header';
import Message from './message';
import Footer from './footer';
import Empty from './empty';
import GroupCard from './groupCard';
import UserCard from './userCard';
// import sdk from '../../sdk';

@connect(
  state => ({
    currentSession: state.getIn(['chat', 'currentSession']),
    switchIndex: state.getIn(['chat', 'switchIndex']),
    currentFriend: state.getIn(['chat', 'currentFriend'])
  }),
  actions
)
export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messageScrollToBottom: false
    };
  }

  messageScrollToBottom = () => {
    this.setState({
      messageScrollToBottom: true
    }, () => {
      this.setState({
        messageScrollToBottom: false
      });
    });
  };

  render() {
    const {
      currentSession,
      switchIndex,
      currentFriend
    } = this.props;

    const currId = currentSession.get('user') || currentSession.get('groupname');
    const currFri = currentFriend.get('user');
    if (switchIndex === 'chat' && currId) {
      return (
        <div id="chat">
          <Header />
          <Message messageScrollToBottom={this.state.messageScrollToBottom} />
          <Footer messageScrollToBottom={this.messageScrollToBottom} />
        </div>
      );
    } else if (switchIndex === 'friends' && currFri) {
      return (
        <div id="friends">
          {
            currentFriend.get('mFlag') === '2' ?
              <GroupCard /> :
              <UserCard />
          }
        </div>
      );
    }

    return (<Empty />);
  }
}
