"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		render: function() {
			if(this.model()) {
				if(this.model().has("surname"))
					var surname = <span className="surname">{this.model().get("surname") + ", "}</span>;
				if(this.model().has("name"))
					var name = <span className="name">{this.model().get("name")}</span>;
				if(this.model().has("nickname"))
					var nickname = <span className="nickname">{' "' + this.model().get("nickname") + '"'}</span>;
			}
			return (
				<span className={this.props.className}>{surname}{name}{nickname}</span>
			);
		},
	});
});