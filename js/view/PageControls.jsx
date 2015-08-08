"use strict";
define(["react", "react.backbone"], function(React) {
	return React.createBackboneClass({
		getInitialState: function() {
			return {input: 1};
		},

		componentWillMount: function() {
			this.collection().on("sync", this.on_load_page);
		},
		componentDidUnmount: function() {
			this.collection().off("sync", this.on_load_page);
		},

		render: function() {
			var page = this.collection().getPage();
			var pages = this.collection().getTotalPages();
			return (
				<form className={this.props.className} onSubmit={this.handle_submit}>
					<button className="button"
						type="button"
						title="Previous page"
						onClick={this.handle_prev}
						disabled={page <= 0}>
						<i className="fa fa-caret-left"/>
					</button>
					<span className="pad">Page <input className="input" type="text" size="3" value={this.state.input} onChange={this.handle_change} /> of {pages}</span>
					<button className="button"
						type="button"
						title="Next page"
						onClick={this.handle_next}
						disabled={page + 1 >= pages}>
						<i className="fa fa-caret-right"/>
					</button>
					<input className="hidden" type="submit" value="Go to page" />
				</form>
			);
		},

		on_load_page: function() {
			this.setState({input: this.collection().getPage() + 1});
		},

		handle_change: function(e) {
			this.setState({input: e.target.value});
		},

		handle_submit: function(e) {
			e.preventDefault();
			var new_page = parseInt(this.state.input, 10);
			if(isNaN(new_page)) {
				this.setState({input: this.collection().getPage() + 1});
			}else{
				var pages = this.collection().getTotalPages();
				if(new_page < 1) {
					new_page = 1;
					this.setState({input: new_page});
				}else if(new_page > pages){
					new_page = pages;
					this.setState({input: new_page});
				}
				this.collection().page(new_page - 1);
			}
		},

		handle_prev: function() {
			if(this.props.onPrev) {
				this.props.onPrev();
			}
			this.collection().prev({success: this.on_load_page});
		},

		handle_next: function() {
			if(this.props.onNext) {
				this.props.onNext();
			}
			this.collection().next({success: this.on_load_page});
		},
	});
});