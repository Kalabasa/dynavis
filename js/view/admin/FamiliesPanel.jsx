"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/FamilyBox", "mixin/ScrollToTopMixin", "react.backbone"], function(React, SearchControls, PageControls, FamilyBox, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<button className="button button-primary mar" onClick={this.handle_add}>New Family</button>
					<SearchControls ref="searcher" className="mar" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="fade">
						{this.collection().map(function(family) {
							return <FamilyBox key={family.cid} model={family} onDeleteMember={that.handle_delete_official} />;
						})}
					</ReactCSSTransitionGroup>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				this.collection().add({}, {at: 0});
			}else{
				this.refs.searcher.set_query(null, {
					complete: function() {
						that.collection().add({}, {at: 0});
					},
				});
			}
		},
		
		handle_delete_official: function() {
			this.collection().fetch();
		},
	});
});