"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<span>{this.model() ? this.model().get_full_name() : ""}</span>
			);
		},
	});
});