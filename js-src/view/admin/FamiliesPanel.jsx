"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		SearchControls = require("jsx!view/SearchControls"),
		PageControls = require("jsx!view/PageControls"),
		FamilyBox = require("jsx!view/admin/FamilyBox"),
		ScrollToTopMixin = require("mixin/ScrollToTopMixin"),
		Notification = require("jsx!view/Notification"),
		ConfirmationDialog = require("jsx!view/ConfirmationDialog"),
		ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<button className="button button-primary mar" onClick={this.handle_add}>New Family</button>
					{!this.empty_data() ?
					<div className="clearfix">
						<SearchControls ref="searcher" className="mar" collection={this.collection()} />
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(family) {
								return <FamilyBox key={family.cid} model={family} onDeleteMember={that.handle_delete_official} />;
							})}
						</ReactCSSTransitionGroup>
						<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
						<button className="pull-right button button-complement mar" onClick={this.handle_delete_all}>Delete All</button>
					</div>
					:
					<div className="text-center">
						<h1 className="transparent">No Families Yet</h1>
						<p className="text text-center">Add families using the New Family button</p>
					</div>
					}
				</div>
			);
		},

		empty_data: function() {
			return !this.collection().size() && (!this.refs.searcher || this.refs.searcher.state.query === null) && this.collection().getPage() === 0;
		},

		handle_delete_all: function() {
			var that = this;
			ConfirmationDialog.open("Are you sure you want to delete all family data?", [
				{
					display: "Cancel",
					type: "close",
				},
				{
					display: "Delete All",
					type: "secondary",
					callback: function() {
						var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting all families...</span>, 0);
						$.ajax({
							url: that.collection().url,
							method: "POST", // Fake method for compatibility
							headers: { "X-HTTP-Method-Override": "DELETE" },
							success: function(data){
								that.collection().fetch();
								Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;All families deleted</span>, null, "success");
							},
							error: function(xhr) {
								Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Delete error: {xhr.responseText}</span>, null, "error");
							},
						});
					},
				},
			]);
		},

		handle_add: function() {
			var that = this;
			if(!this.collection().size() || this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
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