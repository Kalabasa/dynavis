"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<button onClick={this.props.onPrev}>Prev</button>
					Page {this.collection().getPage() + 1} of {this.collection().getTotalPages()}
					<button onClick={this.props.onNext}>Next</button>
				</div>
			);
		},
	});
});