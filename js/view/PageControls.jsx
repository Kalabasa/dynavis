"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			var page = this.collection().getPage();
			var pages = this.collection().getTotalPages();
			return (
				<div>
					<button className="btn btn-default" onClick={this.handle_prev} disabled={page <= 0}>Prev</button>
					Page {page + 1} of {pages}
					<button className="btn btn-default" onClick={this.handle_next} disabled={page + 1 >= pages}>Next</button>
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