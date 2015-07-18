"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/FamilyBox", "mixin/ScrollToTopMixin", "react.backbone"], function(React, SearchControls, PageControls, FamilyBox, ScrollToTopMixin) {
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<SearchControls collection={this.collection()} />
					<div>
						{this.collection().map(function(family) {
							return <FamilyBox key={family.cid} model={family} onDeleteMember={that.handle_delete_official} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},
		
		handle_delete_official: function() {
			this.collection().fetch();
		},
	});
});