"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<span className="token">
					{this.model().get("name")} <button type="button" onClick={this.handle_delete}>&times;</button>
				</span>
			);
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});