"use strict";
var components = components || {};
(function(){
	components.HeaderLogin = React.createBackboneClass({
		mixins: [React.BackboneMixin({renderOn: "all"})],
		render: function() {
			var user = this.model().get_user();
			if(user) {
				return (
					<div>
						{user.get("username")}
						<button onClick={this.handle_logout}>Logout</button>
					</div>
				);
			}else{
				return (
					<div>
						<form>
							<input id="username" type="text" />
							<input id="password" type="password" />
							<button onClick={this.handle_login}>Login</button>
						</form>
					</div>
				);
			}
		},

		handle_login: function(e) {
			e.preventDefault();
			var $el = $(this.el());
			var username = $el.find("#username").val();
			var password = $el.find("#password").val();
			this.model().login(username, password);
		},

		handle_logout: function(e) {
			this.model().logout();
		},
	});
})();