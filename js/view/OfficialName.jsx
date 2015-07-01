"use strict";
var components = components || {};
(function(){
	components.OfficialName = React.createBackboneClass({
		render: function() {
			return (
				<span>{this.model() ? this.model().get_full_name() : ""}</span>
			);
		},
	});
})();