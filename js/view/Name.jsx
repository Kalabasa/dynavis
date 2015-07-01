"use strict";
var components = components || {};
(function(){
	components.Name = React.createBackboneClass({
		render: function() {
			return (
				<span>{this.model() ? this.model().get("name") : ""}</span>
			);
		},
	});
})();