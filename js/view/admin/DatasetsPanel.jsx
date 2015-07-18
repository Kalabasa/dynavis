"use strict";
define(["react", "InstanceCache", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/main/DatasetBox", "mixin/ScrollToTopMixin", "react.backbone"], function(React, InstanceCache, SearchControls, PageControls, DatasetBox, ScrollToTopMixin) {
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			if(!this.collection().username) {
				var generate_buttons = [
					(<button className="button" onClick={this.indicator_generator.bind(this, "DYNSHA")}>Generate DYNSHA</button>),
					(<button className="button" onClick={this.indicator_generator.bind(this, "DYNLAR")}>Generate DYNLAR</button>),
					(<button className="button" onClick={this.indicator_generator.bind(this, "DYNHERF")}>Generate DYNHERF</button>),
				];
			}
			return (
				<div className="body-panel">
					<SearchControls collection={this.collection()} />
					{generate_buttons}
					<div>
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		indicator_generator: function(indicator) {
			var that = this;

			var descriptions = {
				"DYNSHA": "Proportion of dynastic officials in each local government unit.",
				"DYNLAR": "Proprtion of the dynasty with the largest proportion of dynastic officials in each local government unit.",
				"DYNHERF": "Herfindal index on dynasties in each local government unit.",
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
					that.collection().fetch();
				},
			});
		},
	});
});