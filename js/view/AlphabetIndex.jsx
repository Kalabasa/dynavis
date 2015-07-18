"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<button className="pure-button" onClick={this.props.getCallback(null)}>All</button>
					{_.map("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), function(letter) {
						return <button className="pure-button" key={letter} onClick={that.props.getCallback(letter)}>{letter}</button>
					})}
				</div>
			);
		},
	});
});