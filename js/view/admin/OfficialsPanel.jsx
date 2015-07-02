"use strict";
define(["react", "model/Official", "jsx!view/IndexedPageControls", "jsx!view/admin/OfficialRow", "react.backbone"], function(React, Official, IndexedPageControls, OfficialRow) {
	return React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Officials</h1>
					<IndexedPageControls collection={this.collection()} />
					<button onClick={this.handle_add}>Add</button>
					<ul>
						{this.collection().map(function(official) {
							return <OfficialRow key={official.id} model={official} />;
						})}
					</ul>
				</div>
			);
		},

		handle_add: function() {
			this.collection().add(new Official(), {at: 0});
		},
	});
});