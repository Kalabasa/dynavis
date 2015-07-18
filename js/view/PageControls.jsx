"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			var page = this.collection().getPage();
			var pages = this.collection().getTotalPages();
			if(page > 1 || pages > 1) {
				return (
					<div className={this.props.className}>
						<button className="button"
							title="Previous page"
							onClick={this.handle_prev}
							disabled={page <= 0}>
							&lt;
						</button>
						Page {page + 1} of {pages}
						<button className="button"
							title="Next page"
							onClick={this.handle_next}
							disabled={page + 1 >= pages}>
							&gt;
						</button>
					</div>
				);
			}else{
				return(
					<div className={this.props.className}>
					</div>
				);
			}
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