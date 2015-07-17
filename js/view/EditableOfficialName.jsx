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
			var classes = (this.props.className || "") + " form-inline";
			return (
				<span className={classes}>
					{/*TODO: add labels somehow*/}
					Surname <input className="form-control" type="text" valueLink={this.linkState("surname")} required />
					Name <input className="form-control" type="text" valueLink={this.linkState("name")} required />
					Nickname <input className="form-control" type="text" valueLink={this.linkState("nickname")} />
				</span>
			);
		},
	});
});