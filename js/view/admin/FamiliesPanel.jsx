"use strict";
define(["react", "jsx!view/IndexedPageControls", "jsx!view/admin/FamilyBox", "react.backbone"], function(React, IndexedPageControls, FamilyBox) {
	return React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Families</h1>
					<IndexedPageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(family) {
							return <FamilyBox key={family.id} model={family} onDelete={that.handle_delete_official} />;
						})}
					</ul>
				</div>
			);
		},
		
		handle_delete_official: function() {
			this.collection().fetch();
		},
	});
});