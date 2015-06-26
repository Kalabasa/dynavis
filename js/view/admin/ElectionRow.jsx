"use strict";
var components = components || {};
(function(){
	components.ElectionRow = React.createBackboneClass({
		render: function() {
			var official_id = this.model().get("official_id");
			var area_code = this.model().get("area_code");
			var party_id = this.model().get("party_id");

			var cache = this.props.instance_cache;
			var official = cache.get("official", official_id);
			var area = cache.get("area", area_code);
			var party = cache.get("party", party_id);

			return (
				<li>
					<components.OfficialName model={official} />
					<div>{this.model().get("position")}</div>
					<div>{this.model().get("year")} - {this.model().get("year_end")}</div>
					<div>{this.model().get("votes")}</div>
					<components.Name model={area} />
					<components.Name model={party} />
					<button onClick={this.handle_delete}>Delete</button>
				</li>
			);
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
})();