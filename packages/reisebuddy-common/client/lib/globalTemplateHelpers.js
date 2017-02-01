Template.registerHelper('and', (a, b)=> a && b);
Template.registerHelper('or', (a, b)=> a || b);

/**
 * Allows to access reactive dict components in Blaze-templates: {{instance.state.get "foo"}}
 */
Template.registerHelper('instance', ()=> Template.instance());

Template.registerHelper('arrayLength', (array) => array.length);

Template.registerHelper('add', (a, b) => a + b);

Template.registerHelper('text', (i18n_alias) => t(i18n_alias));

Template.registerHelper('isReisebuddy', () => !!RocketChat.settings.get('Reisebuddy_active'));

Template.registerHelper('formatDateMilliseconds', (val) => new _dbs.Duration(val).toHHMMSS());

Template.registerHelper('templateExists', (val) => !!Template[val]);

Template.registerHelper('floatToFixed', (size, val) => val ? val.toFixed(size) : '');

Template.registerHelper('nl2br', function(text) {
	var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
	return new Spacebars.SafeString(nl2br);
});
