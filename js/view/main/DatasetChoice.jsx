"use strict";
define(function(require) {
	var React = require("react", "react.backbone");

	return React.createBackboneClass({
		render: function() {
			var username = this.model().get("username");
			return (
				<div className={"pure-g dataset-chooser-item" + (this.props.selected ? " selected" : "")} onClick={this.props.onClick}>
					<div className="pure-u-1">
						<div className="field text-large mar">{this.model().get("name")}</div>
						<div className="mar">
							<div className="field-group">
								<span className="label">Uploaded by</span>
								<span className="field">{username}</span>
							</div>
						</div>
						<div className="field text mar"><pre>{this.model().get("description")}</pre></div>
					</div>
				</div>
			);
		},
	});
});