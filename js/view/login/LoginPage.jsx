"use strict";
define(["jquery", "react", "react.backbone"], function($, React) {
	return React.createBackboneClass({
		onModelChange: function() {
			if(this.props.onLogin && this.model().get_user()) {
				this.props.onLogin();
			}
		},

		render: function() {
			return (
				<div className="login-box">
					<form className="pure-g" onSubmit={this.handle_login}>
						<div className="pure-u-1">
							<input className="input" id="username" type="text" placeholder="Username" required />
						</div>
						<div className="pure-u-1">
							<input className="input" id="password" type="password" placeholder="Password" required />
						</div>
						<div className="pure-u-1">
							<input className="pull-right button button-primary" type="submit" value="Login" />
						</div>
					</form>
				</div>
			);
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
});