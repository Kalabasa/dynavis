"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		Name = require("jsx!view/Name");

	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					{this.collection().map(function(o) {
						return <Name key={o.cid} model={o}/>;
					})}
				</div>
			);
		},
	});
});