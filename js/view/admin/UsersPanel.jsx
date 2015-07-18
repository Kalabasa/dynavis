"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/UserRow", "react.backbone"], function(React, SearchControls, PageControls, UserRow) {
	return React.createBackboneClass({
		render: function() {
			console.log(this.collection());
			return (
				<div className="body-panel">
					<SearchControls collection={this.collection()} />
					<div>
						{this.collection().map(function(user) {
							return <UserRow key={user.cid} model={user} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} />
				</div>
			);
		},
	});
});