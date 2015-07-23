"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/FamilyBox", "mixin/ScrollToTopMixin", "react.backbone"], function(React, SearchControls, PageControls, FamilyBox, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<SearchControls className="mar" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="slider">
						{this.collection().map(function(family) {
							return <FamilyBox key={family.cid} model={family} onDeleteMember={that.handle_delete_official} />;
						})}
					</ReactCSSTransitionGroup>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},
		
		handle_delete_official: function() {
			this.collection().fetch();
		},
	});
});