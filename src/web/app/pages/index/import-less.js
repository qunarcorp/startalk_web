import '../../common/styles/reset.less';
import '../../common/styles/icon.less';
import '../../common/styles/animate.less';

import '../../common/styles/index.less';
import '../../common/styles/panel.less';
import '../../common/styles/chat.less';
import '../../common/styles/login.less';
import '../../common/styles/modals.less';
import '../../common/styles/jstree.css';

import '../../common/styles/phone/panel.less';
import '../../common/styles/phone/modals.less';
import '../../common/styles/phone/chat.less';

const styleContent = `
  ::-webkit-scrollbar{
    width: 6px;
    background-color: #F5F5F5;
  }
  ::-webkit-scrollbar-thumb{
    background-color: rgba(50,50,50,.3);
  }
  ::-webkit-scrollbar-track{
    background-color: rgba(50,50,50,.5);
  }
`;

const doc = window.document;
const platform = window.navigator.platform.toLowerCase();
if (platform.indexOf('mac') === -1) {
  if (doc.all) {
    window.qtalkWebStyle = styleContent;
    // eslint-disable-next-line
    doc.createStyleSheet('javascript:qtalkWebStyle');
  } else {
    const style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = styleContent;
    doc.getElementsByTagName('HEAD').item(0).appendChild(style);
  }
}

