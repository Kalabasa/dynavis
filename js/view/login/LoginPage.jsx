"use strict";
define(function(require) {
	var $ = require("jquery"),
		React = require("react.backbone"),
		Notification = require("jsx!view/Notification");

	return React.createBackboneClass({
		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				username: (location.search.split("username=")[1]||"").split("&")[0] || "",
			};
		},

		onModelChange: function() {
			if(this.props.onLogin && this.model().get_user()) {
				this.props.onLogin();
			}
		},

		render: function() {
			return (
				<div className="login-box">
					<div className="pure-g">
						<a className="pure-u-1" href=".">Logo</a>
					</div>
					<form className="pure-g" onSubmit={this.handle_login}>
						<div className="pure-u-1">
							<input className="input" id="username" type="text" placeholder="Username" valueLink={this.linkState("username")} required />
						</div>
						<div className="pure-u-1">
							<input className="input" id="password" type="password" placeholder="Password" required />
						</div>
						<div className="pure-u-1">
							<input className="pull-left button" type="button" onClick={this.handle_register} value="Register" />
							<input className="pull-right button button-primary" type="submit" value="Login" />
						</div>
					</form>
				</div>
			);
		},

		handle_register: function() {
			var $el = $(this.el());
			var username = $el.find("#username").val();
			var password = $el.find("#password").val();
			$.ajax({
				method: "POST",
				url: "api.php/users",
				data: JSON.stringify({username: username, password: password}),
				processData: false,
				dataType: "json",
				success: function(data) {
					this.model().login(username, password);
				}.bind(this),
				error: function(xhr) {
					Notification.open(<span><i className="fa fa-exclamation-circle"/>&ensp;Registration error: {xhr.responseText}</span>, null, "error");
				},
			});
		},

		handle_login: function(e) {
			e.preventDefault();
			var $el = $(this.el());
			var username = $el.find("#username").val();
			var password = $el.find("#password").val();
			this.model().login(username, password, null, function(xhr) {
				Notification.open(<span><i className="fa fa-exclamation-circle"/>&ensp;Login error: {xhr.responseText}</span>, null, "error");
			});
		},

		handle_logout: function(e) {
			this.model().logout();
		},
	});
});