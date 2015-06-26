"use strict";
var components = components || {};
(function(){
	components.Username= React.createBackboneClass({
		render: function() {
			return (
				<span>{this.model().get("username")}</span>
			);
		},
	});
})();