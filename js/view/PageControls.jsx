"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<button className="btn btn-default" onClick={this.handle_prev} disabled={this.collection().getPage() <= 0}>Prev</button>
					Page {this.collection().getPage() + 1} of {this.collection().getTotalPages()}
					<button className="btn btn-default" onClick={this.handle_next} disabled={this.collection().getPage() + 1 >= this.collection().getTotalPages()}>Next</button>
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