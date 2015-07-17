"use strict";
define(["react", "jsx!view/Login"], function(React, Login) {
	return React.createClass({
		componentWillMount: function() {
			this.props.bus.router.on("route", this.on_route);
		},

		componentWillUnmount: function() {
			this.props.bus.router.off("route", this.on_route);
		},

		getInitialState: function() {
			return {
				title: this.props.title,
			};
		},

		render: function() {
			return (
				<div>
					<Login model={this.props.token} />
					<div id="header-content">
						<h2>{this.state.title}</h2>
					</div>
				</div>
			);
		},

		set_title: function(title) {
			this.setState({title: title});
		},

		on_route: function(e) {
			var title_map = {
				"elections": "Elections",
				"officials": "Officials",
				"families": "Families",
				"areas": "Areas",
				"datasets": "Datasets",
				"users": "Users",
			};
			this.set_title(title_map[e.route]);
		},
	});
});