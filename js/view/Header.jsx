"use strict";
define(["react", "InstanceCache", "jsx!view/Login"], function(React, InstanceCache, Login) {
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
					<Login model={InstanceCache.get("Token", "session")} />
					<div id="header-content">
						<h2 className="header-title">{this.state.title}</h2>
						<h3 className="header-subtitle">{this.state.subtitle}</h3>
					</div>
				</div>
			);
		},

		set_title: function(title) {
			this.setState({title: title, subtitle: null});
		},

		set_subtitle: function(subtitle) {
			this.setState({subtitle: subtitle});
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
			if(e.route === "datasets" && e.params[0]) {
				this.set_subtitle("uploaded by " + e.params[0]);
			}
		},
	});
});