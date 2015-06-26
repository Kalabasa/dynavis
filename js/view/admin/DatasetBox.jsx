"use strict";
var components = components || {};
(function(){
	components.DatasetBox = React.createBackboneClass({
		render: function() {
			return (
				<li>
					<h2>{this.model().get("name")}</h2>
					{this.model().get("username")}
					{this.model().get("description")}
				</li>
			);
		},
	});
})();