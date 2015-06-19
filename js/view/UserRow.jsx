"use strict";
var components = components || {};
(function(){
	components.UserRow = React.createBackboneClass({
		render: function() {
			return (
				<li>
					<div>
						<h1>{this.getModel().get("username")}</h1>
						<button onClick={this.handle_delete}>Delete</button>
					</div>
				</li>
			);
		},

		handle_delete: function(e) {
			e.preventDefault();
			console.log("delete " + this.getModel().get("username"));
			this.getModel().destroy({wait: true});
		},
	});
})();