"use strict";
define(["react", "InstanceCache", "model/DatasetCollection", "jsx!view/Toggle", "jsx!view/CollectionCount", "react.backbone"], function(React, InstanceCache, DatasetCollection, Toggle, CollectionCount) {
	return React.createBackboneClass({
		componentWillMount: function() {
			this.datasets = new DatasetCollection(null, {username: this.model().get("username")});
			this.datasets.fetch({count: 1}); // FIXME: this is ugly, but... whatever, just need the datasets count
		},

		render: function() {
			var username = this.model().get("username");
			var url_datasets = "#users/" + username + "/datasets";
			return (
				<div className="data-row">
					<div className="pure-g">
						<div className="pure-u-1-4 field text-large">{username}</div>
						<div className="pure-u-1-4">
							<a href={url_datasets}><CollectionCount collection={this.datasets} /> Datasets</a>
						</div>
						<div className="pure-u-1-4">
							<label>
								<span className="label">Admin</span>
								<Toggle type="checkbox" checked={this.model().get("role")==="admin"} disabled={this.user_in()} onChange={this.handle_toggle_admin} />
							</label>
						</div>
						<div className="pure-u-1-4 clearfix">
							<button className="pull-right button button-flat button-complement" disabled={this.user_in()} onClick={this.handle_delete}>Delete</button>
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
				this.model().destroy({wait: true});
			}
		},
	});
});