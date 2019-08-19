import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';

class SelectOne extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      inputValue: '',
      renderData: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show });
    }
    if (nextProps.value !== this.props.value) {
      this.setState({
        inputValue: nextProps.value[nextProps.mapKey.text]
      });
    }
    this.setState({ renderData: this.props.data });
  }

  onChange(val) {
    let renderData = this.props.data.filter(item =>
      item[this.props.mapKey.text].indexOf(val) > -1);
    if (!val) {
      renderData = this.props.data;
    }
    this.setState({
      inputValue: val,
      renderData
    });
    this.props.onChange(val);
  }

  onClick(val) {
    this.setState({
      inputValue: val[this.props.mapKey.text]
    });
    this.props.onSelect(val);
  }

  render() {
    const { mapKey, value } = this.props;
    return (
      <div className={cx('select', this.props.className)}>
        <i className="icon arrow-down" />
        <input
          type="text"
          className="s-search"
          onFocus={() => this.setState({ show: true })}
          onBlur={() => setTimeout(() => this.setState({ show: false }), 200)}
          value={this.state.inputValue}
          onChange={e => this.onChange(e.target.value.trim())}
        />
        <ul className={cx('s-list animating slideDownIn', { hide: !this.state.show })}>
          {
            this.state.renderData.map(item => (
              <li
                key={`select2-one-list-${item[mapKey.value]}`}
                className={cx('s-list-item', { active: item[mapKey.value] === value[mapKey.value] })}
                onClick={() => this.onClick(item)}
              >
                {item[mapKey.text]}
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

SelectOne.defaultProps = {
  className: '',
  show: false,
  data: [],
  onChange: () => {},
  onSelect: () => {},
  value: {},
  mapKey: { text: 'text', value: 'value' }
};

export default SelectOne;
