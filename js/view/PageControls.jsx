"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<button onClick={this.handle_prev}>Prev</button>
					Page {this.collection().getPage() + 1} of {this.collection().getTotalPages()}
					<button onClick={this.handle_next}>Next</button>
				</div>
			);
		},

		handle_prev: function() {
			if(this.props.onPrev) {
				this.props.onPrev();
			}else{
				this.collection().prev();
			}
		},

		handle_next: function() {
			if(this.props.onNext) {
				this.props.onNext();
			}else{
				this.collection().next();
			}
		},
	});
});