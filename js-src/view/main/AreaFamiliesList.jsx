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

		componentWillReceiveProps: function(nextProps) {
			if(!nextProps.collection) {
				this.setState({families: []});
			}
		},

		onModelChange: function() {
			this.setState({families: []});
			var result_families = [];
			console.log(this.collection());
			this.collection().chain()
				.filter(function(e){
					return e.get("year") == this.state.year || e.get("year") < this.state.year && this.state.year < e.get("year_end");
				}, this)
				.each(function(e) {
					var official_id = e.get("official_id");
					var name = "OfficialFamilyCollection";
					var families = InstanceCache.get_existing(name, official_id);
					if(families) {
						result_families = result_families.concat(families.models);
						this.setState({families: result_families});
					}else{
						families = new OfficialFamilyCollection(null, {official_id: official_id});
						InstanceCache.set(name, official_id, families);
						families.fetch({
							success: function() {
								result_families = result_families.concat(families.models);
								this.setState({families: result_families});
							}.bind(this),
						});
					}
				}, this);
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
					<h4 className="title">Top Local Families</h4>
					{this.collection() && this.collection().size() ? <ol>
							{_.chain(this.state.families)
								.groupBy(function(f){ return f.id; })
								.pairs()
								.sortBy(function(p){ return -p[1].length; })
								.map(function(p, i){
									return (
										<li key={p[0]} className="area-families-item">
											<span className="pure-u-1-6 number">{(i+1) + "."}</span>
											<span className="pure-u-5-6">
												<Name className="pure-u-1-2 name" model={p[1][0]}/>
												<span className="pure-u-1-2 count">{p[1].length + " officials"}</span>
											</span>
										</li>
									);
								})
								.value()
							}
						</ol>
						: <span>None</span>}
				</div>
			);
		},

		on_main_settings: function(settings) {
			if(settings.year) this.setState({year: settings.year});
		},
	});
});