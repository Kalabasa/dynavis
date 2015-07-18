"use strict";
define(["react", "jsx!view/OfficialName", "react.backbone"], function(React, OfficialName) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div className="field">
					<OfficialName model={this.model()} /> <button className="button btn-xs" onClick={this.handle_delete}>&times;</button>
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