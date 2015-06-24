"use strict";
var components = components || {};
(function(){
	components.FamiliesPanel = React.createBackboneClass({
		getInitialState: function() {
			return {
				official_hound: new Bloodhound({
					queryTokenizer: Bloodhound.tokenizers.whitespace,
					datumTokenizer: Bloodhound.tokenizers.whitespace,
					remote: {
						url: "api.php/officials?q=%QUERY",
						wildcard: "%QUERY",
						transform: function(data) {
							return data.data;
						},
					},
				})
			};
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h1>Families</h1>
					<ul>
						{this.collection().map(function(official) {
							return <components.FamilyBox key={official.id} model={official} official_hound={that.state.official_hound} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();