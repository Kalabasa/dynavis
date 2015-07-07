"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<li>
					<h2>{this.model().get("name")}</h2>
					by {this.model().get("username")}
					{this.model().get("description")}
					<button className="btn btn-danger" onClick={this.handle_delete}>Delete</button>
				</li>
			);
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});