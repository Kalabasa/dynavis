"use strict";
var components = components || {};
(function(){
	components.IndexedPageControls = React.createBackboneClass({
		getInitialState: function() {
			return {letter: null};
		},

		render: function() {
			return(
				<div>
					<components.AlphabetIndex
						getCallback={this.index_handler} />
					<components.PageControls
						collection={this.collection()}
						onPrev={this.handle_prev}
						onNext={this.handle_next} />
				</div>
			);
		},

		index_handler: function(letter) {
			var that = this;
			return function() {
				that.setState({letter: letter});
				that.collection().page(0, that.get_data(letter));
			};
		},

		handle_prev: function() {
			this.collection().prev(this.get_data());
		},
		handle_next: function() {
			this.collection().next(this.get_data());
		},

		get_data: function(letter) {
			if(letter === undefined) letter = this.state.letter;
			return letter ? {data: {q: letter + "%", norm: 0}} : null;
		},
	});
})();