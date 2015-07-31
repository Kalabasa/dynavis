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
				<span className={this.props.className}>
					<label className="pure-u-1 pad">
						<div className="label">Surname</div>
						<input className="pure-u-1" type="text" valueLink={this.linkState("surname")} required autoFocus={this.props.autoFocus} />
					</label>
					<label className="pure-u-1 pad">
						<div className="label">Name</div>
						<input className="pure-u-1" type="text" valueLink={this.linkState("name")} required />
					</label>
					<label className="pure-u-1 pad">
						<div className="label">Nickname</div>
						<input className="pure-u-1" type="text" valueLink={this.linkState("nickname")} />
					</label>
				</span>
			);
		},
	});
});