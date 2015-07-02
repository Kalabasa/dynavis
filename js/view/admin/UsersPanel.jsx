"use strict";
define(["react", "jsx!view/PageControls", "jsx!view/admin/UserRow", "react.backbone"], function(React, PageControls, UserRow) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Users</h1>
					<PageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(user) {
							return <UserRow key={user.id} model={user} />;
						})}
					</ul>
				</div>
			);
		},
	});
});