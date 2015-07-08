"use strict";
define(["react", "jsx!view/Modal"], function(React, Modal) {
	return React.createClass({
		render: function() {
			return (
				<div>
					Choropleth
					<button className="btn btn-default" onClick={this.handle_select}>Select dataset</button>
				</div>
			);
		},

		handle_select: function() {
			Modal.show("Test", (
				<p>Testing</p>
			));
		},
	});
});