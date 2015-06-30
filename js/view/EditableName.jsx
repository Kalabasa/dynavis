"use strict";
var components = components || {};
(function(){
	components.EditableName = React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

 		getInitialState: function() {
 			return {
 				name: this.model().get("name"),
 			};
 		},

		render: function() {
			return (
				<span>
					<input type="text" valueLink={this.linkState("name")} required />
				</span>
			);
		},
	});
})();