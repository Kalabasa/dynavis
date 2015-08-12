"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<span className="token">
					<span>{this.model().get("name")}</span>
					<button className="button-close" type="button" onClick={this.handle_delete}>&times;</button>
				</span>
			);
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});