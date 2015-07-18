"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/OfficialRow", "mixin/ScrollToTopMixin", "react.backbone"], function(React, SearchControls, PageControls, OfficialRow, ScrollToTopMixin) {
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<SearchControls ref="searcher" collection={this.collection()} />
					<div>
						{this.collection().map(function(official) {
							return <OfficialRow key={official.cid} model={official} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},
	});
});