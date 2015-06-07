"use strict";

var app = app || {};

(function(){
	app.views.UserRow = React.createClass({
		render: function() {
			return <li>{this.props.user.get("username")}</li>;
		},
	});
})();