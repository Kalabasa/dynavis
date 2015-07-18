"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<span className={this.props.className}>{this.collection().size()}</span>
			);
		},
	});
});