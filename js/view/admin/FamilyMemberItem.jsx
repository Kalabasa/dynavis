"use strict";
var components = components || {};
(function(){
	components.FamilyMemberItem = React.createBackboneClass({
		render: function() {
			return (
				<div>
					{this.model().get("surname")}, {this.model().get("name")} <button onClick={this.handle_delete}>x</button>
				</div>
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
			this.props.official_hound.clear();
		},
	});
})();