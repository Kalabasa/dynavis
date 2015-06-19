"use strict";
var components = components || {};
(function(){
	components.UserTable = React.createBackboneClass({
		render: function() {
			return (
				<ul>
					{this.getCollection().map(function(user) {
						return <components.UserRow key={user.id} model={user} />;
					})}
				</ul>
			);
		},
	});
})();