"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

 		getInitialState: function() {
 			return {
 				surname: this.model().get("surname"),
 				name: this.model().get("name"),
 				nickname: this.model().get("nickname"),
 			};
 		},

		render: function() {
			var nickname = this.state.nickname;
			return (
				<span>
					{/*TODO: add labels somehow*/}
					<input type="text" valueLink={this.linkState("surname")} required />
					<input type="text" valueLink={this.linkState("name")} required />
					<input type="text" valueLink={this.linkState("nickname")} />
				</span>
			);
		},
	});
});