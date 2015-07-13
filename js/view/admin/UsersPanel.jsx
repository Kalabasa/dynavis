"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/admin/UserRow", "react.backbone"], function(React, SearchControls, UserRow) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Users</h1>
					<SearchControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(user) {
							return <UserRow key={user.cid} model={user} />;
						})}
					</ul>
				</div>
			);
		},
	});
});