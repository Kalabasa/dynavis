"use strict";
define(["jquery", "react", "react.backbone"], function($, React) {
	return React.createBackboneClass({
		render: function() {
			if(this.model().isNew()) {
				return (
					<div className="login">
						<div className="hider">
							<span className="hider-handle">
								<span className="login-text"><i className="fa fa-user"/>&ensp; Login</span>
							</span>
							<span className="hider-content">
								<form onSubmit={this.handle_login}>
									<input className="input mar" id="username" type="text" placeholder="Username" required />
									<input className="input mar" id="password" type="password" placeholder="Password" required />
									<input className="button mar" type="submit" value="Login" />
								</form>
							</span>
						</div>
					</div>
				);
			}else{
				if(!window.location.pathname.match(/^.*?\/admin\.html((\?|#).*)?$/)) {
					var admin_link = (
						<span className="login-text">
							<a className="button button-flat" href="admin.html">Admin Dashboard</a>
						</span>
					);
				}
				return (
					<div className="login">
						<div className="hider">
							<span className="hider-handle">
								<span className="login-text login-username">{this.model().get("username")} &ensp;<i className="fa fa-user"/></span>
							</span>
							<span className="hider-content">
								{admin_link}
								<button className="button" onClick={this.handle_logout}>Logout</button>
							</span>
						</div>
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