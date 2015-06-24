"use strict";
var components = components || {};
(function(){
	components.OfficialRow = React.createBackboneClass({
		render: function() {
			var official_families = this.model().families();
			official_families.fetch();
			return (
				<li>
					<components.OfficialName model={this.model()} />
					<components.OfficialFamilyList collection={official_families} family_hound={this.props.family_hound} />
				</li>
			);
		},
	});
})();