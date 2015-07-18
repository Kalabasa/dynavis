"use strict";
define(["jquery", "react", "react.backbone"], function($, React) {
	return React.createBackboneClass({
		render: function() {
			if(this.model().isNew()) {
				return (
					<div className="login clearfix">
						<form onSubmit={this.handle_login}>
							<input className="form-control" id="username" type="text" required />
							<input className="form-control" id="password" type="password" required />
							<input className="button-login pull-right button pure-button-primary" type="submit" value="Login" />
						</form>
					</div>
				);
			}else{
				return (
					<div className="login clearfix">
						<span className="login-text pull-left">Logged in as <span className="login-username">{this.model().get("username")}</span></span>
						<button className="button-logout pull-right button btn-sm" onClick={this.handle_logout}>Logout</button>
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
});