"use strict";
var components = components || {};
(function(){
	components.UserRow = React.createBackboneClass({
		render: function() {
			var url_datasets = "#users/" + this.model().get("username") + "/datasets";
			return (
				<li>
					<div>
						<h2>{this.model().get("username")}</h2>
						<input type="checkbox" checked={this.model().get("role")==="admin"} onChange={this.handle_toggle_admin} /> admin
						<a href={url_datasets}>Datasets</a>
						<button onClick={this.handle_delete}>Delete</button>
					</div>
				</li>
			);
		},

		handle_toggle_admin: function(e) {
			var new_role = "user";
			if(this.model().get("role") === "user") {
				new_role = "admin";
			}
			this.model().save({role: new_role}, {wait: true});
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
})();