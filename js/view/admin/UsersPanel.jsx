"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/UserRow", "mixin/ScrollToTopMixin", "react.backbone"], function(React, SearchControls, PageControls, UserRow, ScrollToTopMixin) {
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			return (
				<div className="body-panel">
					<SearchControls className="mar" collection={this.collection()} />
					<div>
						{this.collection().map(function(user) {
							return <UserRow key={user.cid} model={user} />;
						})}
					</div>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},
	});
});