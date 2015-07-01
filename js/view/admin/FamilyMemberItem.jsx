"use strict";
var components = components || {};
(function(){
	components.FamilyMemberItem = React.createBackboneClass({
		render: function() {
			return (
				<li>
					<components.OfficialName model={this.model()} /> <button onClick={this.handle_delete}>x</button>
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
})();