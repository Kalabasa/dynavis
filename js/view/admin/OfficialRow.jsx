"use strict";
var components = components || {};
(function(){
	components.OfficialRow = React.createBackboneClass({
		componentWillMount: function() {
			this.model().get_families().fetch();
		},

		render: function() {
			return (
				<li>
					<components.OfficialName model={this.model()} />
					<button onClick={this.handle_delete}>Delete</button>
					<components.OfficialFamilyList collection={this.model().get_families()} family_hound={this.props.family_hound} />
				</li>
			);
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
})();