"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			var url_datasets = "#users/" + this.model().get("username") + "/datasets";
			return (
				<li>
					<div>
						<h2>{this.model().get("username")}</h2>
						<a className="btn btn-link" href={url_datasets}>Datasets</a>
						<label className="checkbox-inline">
							<input type="checkbox" checked={this.model().get("role")==="admin"} onChange={this.handle_toggle_admin} /> admin
						</label>
						<button className="btn btn-danger" onClick={this.handle_delete}>Delete</button>
					</div>
				</li>
			);
		},

		handle_toggle_admin: function(e) {
			if(this.model().get("role") === "admin") {
				this.model().save({role: "user"}, {wait: true});
			}
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
});