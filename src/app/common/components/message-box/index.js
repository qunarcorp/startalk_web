import React, { Component } from 'react';
import ReactDom from 'react-dom';
import Modal from '../modal';

const noop = () => { };

const contentWrapper = content => (
  <div
    style={{ wordBreak: 'break-word' }}
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

class MessageBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      title: null,
      content: null,
      isConfirm: false,
      okText: '确定',
      cancelText: '取消'
    };
    this.confirmCancel = noop;
    this.confirmOk = noop;
  }

  toggle = (show) => {
    this.setState({
      show
    });
  };

  cancel = () => {
    if (this.state.isConfirm) {
      this.confirmCancel();
      this.confirmCancel = noop;
    }
  };

  ok = () => {
    this.confirmOk();
    this.confirmOk = noop;
  };

  alert(content, title, okText = '确定') {
    this.setState({
      content: contentWrapper(content),
      isConfirm: false,
      show: true,
      title,
      okText
    });
    return {
      ok: (fn) => {
        this.confirmOk = fn;
      }
    };
  }

  confirm(content, title, okText = '确定', cancelText = '取消') {
    this.setState({
      content: contentWrapper(content),
      isConfirm: true,
      show: true,
      title,
      okText,
      cancelText
    });
    return this.confirmBind();
  }

  confirmBind() {
    const result = {
      ok: (fn) => {
        this.confirmOk = fn;
        return result;
      },
      cancel: (fn) => {
        this.confirmCancel = fn;
        return result;
      }
    };
    return result;
  }

  render() {
    const modalProps = {
      defaultFooter: true,
      show: this.state.show,
      onToggle: this.toggle,
      title: this.state.title,
      content: this.state.content,
      cancel: this.cancel,
      ok: this.ok,
      noCancel: !this.state.isConfirm,
      okText: this.state.okText,
      cancelText: this.state.cancelText
    };
    return (
      <Modal {...modalProps} />
    );
  }
}

const container = document.createElement('div');
document.body.appendChild(container);

export default ReactDom.render(
  <MessageBox />,
  container
);
