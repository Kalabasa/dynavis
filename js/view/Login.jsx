"use strict";
define(["jquery", "react", "react.backbone"], function($, React) {
	return React.createBackboneClass({
		render: function() {
			if(this.model().isNew()) {
				return (
					<div className="login clearfix">
						<form onSubmit={this.handle_login}>
							<input className="input mar" id="username" type="text" placeholder="Username" required />
							<input className="input mar" id="password" type="password" placeholder="Password" required />
							<input className="pull-right button mar" type="submit" value="Login" />
						</form>
					</div>
				);
			}else{
				return (
					<div className="login clearfix">
						<span className="login-text pull-left">Logged in as <span className="login-username">{this.model().get("username")}</span></span>
						<button className="pull-right button" onClick={this.handle_logout}>Logout</button>
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