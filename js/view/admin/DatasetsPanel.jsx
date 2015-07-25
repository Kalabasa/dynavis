"use strict";
define(["react", "InstanceCache", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/main/DatasetBox", "mixin/ScrollToTopMixin", "react.backbone"], function(React, InstanceCache, SearchControls, PageControls, PanelToolbar, DatasetBox, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			if(!this.collection().username) {
				var toolbar = (
					<PanelToolbar ref="toolbar" toggle_text="Generate Data">
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
					<SearchControls className="mar" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="fade">
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</ReactCSSTransitionGroup>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		indicator_generator: function(indicator) {
			var that = this;

			var descriptions = {
				"DYNSHA": "Proportion of dynastic officials in each local government unit.",
				"DYNLAR": "Proprtion of the dynasty with the largest proportion of dynastic officials in each local government unit.",
				"DYNHERF": "Herfindal index on dynasties in each local government unit.",
				"LocalDynastySize": "Number of members of each dynasty in each local government unit.",
				"RecursiveDynastySize": "Number of members of each dynasty in each local government unit including members in subdivisions.",
			};

			var token = InstanceCache.get("Token", "session");
			var user = token ? token.get_user() : null;
			if(!user) return;

			var props = {
				username: user.get("username"),
				indicator: indicator,
				description: descriptions[indicator] + " Generated on " + new Date(),
			};

			$.ajax({
				method: "POST",
				url: "api.php/generate-indicator",
				data: JSON.stringify(props),
				processData: false,
				dataType: "json",
				success: function(data) {
					that.refs.toolbar.close();
					that.collection().fetch();
				},
			});
		},
	});
});