"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/main/DatasetBox", "react.backbone"], function(React, SearchControls, DatasetBox) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Datasets</h1>
					<SearchControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</ul>
				</div>
			);
		},
	});
});