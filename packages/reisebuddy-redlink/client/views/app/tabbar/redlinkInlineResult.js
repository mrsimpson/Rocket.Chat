Template.redlinkInlineResult._copyReplySuggestion = function(event, instance)
{
	if (instance.data.result.replySuggestion) {
		const inputBox = $('#chat-window-' + instance.data.roomId + ' .input-message');
		const initialInputBoxValue = inputBox.val() ? inputBox.val() + ' ' : '';
		inputBox.val(initialInputBoxValue + instance.data.result.replySuggestion).focus().trigger('keyup');
	}
};

Template.redlinkInlineResult.helpers({
	templateName(){
		const instance = Template.instance();

		let templateSuffix = "generic";
		switch (instance.data.result.creator) {
			case 'bahn.de':
				templateSuffix = "bahn_de";
				break;
			case 'community.bahn.de':
				templateSuffix = "VKL_community";
				break;
			case 'VKL':
				templateSuffix = "VKL_community";
				break;
			default:
				templateSuffix = "generic";
				break;
		}
		return 'redlinkInlineResult_' + templateSuffix;
	},
	templateData(){
		const instance = Template.instance();
		return {
			result: instance.data.result,
			roomId: instance.data.roomId
		}
	}
});

Template.redlinkInlineResult.events({
	'click .js-copy-reply-suggestion': function (event, instance) {
		return Template.redlinkInlineResult._copyReplySuggestion(event, instance)
	}
});

//----------------------------------- Generic helper as fallback ------------------------------

Template.redlinkInlineResult_generic.helpers({
	relevantKeyValues(){
		const instance = Template.instance();

		let keyValuePairs = [];
		for (key in instance.data.result) {
			keyValuePairs.push({key: key, value: instance.data.result[key]});
		}

		return keyValuePairs;
	}
});

//------------------------------------- Bahn.de -----------------------------------------------

Template.redlinkInlineResult_bahn_de.events({
	'click .js-copy-reply-suggestion': function(event, instance){
		return Template.redlinkInlineResult._copyReplySuggestion(event, instance)
	}
});

Template.redlinkInlineResult_bahn_de.helpers({
	durationformat(val){
		return new _dbs.Duration(val * 60*1000).toHHMMSS();
	}
});

//----------------------------------- VKL and community ---------------------------------------
Template.redlinkInlineResult_VKL_community.helpers({
	classExpanded(){
		const instance = Template.instance();
		return instance.state.get('expanded') ? 'expanded' : 'collapsed';
	}
});

Template.redlinkInlineResult_VKL_community.events({
	'click .result-item-wrapper .js-toggle-result-preview-expanded': function (event, instance) {
		const current = instance.state.get('expanded');
		instance.state.set('expanded', !current);
	},
});

Template.redlinkInlineResult_VKL_community.onCreated(function () {
	const instance = this;

	this.state = new ReactiveDict();
	this.state.setDefault({
		expanded: false
	});
});


