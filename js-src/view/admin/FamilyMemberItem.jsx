"use strict";
define(["react", "jsx!view/OfficialName", "react.backbone"], function(React, OfficialName) {
	return React.createBackboneClass({
		render: function() {
			return (
				<li className="family-member-item field clearfix">
					<span className="number pure-u-1-12">{this.props.number}.</span>
					<OfficialName className="pure-u-5-6" model={this.model()} />
					<div className="pure-u-1-12">
						<button className="pull-right button button-complement button-flat button-close" onClick={this.handle_delete}>&times;</button>
					</div>
				</li>
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