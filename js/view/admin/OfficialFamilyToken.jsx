"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<span>
					{this.model().get("name")} <button onClick={this.handle_delete}>x</button>
				</span>
			);
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});