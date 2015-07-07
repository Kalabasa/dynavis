"use strict";
define(["react"], function(React) {
	return React.createClass({
		getInitialState: function() {
			return {
				title: this.props.title,
			};
		},

		render: function() {
			return (
				<div>
					<h1>{this.state.title}</h1>
				</div>
			);
		},

		set_title: function(title) {
			this.setState({title: title});
		},
	});
});