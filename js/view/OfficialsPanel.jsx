"use strict";
var components = components || {};
(function(){
	components.OfficialsPanel = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Officials</h1>
					<components.OfficialTable collection={this.collection()} />
				</div>
			);
		},
	});
})();