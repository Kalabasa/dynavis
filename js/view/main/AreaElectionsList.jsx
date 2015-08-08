"use strict";
define(function(require){
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		Name = require("jsx!view/Name"),
		OfficialName = require("jsx!view/OfficialName");

	return React.createBackboneClass({
		getInitialState: function() {
			return {
				year: null,
			};
		},

		componentDidMount: function() {
			this.props.bus.main_settings.on("update", this.on_main_settings);
		},

		componentWillUnmount: function() {
			this.props.bus.main_settings.off("update", this.on_main_settings);
		},

		render: function() {
			if(this.collection()) {
				var list = this.collection().chain()
					.filter(function(e){
						return e.get("year") == this.state.year || e.get("year") < this.state.year && this.state.year < e.get("year_end");
					}, this)
					.map(function(e) {
						var official = InstanceCache.get("Official", e.get("official_id"), true);
						return (
							<div>
								<OfficialName model={official}/>
								<span>{e.get("position")}</span>
								<span>{e.get("votes")}</span>
							</div>
						);
					}, this)
					.value();
			}
			return (
				<div>
					{list}
				</div>
			);
		},

		on_main_settings: function(settings) {
			if(settings.year) this.setState({year: settings.year});
		},
	});
});