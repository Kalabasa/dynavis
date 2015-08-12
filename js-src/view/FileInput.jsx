"use strict";
define(["react"], function(React) {
	return React.createClass({
		getInitialState: function() {
			return {
				filename: null
			};
		},

		render: function() {
			return (
				<span className="file-wrapper">
					<label className="group">
						<span className="group-component input" title={this.state.filename} readOnly>
							<div className="name">{this.state.filename}</div>
						</span>
						<span className="group-component button">Browse</span>
						<input ref="file" type="file" onChange={this.handle_change} {...this.props} />
					</label>
				</span>
			);
		},

		handle_change: function() {
			var filename = React.findDOMNode(this.refs.file).value.replace("C:\\fakepath\\","");
			this.setState({filename: filename});
		},

		get_input: function() {
			return React.findDOMNode(this.refs.file);
		},
	});
});