"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/OfficialRow", "mixin/ScrollToTopMixin", "react.backbone"], function(React, SearchControls, PageControls, OfficialRow, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					{this.collection().size() ?
					<div>
						<SearchControls className="mar" collection={this.collection()} />
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(official) {
								return <OfficialRow key={official.cid} model={official} />;
							})}
						</ReactCSSTransitionGroup>
						<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
					</div>
					:
					<div className="text-center">
						<h1 className="transparent">No Data</h1>
						<a href="#elections" className="text text-center">Add election records first</a>
					</div>
					}
				</div>
			);
		},
	});
});