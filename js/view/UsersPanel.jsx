"use strict";
var components = components || {};
(function(){
	components.UsersPanel = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Users</h1>
					<components.UserTable collection={this.getCollection()} />
				</div>
			);
		},
	});
})();