"use strict";
define(["react", "jsx!view/OfficialName", "react.backbone"], function(React, OfficialName) {
	return React.createBackboneClass({
		render: function() {
			return (
				<li>
					<OfficialName model={this.model()} /> <button onClick={this.handle_delete}>x</button>
				</li>
			);
		},

		handle_delete: function() {
			var that = this;
			this.model().destroy({
				wait: true,
				success: function() {
					that.props.onDelete();
				},
			});
		},
	});
});