"use strict";
define(["react", "jsx!view/OfficialName", "react.backbone"], function(React, OfficialName) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div className="family-member-item field clearfix">
					<OfficialName model={this.model()} /> <button className="pull-right button button-complement button-flat button-close" onClick={this.handle_delete}>&times;</button>
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