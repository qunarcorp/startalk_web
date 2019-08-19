import React, { Component } from 'react';
import cls from 'classnames';

export default class Emotions extends Component {
  constructor() {
    super();
    const emotions = Object.assign({}, window.QtalkSDK.emotions[0]);
    const { faces } = emotions;
    delete emotions.faces;
    const pageSize = 32;
    this.state = {
      showMenu: false,
      emotions,
      faces,
      pageCount: Math.ceil(faces.length / pageSize),
      pageSize,
      page: 0
    };
  }

  componentDidMount() {
  }

  onChangePage = (e) => {
    this.setState({ page: parseInt(e.target.getAttribute('data-page'), 10) });
  };

  time = null;

  showMenu = (b) => {
    clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.setState({ showMenu: b });
    }, 100);
  };

  render() {
    const {
      showMenu, faces, emotions, pageCount, page, pageSize
    } = this.state;
    let i = 0;
    const pageEl = [];
    let data = [];
    if (showMenu) {
      data = faces.slice(page * pageSize, (page * pageSize) + pageSize);
      while (i < pageCount) {
        pageEl.push(<span
          data-page={i}
          onClick={this.onChangePage}
          className={cls({ active: page === i })}
          key={`page-${i + 1}`}
        />);
        i += 1;
      }
    }
    return (
      <span
        className="bar"
        onMouseLeave={() => { this.showMenu(false); }}
        onMouseEnter={() => { this.showMenu(true); }}
      >
        <i className="iconfont smile" />
        <div
          className={cls('menu emotions', {
            'animation animating bounceIn': showMenu
          })}
        >
          <ul className="clearfix">
            {
              data.map((face, index) => (
                <li
                  onClick={() => { this.props.selected(emotions, face); }}
                  key={`face-${index + 1}`}
                >
                  <img title={face.tip} src={face.url} alt="" />
                </li>
              ))
            }
          </ul>
          <div className="page">{pageEl}</div>
        </div>
      </span>
    );
  }
}
