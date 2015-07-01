"use strict";
var components = components || {};
(function(){
	components.FamilyMemberList = React.createBackboneClass({
		render: function() {
			var that = this;

			var display =  function(item) {
				return item.surname + ", " + item.name;
			};

			return (
				<div>
					<h3>Officials:</h3>
					<ul>
						{this.collection().map(function(official) {
							return <components.FamilyMemberItem key={official.id} model={official} onDelete={that.props.onDelete} />;
						})}
					</ul>
					<form onSubmit={this.handle_submit}>
						<components.TypeaheadInput
							for="official"
							ref="input"
							display={display}
							collection={this.collection()}
							instance_cache={this.props.instance_cache}
							required />
						<input type="submit" value="Add" />
					</form>
				</div>
			);
		},

		handle_submit: function(e) {
			e.preventDefault();
			if(this.refs.input.state.selected) {
				this.collection().post_member(this.refs.input.state.selected);
				this.refs.input.clear();
			}else{
				console.error("None selected.");
			}
		},
	});
})();