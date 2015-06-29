"use strict";
var components = components || {};
(function(){
	components.UsersPanel = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Users</h1>
					<components.PageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(user) {
							return <components.UserRow key={user.id} model={user} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();