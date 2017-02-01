/**
 * Provides a closing dialog with inputs for comment, topic and tags for a given room.
 */
class ClosingDialog {
	/**
	 * @param room the room to get the values from
	 * @param properties (optional) SweetAlert options
	 */
	constructor(room, properties) {
		this.room = room;
		this.properties = _.isObject(properties) ? properties : {};
	}

	/**
	 * @return Promise (keep in mind that native es6-promises aren't cancelable. So always provide a then & catch)
	 */
	display() {
		var self = this;
		return new Promise(function (resolve, reject) {
			swal.withForm(_.extend({
				title: t('Closing_chat'),
				text: '',
				formFields: [{
					id: 'comment',
					value: self.room.comment,
					type: 'input',
					label: t("comment"),
					placeholder: t('Please_add_a_comment')
				}, {
					id: 'topic',
					value: self.room.topic,
					type: 'input',
					placeholder: t('Please_add_a_topic')
				}, {
					id: 'tags',
					value: self.room.tags ? self.room.tags.join(", ") : "",
					type: 'input',
					placeholder: t('Please_add_a_tag')
				}, {
					id: 'knowledgeProviderUsage',
					type: 'select',
					options: [
						{value: 'Unknown', text: t("knowledge_provider_usage_unknown")},
						{value: 'Perfect', text: t("knowledge_provider_usage_perfect")},
						{value: 'Helpful', text: t("knowledge_provider_usage_helpful")},
						{value: 'NotUsed', text: t("knowledge_provider_usage_not_used")},
						{value: 'Useless', text: t("knowledge_provider_usage_useless")}
					]
				}],
				showCancelButton: true,
				closeOnConfirm: false
			}, self.properties), function (isConfirm) {
				if (!isConfirm) { //on cancel
					$('.swal-form').remove(); //possible bug? why I have to do this manually
					reject();
					return false;
				}
				let form = this.swalForm;
				for (let key in form) {
					if (!form.hasOwnProperty(key)) {
						continue;
					}
					if (!form[key] && key !== 'comment') { //comment is not mandatory
						swal.showInputError(t('Please_add_a_' + key + '_to_close_the_room'));
						$('.sa-input-error').hide(); //hide an unwanted marker
						return false;
					}
				}
				resolve(form);
			});
		}).then((r) => {
				$('.sa-input-error').show();
				return r;
			}).catch((reason) => {
				throw reason
			});
	}
}

_dbs.ClosingDialog = ClosingDialog;
