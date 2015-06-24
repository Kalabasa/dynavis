"use strict";
var components = components || {};
(function(){
	components.AreaName = React.createBackboneClass({
		render: function() {
			return (
				<span>{this.model().get("name")}</span>
			);
		},
	});
})();