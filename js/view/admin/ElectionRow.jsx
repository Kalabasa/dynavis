"use strict";
var components = components || {};
(function(){
	components.ElectionRow = React.createBackboneClass({
		render: function() {
			var official_id = this.model().get("official_id");
			var area_code = this.model().get("area_code");
			var party_id = this.model().get("party_id");

			return (
				<li>
					<h2>{official_id}</h2>
					<div>{this.model().get("position")}</div>
					<div>{this.model().get("year")} - {this.model().get("year_end")}</div>
					<div>{this.model().get("votes")}</div>
					<div>{area_code}</div>
					<div>{party_id}</div>
				</li>
			);
		},
	});
})();