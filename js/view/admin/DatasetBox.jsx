"use strict";
var components = components || {};
(function(){
	components.DatasetBox = React.createBackboneClass({
		render: function() {
			return (
				<li>
					<h2>{this.model().get("name")}</h2>
					by {this.model().get("username")}
					{this.model().get("description")}
					<button onClick={this.handle_delete}>Delete</button>
				</li>
			);
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
})();