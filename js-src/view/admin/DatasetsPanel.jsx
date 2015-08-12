"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		FileInput = require("jsx!view/FileInput"),
		SearchControls = require("jsx!view/SearchControls"),
		PageControls = require("jsx!view/PageControls"),
		PanelToolbar = require("jsx!view/PanelToolbar"),
		DatasetBox = require("jsx!view/admin/DatasetBox"),
		ScrollToTopMixin = require("mixin/ScrollToTopMixin"),
		Notification = require("jsx!view/Notification"),
		ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			if(!this.collection().username) {
				var toolbar = (
					<PanelToolbar ref="toolbar" toggle_text="Generate Dataset">
						<div className="pure-u-1 text-center pad">
							<h6>Generate political dynasty indicators</h6>
							<button className="button"
								key="btn_DYNSHA"
								onClick={this.indicator_generator.bind(this, "DYNSHA")}>
								Generate DYNSHA
							</button>
							<button className="button"
								key="btn_DYNLAR"
								onClick={this.indicator_generator.bind(this, "DYNLAR")}>
								Generate DYNLAR
							</button>
							<button className="button"
								key="btn_DYNHERF"
								onClick={this.indicator_generator.bind(this, "DYNHERF")}>
								Generate DYNHERF
							</button>
							<br />
							<button className="button"
								key="btn_LocalDynastySize"
								onClick={this.indicator_generator.bind(this, "LocalDynastySize")}>
								Generate Local Dynasty Size
							</button>
							<button className="button"
								key="btn_RecursiveDynastySize"
								onClick={this.indicator_generator.bind(this, "RecursiveDynastySize")}>
								Generate Recursive Dynasty Size
							</button>
						</div>
					</PanelToolbar>
				);
			}
			return (
				<div className="body-panel">
					{toolbar}
					{!this.empty_data() ?
					<div>
						<SearchControls ref="searcher" className="mar" collection={this.collection()} />
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(dataset) {
								return <DatasetBox key={dataset.cid} model={dataset} />;
							})}
						</ReactCSSTransitionGroup>
						<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
					</div>
					:
					<div className="text-center">
						<h1 className="transparent">No Datasets Yet</h1>
						<p className="text text-center">User-uploaded datasets go here.</p>
						<p className="text text-center">The system can also generate datasets based on election records and dynasty data.</p>
					</div>
					}
				</div>
			);
		},

		empty_data: function() {
			return !this.collection().size() && (!this.refs.searcher || this.refs.searcher.state.query === null) && this.collection().getPage() === 0;
		},

		indicator_generator: function(indicator) {
			var that = this;

			var descriptions = {
				"DYNSHA": "Proportion of dynastic officials in each local government unit.",
				"DYNLAR": "Proportion of the dynasty with the largest proportion of dynastic officials in each local government unit.",
				"DYNHERF": "Herfindal index on dynasties in each local government unit.",
				"LocalDynastySize": "Number of members of each dynasty in each local government unit.",
				"RecursiveDynastySize": "Number of members of each dynasty in each local government unit including members in subdivisions.",
			};

			var token = InstanceCache.get_existing("Token", "session");
			var user = token ? token.get_user() : null;
			if(!user) return;

			var props = {
				username: user.get("username"),
				indicator: indicator,
				description: descriptions[indicator] + " Generated on " + new Date(),
			};

			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Generating {indicator} variable...</span>, 0);

			$.ajax({
				method: "POST",
				url: "api.php/generate-indicator",
				data: JSON.stringify(props),
				processData: false,
				dataType: "json",
				success: function(data) {
					if(that.refs.toolbar) that.refs.toolbar.close();
					that.collection().fetch();
					Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;{indicator} variable generated</span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Generate error: {xhr.responseText}</span>, null, "error");
				},
			});
		},
	});
});