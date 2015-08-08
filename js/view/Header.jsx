"use strict";
define(["react", "InstanceCache", "model/Dataset", "jsx!view/HeaderSession"], function(React, InstanceCache, Dataset, HeaderSession) {
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
				subtitle: null,
			};
		},

		render: function() {
			document.title = (this.state.title ? (this.state.title + (this.state.subtitle ? (" " + this.state.subtitle) : "") + " - ") : "") + "DynastyMap";
			if(this.state.subtitle) {
				var subtitle = <h3 className="header-subtitle">{this.state.subtitle}</h3>
			}
			var token = InstanceCache.get_existing("Token", "session");
			return (
				<div className="clearfix">
					<div id="logo">
						<a href=".">DynastyMap</a>
					</div>
					<div id="header-content">
						<h2 className="header-title">{this.state.title}</h2>
						{subtitle}
					</div>
					<HeaderSession model={token}/>
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
				"datapoints": "Dataset",
				"users": "Users",
			};
			this.set_title(title_map[e.route]);
			
			if(e.route === "datasets" && e.params[0]) {
				this.set_subtitle("uploaded by " + e.params[0]);
			}
			if(e.route === "datapoints" && e.params[0] && e.params[1]) {
				var id = parseInt(e.params[1], 10);
				var dataset = InstanceCache.get_existing("Dataset", id)
					|| new Dataset({id: id, username: e.params[0]});
				dataset.fetch({
					success: function(model) {
						this.set_subtitle(model.get("name"));
					}.bind(this)
				});
			}
		},
	});
});