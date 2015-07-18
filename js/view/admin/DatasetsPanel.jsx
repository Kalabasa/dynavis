"use strict";
define(["react", "InstanceCache", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/main/DatasetBox", "mixin/ScrollToTopMixin", "react.backbone"], function(React, InstanceCache, SearchControls, PageControls, DatasetBox, ScrollToTopMixin) {
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			if(!this.collection().username) {
				var generate_button = <button className="button" onClick={this.generate_indicator}>Generate indicator</button>;
			}
			return (
				<div className="body-panel">
					<SearchControls collection={this.collection()} />
					{generate_button}
					<div>
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		generate_indicator: function() {
			return;
			var that = this;

			var token = InstanceCache.get("Token", "session");
			var user = token ? token.get_user() : null;
			if(!user) return;

			var props = {
				username: user.get("username"),
				indicator: "DYNSHA",
				description: "Proportion of dynastic officials. Generated on " + new Date(),
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