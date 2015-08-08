"use strict";
define(function(require){
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		Name = require("jsx!view/Name"),
		OfficialName = require("jsx!view/OfficialName");

	return React.createBackboneClass({
		render: function() {
			if(this.collection()) {
				var list = this.collection().chain()
					.filter(function(e){
						return true;
					})
					.map(function(e) {
						var official = InstanceCache.get("Official", e.get("official_id"), true);
						return (
							<div>
								<OfficialName model={official}/>
								<span>{e.get("position")}</span>
								<span>{e.get("year")}</span>
								<span>{e.get("year_end")}</span>
								<span>{e.get("votes")}</span>
							</div>
						);
					})
					.value();
			}
			return (
				<div>
					{list}
				</div>
			);
		},
	});
});