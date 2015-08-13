"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		DatasetCollection = require("model/DatasetCollection"),
		Toggle = require("jsx!view/Toggle"),
		CollectionCount = require("jsx!view/CollectionCount"),
		ConfirmationDialog = require("jsx!view/ConfirmationDialog");

	return React.createBackboneClass({
		componentWillMount: function() {
			this.datasets = new DatasetCollection(null, {username: this.model().get("username")});
			this.datasets.fetch({count: 1}); // FIXME: this is ugly, but... whatever, just need the datasets count
		},

		render: function() {
			var active = this.model().get("active");
			var username = this.model().get("username");
			var url_datasets = "#users/" + username + "/datasets";
			return (
				<div className={"data-row " + (active ? "active" : "inactive")}>
					<div className="pure-g">
						<div className="pure-u-1-8 pad">
							<label>
								<Toggle title="active status" checked={active} disabled={this.user_in()} onChange={this.handle_toggle_active} />
							</label>
						</div>
						<div className="pure-u-3-8 pad field text-large">{username}</div>
						<div className="pure-u-1-6 pad">
							<a href={url_datasets}><CollectionCount collection={this.datasets} /> datasets</a>
						</div>
						<div className="pure-u-1-6 pad clearfix">
							<label className="pull-right">
								<input type="checkbox" checked={this.model().get("role")==="admin"} disabled={this.user_in() || !active} onChange={this.handle_toggle_admin} />
								<span> admin</span>
							</label>
						</div>
						<div className="pure-u-1-6 clearfix">
							<button className={"pull-right button button-complement" + (active ? " button-flat" : "")} disabled={this.user_in()} onClick={this.handle_delete}>Delete</button>
						</div>
					</div>
				</div>
			);
		},

		user_in: function() {
			var token = InstanceCache.get_existing("Token", "session");
			var user = token ? token.get_user() : null;
			if(!user) return false;
			var username = user.get("username");
			return username == this.model().get("username");
		},

		handle_toggle_active: function(e) {
			if(!this.user_in()) {
				this.model().save({active: !this.model().get("active")}, {wait: true});
			}
		},

		handle_toggle_admin: function(e) {
			if(!this.user_in()) {
				if(this.model().get("role") === "admin") {
					this.model().save({role: "user"}, {wait: true});
				}else{
					this.model().save({role: "admin"}, {wait: true});
				}
			}
		},

		handle_delete: function(e) {
			if(!this.user_in()) {
				var that = this;
				ConfirmationDialog.open("Are you sure you want to delete this user and all of their uploaded datasets?", [
					{
						display: "Cancel",
						type: "close",
					},
					{
						display: "Delete",
						type: "secondary",
						callback: function() {
							that.model().destroy({wait: true});
						},
					},
				]);
			}
		},
	});
});