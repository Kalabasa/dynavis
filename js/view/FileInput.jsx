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
					<label className="group" for="file">
						<span className="group-component input" readOnly>{this.state.filename}</span>
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