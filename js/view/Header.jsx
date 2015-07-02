"use strict";
define(["react", "jsx!view/HeaderLogin", "react.backbone"], function(React, HeaderLogin) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<HeaderLogin model={this.model()} />
				</div>
			);
		},
	});
});