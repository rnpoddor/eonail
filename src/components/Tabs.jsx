/*
 * Tabs by Todd Motto
 * https://toddmotto.com/creating-a-tabs-component-with-react/
 * 
 * refactored to class implementation
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Pane extends Component {
  render() {
  	return (
    	<div>
      	{this.props.children}
      </div>
    );
  }
}

Pane.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
};

class Tabs extends Component {
  state = {
    selected: this.props.selected
  }

  shouldComponentUpdate(nextProps, nextState) {
  	return this.props !== nextProps || this.state !== nextState;
  }

  handleClick(index, event) {
  	event.preventDefault();
    this.setState({
    	selected: index
    });
  }

  _renderTitles = function() {
  	function labels(child, index) {
    	var activeClass = (this.state.selected === index ? 'active' : '');
    	return (
      	<li key={index}>
        	<a href={"#" + child.props.label} 
          	className={activeClass}
          	onClick={this.handleClick.bind(this, index)}>
          	{child.props.label}
          </a>
        </li>
      );
    }

  	return (
    	<ul className="tabs__labels">
      	{this.props.children.map(labels.bind(this))}
      </ul>
    );
  }

  _renderContent = function() {
  	return (
    	<div className="tabs__content">
	    	{this.props.children[this.state.selected]}
      </div>
    );
  }

	render() {
  	return (
    	<div className="tabs">
        {this._renderTitles()}
      	{this._renderContent()}
      </div>
    );
  }
}

Tabs.propTypes = {
  selected: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ]).isRequired
};

export { Tabs, Pane };