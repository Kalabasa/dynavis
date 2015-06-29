"use strict";
var components = components || {};
(function(){
	components.PageControls = React.createBackboneClass({
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
})();