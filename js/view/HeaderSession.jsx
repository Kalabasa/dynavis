"use strict";
define(["jquery", "react", "InstanceCache", "react.backbone"], function($, React, InstanceCache) {
	return React.createBackboneClass({
		mixins: [React.addons.LinkedStateMixin],

		render: function() {
			var user = this.model() ? this.model().get_user() : null;
			if(user) {
				if(!window.location.pathname.match(/^.*?\/admin(\.html)?((\?|#).*)?$/) && this.model().get_user_role() == "admin") {
					var admin_link = (
						<a className="button button-flat mar" href="admin">Admin</a>
					);
				}
				return (
					<div className="session">
						<div className="hider">
							<div className="hider-handle hider-handle-toggle">
								<span className="login-text">
									<i className="fa fa-user"/>
									<span className="login-username">&ensp; {user.get("username")}</span>
								</span>
							</div>
							<div className="hider-content">
								<span className="login-text">
									<a className="button button-flat" href="#datasets">Datasets</a>
									{admin_link}
								</span>
								<button className="button button-flat" onClick={this.handle_logout}>Sign Out</button>
							</div>
						</div>
					</div>
				);
			}else{
				return (
					<div className="session">
						<span className="login-text">
							<a className="button button-flat mar" href="login">Create Account</a>
							<a className="button mar" href="login">Sign In</a>
						</span>
					</div>
				);
			}
		},

		handle_logout: function(e) {
			this.model().logout();
		},
	});
});