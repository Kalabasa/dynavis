"use strict";
var components = components || {};
(function(){
	components.OfficialsPanel = React.createBackboneClass({
		getInitialState: function() {
			return {
				family_hound: new Bloodhound({
					queryTokenizer: Bloodhound.tokenizers.whitespace,
					datumTokenizer: Bloodhound.tokenizers.whitespace,
					remote: {
						url: "api.php/families?q=%QUERY",
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
					<h1>Officials</h1>
					<ul>
						{this.collection().map(function(official) {
							return <components.OfficialRow key={official.id} model={official} family_hound={that.state.family_hound} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();