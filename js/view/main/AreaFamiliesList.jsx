"use strict";
define(function(require){
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		OfficialFamilyCollection = require("model/OfficialFamilyCollection"),
		Name = require("jsx!view/Name");

	return React.createBackboneClass({
		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
				families: [],
			};
		},

		onModelChange: function() {
			this.setState({families: []});
			if(this.collection()) {
				this.collection().chain()
					.filter(function(e){
						return e.get("year") == this.state.year || e.get("year") < this.state.year && this.state.year < e.get("year_end");
					}, this)
					.each(function(e) {
						var official = InstanceCache.get("Official", e.get("official_id"), true);
						var families = new OfficialFamilyCollection(null, {official_id: official.id});
						families.fetch({
							success: function() {
								this.setState({families: this.state.families.concat(families.models)});
							}.bind(this),
						});
					}, this);
			}
		},

		componentDidMount: function() {
			this.props.bus.main_settings.on("update", this.on_main_settings);
		},

		componentWillUnmount: function() {
			this.props.bus.main_settings.off("update", this.on_main_settings);
		},

		render: function() {
			return (
				<div className="area-families-list">
					<h6 className="title">Local Families</h6>
					<ol>
						{_.chain(this.state.families)
							.groupBy(function(f){ return f.id; })
							.pairs()
							.sortBy(function(p){ return -p[1].length; })
							.map(function(p){
								return (
									<li className="area-families-item">
										<Name className="pure-u-1-2 name" key={p[0]} model={p[1][0]}/>
										<span className="pure-u-1-2 count">{p[1].length + " officials"}</span>
									</li>
								);
							})
							.value()
						}
					</ol>
				</div>
			);
		},

		on_main_settings: function(settings) {
			if(settings.year) this.setState({year: settings.year});
		},
	});
});