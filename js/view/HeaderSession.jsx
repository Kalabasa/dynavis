"use strict";
define(["jquery", "react", "react.backbone"], function($, React) {
	return React.createBackboneClass({
		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				username: ""
			};
		},

		render: function() {
			if(this.model().get_user()) {
				if(!window.location.pathname.match(/^.*?\/admin(\.html)?((\?|#).*)?$/) && this.model().get_user_role() == "admin") {
					var admin_link = (
						<span className="login-text">
							<a className="button button-flat" href="admin">Admin</a>
						</span>
					);
				}
				return (
					<div className="session">
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
			}else{
				return (
					<div className="session">
						<div className="hider">
							<span className="hider-handle">
								<span className="login-text"><i className="fa fa-user"/>&ensp; Login</span>
							</span>
							<span className="hider-content">
								<form onSubmit={this.handle_login}>
									<input className="input mar" id="username" type="text" placeholder="Username" valueLink={this.linkState("username")} required />
									<input className="input mar" id="password" type="password" placeholder="Password" required />
									<input className="button mar" type="submit" value="Login" />
								</form>
								<span className="login-text">
									<a className="button button-flat" href={"login?username="+this.state.username} onClick={this.handle_register}>Register</a>
								</span>
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