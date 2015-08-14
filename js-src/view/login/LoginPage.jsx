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

		initialize: function() {
			this.clicked = null;
		},

		onModelChange: function() {
			if(this.props.onLogin && this.model().get_user()) {
				this.props.onLogin();
			}
		},

		render: function() {
			return (
				<div className="login-container">
					<div className="login-box">
						<div className="pure-g">
							<a className="pure-u-1 no-decor" href=".">
								<div className="logo-large"></div>
								<div className="logo-type">DynastyMap</div>
							</a>
						</div>
						<form ref="form" className="pure-g" onSubmit={this.handle_submit}>
							<div className="pure-u-1">
								<input className="input" id="username" type="text" placeholder="Username" valueLink={this.linkState("username")} required />
							</div>
							<div className="pure-u-1">
								<input className="input" id="password" type="password" placeholder="Password" required />
							</div>
							<div className="pure-u-1 login-buttons">
								<input className="pull-right button button-primary" name="login" type="submit" onClick={this.click_login} value="Sign In" />
								<input className="pull-left button" name="register" type="submit" onClick={this.click_register} value="Create Account" />
							</div>
						</form>
						<div className="pure-g">
							<div className="pure-u-1">
								<a className="pull-right text-small" href=".">Go to the home page</a>
							</div>
						</div>
					</div>
				</div>
			);
		},

		click_login: function() {
			this.clicked = "login";
		},
		click_register: function() {
			this.clicked = "register";
		},

		handle_submit: function(e) {
			e.preventDefault();
			this["handle_" + this.clicked](e);
			this.clicked = null;
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
					this.model().login(username, password, null, function(xhr) {
						Notification.open(<span><i className="fa fa-exclamation-circle"/>&ensp;Login error: {xhr.responseText}</span>, null, "error");
					});
				}.bind(this),
				error: function(xhr) {
					Notification.open(<span><p><i className="fa fa-exclamation-circle"/>&ensp;Registration error: {xhr.responseText}</p><p>Your username is possibly already in use.</p></span>, null, "error");
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
	});
});