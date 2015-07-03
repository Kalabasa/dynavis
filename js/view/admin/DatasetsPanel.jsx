"use strict";
define(["react", "jsx!view/PageControls", "jsx!view/admin/DatasetBox", "react.backbone"], function(React, PageControls, DatasetBox) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Datasets</h1>
					<PageControls collection={this.collection()} />
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