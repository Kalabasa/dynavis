"use strict";
var components = components || {};
(function(){
	components.OfficialRow = React.createBackboneClass({
		getInitialState: function() {
			return {official_families: this.model().families()};
		},

		componentWillMount: function() {
			this.state.official_families.fetch();
		},

		componentDidChangeModel: function() {
			this.setState({official_families: this.model().families()});
			this.state.official_families.fetch();
		},
		
		render: function() {
			return (
				<li>
					<components.OfficialName model={this.model()} />
					<button onClick={this.handle_delete}>Delete</button>
					<components.OfficialFamilyList collection={this.state.official_families} family_hound={this.props.family_hound} />
				</li>
			);
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
})();