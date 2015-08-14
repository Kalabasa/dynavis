"use strict";
define(["require", "react.backbone"], function(require) {
	var _ = require("underscore"),
		Backbone = require("backbone"),
		React = require("react", "react.backbone");

	return React.createBackboneClass({
		render: function() {
			if(this.props.selected) {
				var info = [
					(<div className="field-group">
						<span className="pure-u-1-6 label">Uploaded by</span>
						<span className="pure-u-5-6 field">{this.model().get("username")}</span>
					</div>),
					(<div className="field-group">
						<span className="pure-u-1-6 label">Range</span>
						<span className="pure-u-5-6 field">
							{this.model().get("min_year")}-{this.model().get("max_year")}
						</span>
					</div>),
					(<div className="field-group">
						<span className="pure-u-1-6 label">Level</span>
						<span className="pure-u-5-6 field">
							{_.chain(this.model().get("contained_levels"))
								.pick(function(v){ return v; }).keys()
								.map(function(k) {
									return {
										"region": "Regional",
										"province": "Provincial",
										"municipality": "Municipal",
										"barangay": "Barangay",
									}[k];
								})
								.values().join(", ")}
						</span>
					</div>),
				];
			}
			return (
				<div className={"pure-g dataset-chooser-item" + (this.props.selected ? " selected" : "")} onClick={this.props.onClick}>
					<div className="pure-u-1">
							<div className="field text-large">{this.model().get("name")}</div>
							{info}
							<div className="pure-u-1 field text"><pre>{this.model().get("description")}</pre></div>
					</div>
				</div>
			);
		},
	});
});