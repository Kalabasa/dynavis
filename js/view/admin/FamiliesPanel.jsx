"use strict";
var components = components || {};
(function(){
	components.FamiliesPanel = React.createBackboneClass({
		getInitialState: function() {
			return {letter: null};
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h1>Families</h1>
					<div>
						<button onClick={this.handle_all}>All</button>
						{_.map("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), function(letter) {
							return <button onClick={that.index_handler(letter)}>{letter}</button>
						})}
					</div>
					<div>
						<button onClick={this.handle_prev}>Prev</button>
						Page {this.collection().getPage() + 1} of {this.collection().getTotalPages()}
						<button onClick={this.handle_next}>Next</button>
					</div>
					<ul>
						{this.collection().map(function(official) {
							return <components.FamilyBox key={official.id} model={official} onDelete={that.handle_delete_official} official_hound={that.props.official_hound} />;
						})}
					</ul>
				</div>
			);
		},

		handle_all: function() {
			this.setState({letter: null});
			this.collection().page(0, this.get_data(null));
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

		handle_delete_official: function() {
			this.collection().fetch();
		},
	});
})();