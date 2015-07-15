"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/main/DatasetBox", "react.backbone"], function(React, SearchControls, DatasetBox) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Datasets</h1>
					<SearchControls collection={this.collection()} />
					<button className="btn btn-default" onClick={this.generate_indicator}>Generate indicator</button>
					<ul>
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</ul>
				</div>
			);
		},

		generate_indicator: function() {
			var that = this;

			var props = {
				username: this.props.token.get_user().get("username"),
				indicator: "DYNSHA",
				description: "Proportion of dynastic officials. Generated on " + new Date(),
			};

			$.ajax({
				method: "POST",
				url: "api.php/generate-indicator",
				data: JSON.stringify(props),
				processData: false,
				dataType: "json",
				success: function(data) {
					that.collection().fetch();
				},
			});
		},
	});
});