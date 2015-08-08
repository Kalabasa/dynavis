"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react"),
		InstanceCache = require("InstanceCache"),
		AreaElectionCollection = require("model/AreaElectionCollection"),
		Name = require("jsx!view/Name"),
		AreaElectionsList = require("jsx!view/main/AreaElectionsList");

	return React.createClass({
		getInitialState: function() {
			return {
				selected: null,
			};
		},

		componentDidMount: function() {
			this.props.bus.router.on("route", this.on_route);
			this.props.bus.map_settings.on("select", this.on_select);
		},

		componentWillUnmount: function() {
			this.props.bus.router.off("route", this.on_route);
			this.props.bus.map_settings.off("select", this.on_select);
		},

		render: function() {
			var area = null, elections = null;
			if(this.state.selected && this.state.selected.area_code) {
				area = InstanceCache.get("Area", this.state.selected.area_code, true);
				elections = new AreaElectionCollection(null, {area: area});
				elections.fetch();
			}
			return (
				<div className="pure-g">
					<div className="pure-u-4-5">
						<h3><Name model={area}/></h3>
						<AreaElectionsList collection={elections}/>
					</div>
					<div className="pure-u-1-5">
						<button className="pull-right button button-flat button-close" onClick={this.handle_close}>&times;</button>
					</div>
				</div>
			);
		},

		on_select: function(selected) {
			this.setState({selected: selected});
			if(selected) {
				this.show();
			}
		},

		on_route: function(e) {
			this.hide();
		},

		handle_close: function() {
			this.hide();
			setTimeout(this.state.selected.on_close, 200);
		},

		show: function() {
			$(React.findDOMNode(this).parentNode).addClass("show");
		},

		hide: function() {
			$(React.findDOMNode(this).parentNode).removeClass("show");
		},
	});
});