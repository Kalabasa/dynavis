"use strict";
define(["react", "jsx!view/AlphabetIndex", "jsx!view/PageControls", "react.backbone"], function(React, AlphabetIndex, PageControls) {
	return React.createBackboneClass({
		getInitialState: function() {
			return {letter: null};
		},

		render: function() {
			return(
				<div>
					<AlphabetIndex
						getCallback={this.index_handler} />
					<PageControls
						collection={this.collection()}
						onPrev={this.handle_prev}
						onNext={this.handle_next} />
				</div>
			);
		},

		set_letter: function(letter, options) {
			this.collection().setParams(this.get_data(letter));
			this.collection().page(0);
			this.setState({letter: letter});
		},

		index_handler: function(letter) {
			var that = this;
			return function() {
				that.set_letter(letter);
			};
		},

		handle_prev: function() {
			this.collection().prev();
		},
		handle_next: function() {
			this.collection().next();
		},

		get_data: function(letter) {
			if(letter === undefined) letter = this.state.letter;
			return letter ? {q: letter, qindex: 1} : null;
		},
	});
});