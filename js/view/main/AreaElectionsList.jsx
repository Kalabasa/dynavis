"use strict";
define(function(require){
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		OfficialFamilyCollection = require("model/OfficialFamilyCollection"),
		Name = require("jsx!view/Name"),
		OfficialName = require("jsx!view/OfficialName"),
		OfficialFamilyList = require("jsx!view/main/OfficialFamilyList");

	return React.createBackboneClass({
		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
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
					.map(function(e, i) {
						var official = InstanceCache.get("Official", e.get("official_id"), true);
						var families = new OfficialFamilyCollection(null, {official_id: official.id});
						families.fetch();
						return (
							<li key={official.cid} className="area-elections-item">
								<span className="pure-u-1-12 number">{(i+1) + "."}</span>
								<OfficialName className="pure-u-11-12" model={official}/>
							</li>
						);
					}, this)
					.value();
			}
			return (
				<div className="area-elections-list">
					<h4 className="title">Elected Officials</h4>
					<ol>{list}</ol>
				</div>
			);
		},

		on_main_settings: function(settings) {
			if(settings.year) this.setState({year: settings.year});
		},
	});
});