"use strict";
var components = components || {};
(function(){
	components.OfficialName = React.createBackboneClass({
		render: function() {
			return (
				<span>{this.model().get("surname")}, {this.model().get("name")}</span>
			);
		},
	});
})();