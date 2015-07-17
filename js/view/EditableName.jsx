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
			var classes = (this.props.className || "") + " form-inline";
			return (
				<span className={classes}>
					<input className="form-control" type="text" valueLink={this.linkState("name")} required />
				</span>
			);
		},
	});
});