"use strict";
var components = components || {};
(function(){
	components.Header = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<components.HeaderLogin model={this.getModel()} />
				</div>
			);
		},
	});
})();