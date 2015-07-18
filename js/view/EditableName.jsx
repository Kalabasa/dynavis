"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

 		getInitialState: function() {
 			return {
 				name: this.model().get("name"),
 			};
 		},

		render: function() {
			return (
				<input className={this.props.className} type="text" valueLink={this.linkState("name")} required />
			);
		},
	});
});