"use strict";
var components = components || {};
(function(){
	components.OfficialRow = React.createBackboneClass({
		render: function() {
			var official_families = this.model().families();
			official_families.fetch();
			return (
				<li>
					{this.model().get("surname")}, {this.model().get("name")}.
					<components.OfficialFamilyList collection={official_families} families={this.props.families}/>
				</li>
			);
		},
	});
})();