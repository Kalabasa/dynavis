"use strict";
define(["react", "InstanceCache", "model/DatasetCollection", "jsx!view/CollectionCount", "mixin/ClickToTopMixin", "react.backbone"], function(React, InstanceCache, DatasetCollection, CollectionCount, ClickToTopMixin) {
	return React.createBackboneClass({
		mixins: [ClickToTopMixin],

		render: function() {
			var username = this.model().get("username");
			var url_datasets = "#users/" + username + "/datasets";
			var datasets = new DatasetCollection(null, {username: username});
			datasets.fetch({count: 1}); // TODO: this is ugly, but... whatever
			return (
				<div className="data-row container-fluid">
					<div className="pure-g">
						<div className="pure-u-1-3 field text-large">{this.model().get("username")}</div>
						<div className="pure-u-1-3">
							<a href={url_datasets}><CollectionCount collection={datasets} /> Datasets</a>
						</div>
						<div className="pure-u-1-6">
							<label className="checkbox-inline">
								<input type="checkbox" checked={this.model().get("role")==="admin"} disabled={this.user_in()} onChange={this.handle_toggle_admin} /> admin
							</label>
						</div>
						<div className="pure-u-1-6">
							<button className="button " onClick={this.handle_delete}>Delete</button>
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
			this.model().destroy({wait: true});
		},
	});
});