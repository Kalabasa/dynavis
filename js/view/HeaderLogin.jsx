"use strict";
var components = components || {};
(function(){
	components.HeaderLogin = React.createBackboneClass({
		render: function() {
			if(this.model().isNew()) {
				return (
					<div>
						<form onSubmit={this.handle_login}>
							<input id="username" type="text" required />
							<input id="password" type="password" required />
							<input type="submit" value="Login" />
						</form>
					</div>
				);
			}else{
				return (
					<div>
						{this.model().get("username")}
						<button onClick={this.handle_logout}>Logout</button>
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