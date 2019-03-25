import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';

class Modal extends Component {
  onCancel = () => {
    const { cancel, hideAfterCancel, onToggle } = this.props;
    if (typeof cancel === 'function') {
      cancel();
    }
    if (hideAfterCancel) {
      onToggle(false);
    }
  };

  onOk = () => {
    const { ok, hideAfterOk, onToggle } = this.props;
    if (typeof ok === 'function') {
      ok();
    }
    if (hideAfterOk) {
      onToggle(false);
    }
  };

  hide = (e) => {
    if (e.target.classList.value.indexOf('modals') < 0) {
      return;
    }
    this.props.onToggle(false);
  };

  renderFooter() {
    if (this.props.footer) {
      return (
        <div className="footer">
          {this.props.footer}
        </div>
      );
    }
    if (this.props.defaultFooter) {
      return (
        <div className="footer">
          {
            this.props.noCancel ? null : (
              <div className="btn" onClick={this.onCancel}>
                {this.props.cancelText}
              </div>
            )
          }
          {
            this.props.noOk ? null : (
              <div className="btn btn-primary" onClick={this.onOk}>
                {this.props.okText}
              </div>
            )
          }
        </div>
      );
    }
    return null;
  }

  renderBody() {
    const { title, content } = this.props;
    return (
      <div>
        {
          title ? (
            <div className="title">
              {title}
            </div>
          ) : null
        }
        <div className="content">
          {content}
        </div>
        {this.renderFooter()}
      </div>
    );
  }

  render() {
    const { show, className, children } = this.props;
    return (
      <div className={cx('modals animating fadeIn', { hide: !show })}>
        <div
          className={cx('modal animating scaleIn', className)}
          ref={(dom) => {
            if (dom && dom.style) {
              // 先 top:0, left: 0 触发渲染，计算宽度
              dom.style.cssText = 'top: 0; left: 0';
              dom.style.cssText = `top: 50%; left: 50%; margin: -${Math.floor(dom.offsetHeight / 2)}px 0 0 -${Math.floor(dom.offsetWidth / 2)}px`;
            }
          }}
        >
          {children || this.renderBody()}
        </div>
      </div>
    );
  }
}

Modal.defaultProps = {
  className: '',
  show: false,
  hideAfterCancel: true,
  hideAfterOk: true,
  defaultFooter: true,
  noCancel: false,
  noOk: false,
  okText: '确定',
  cancelText: '取消'
};

export default Modal;
