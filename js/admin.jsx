"use strict";

(function(){
	var user = new app.models.User({
		id: 4,
		username: "lean",
		type: 0,
	});

	React.render(
		<app.views.UserRow user={user}/>,
		document.body
	);
})();