"use strict";
var components = components || {};
(function(){
	components.OfficialRow = React.createBackboneClass({
		render: function() {
			var official_families = this.model().families();
			official_families.fetch();
			return (
				<li>
					<h2>{this.model().get("surname")}, {this.model().get("name")}.</h2>
					<components.OfficialFamilyList collection={official_families} family_hound={this.props.family_hound} />
				</li>
			);
		},
	});
})();