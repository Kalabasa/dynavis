"use strict";
define(["react", "jsx!view/TypeaheadInput", "jsx!view/admin/FamilyMemberItem", "react.backbone"], function(React, TypeaheadInput, FamilyMemberItem) {
	return React.createBackboneClass({
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
							return <FamilyMemberItem key={official.id} model={official} onDelete={that.props.onDelete} />;
						})}
					</ul>
					<form onSubmit={this.handle_submit}>
						<TypeaheadInput
							for="Official"
							ref="input"
							display={display}
							collection={this.collection()}
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
});