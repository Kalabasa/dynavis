"use strict";
define(["react", "jsx!view/OfficialName", "react.backbone"], function(React, OfficialName) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<OfficialName className="field" model={this.model()} /> <button className="btn btn-default btn-xs" onClick={this.handle_delete}>&times;</button>
				</div>
			);
		},

		handle_delete: function() {
			var that = this;
			this.model().destroy({
				wait: true,
				success: function() {
					that.props.onDeleteMember(that.model());
				},
			});
		},
	});
});