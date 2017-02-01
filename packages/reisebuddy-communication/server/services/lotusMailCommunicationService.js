/**
 * Encapsulates communication to smsGateway and LotusNotes
 * Should not be used as singleton for verifyAuthentification. (Update of user settings). Don't make the methods static
 * @author jakobpannier
 */
class LotusMailCommunicationService {

	constructor() {
		this.defaultSubject = RocketChat.settings.get('SMS_Out_Reisebuddy_defaultSubject');

		this.lotusEndpoint = RocketChat.settings.get('SMS_Out_Reisebuddy_lotusEndpoint');
		this.outgoingAuthHeader = 'Basic ' + new Buffer(RocketChat.settings.get('SMS_Out_Reisebuddy_username') + ':' +
														RocketChat.settings.get('SMS_Out_Reisebuddy_password')).toString('base64');
		this.baseAddress = RocketChat.settings.get('SMS_Out_Reisebuddy_baseAddress');

		this.basicHeader = 'Basic ' + new Buffer(RocketChat.settings.get('Mail_In_Reisebuddy_username') + ':' +
												 RocketChat.settings.get('Mail_In_Reisebuddy_password')).toString('base64');
		this.isSendEnabled = RocketChat.settings.get('SMS_Out_Reisebuddy_enabled');
	}

	static SERVICE_NAME() {
		return 'lotusMail';
	}

	getServiceName() {
		return LotusMailCommunicationService.SERVICE_NAME();
	}

	/**
	 * @param mailAddr email
	 * @return {string} value "(sms-)mail" if it is a regular mail or an sms
	 */
	getRoomType(mailAddr) {
		return mailAddr && mailAddr.endsWith("sms.db.de") ? 'sms-mail' : 'mail';
	}

	/**
	 * @param authHeader "Basic abc..."
	 * @return Boolean if ok
	 */
	verifyAuthentification(authHeader) {
		return authHeader === this.basicHeader;
	}

	/**
	 * Converts and verifies payload to message stub
	 * @return {{from: {}, body: string}}
	 * @throws Match.Error id
	 */
	parse({sender, body, subject} = {}) {
		check(sender, String);
		check(body, String);

		let returnBody = this.handleEncodings(body);
		if (!subject.startsWith('SMS an Zielnummer')) { //diiop: the sms may be in the subject => concat subject and body; smtp: subject contains the fixed string
			returnBody = _.filter([this.handleEncodings(subject), returnBody], (e) => !!e).join(': '); // filter with boolean existence check
		}

		return {
			from: sender,
			body: returnBody.trim()
		};
	}

	/**
	 * We may get an hexstring for ucs2 sms => try to find and resolve this problem.
	 * @param str value to handle. may be null
	 * @return {string} the parsed hex or str if it doesn't look like a hexstring
	 */
	handleEncodings(str) {
		const trimString = str.replace(/\s/g, "");// there are some mysterious whitespaces in hex strings
		//return trimString;
		const result =/^([0-9A-Fa-f]{4})+$/.test(trimString) ? this.parseHexString(trimString) : str; // regex: exactly multiple 4byte hex
		return result
	}

	/**
	 * Decodes hex string
	 * @param str utf16le hex string like: D83DDE0400200044
	 * @return {string} the resulting utf16le string
	 */
	parseHexString(str) {
		var result = '';

		if ((str.length == 16) && (/^\d+$/.test(str))){
			return str;
		}
		else {
			while (str.length >= 4) {

				var firstFourDigist = str.substring(0,4);

				var stub = parseInt(firstFourDigist, 16);
				var converted = String.fromCharCode(stub);

				// get space
				if (converted == ' '){
					result += converted;
					str = str.substr(4, str.length);
				}

				else if(/^[a-zA-Z0-9]*$/.test(converted)){
					result += converted;
					str = str.substr(4, str.length);
				}
				else if(/^[\u4e00-\u9faf]+$/.test(converted)) {
					result += firstFourDigist;
					str = str.substr(4, str.length);
				}
				else {
					var stub = parseInt(firstFourDigist, 16);
					result += String.fromCharCode(stub);
					str = str.substr(4, str.length);
				}

			}
			return result;
		}
	}

	/**
	 * Merge the request infos into a the user to be created.
	 * @param stub userStub
	 * @param requestBody JSON
	 * @return {*} stub
	 */
	extendNewUser(stub, requestBody) {
		if (requestBody.sender.search('@') != -1) {
			stub.email = requestBody.sender; //assumption: eMail-address contains an @ - no matter which format
		} else {
			stub.phone = {number: requestBody.sender}; //no @ => most probably was a phone address
		}
		return stub;
	}

	/**
	 * Sends a mail to the given parameters asynchronously. Log on error.
	 * @param to
	 * @param message
	 * @param subject optional - default: Mail_Reisebuddy_defaultSubject
	 * @throws Match.Error if params are invalid
	 */
	send({to, message, subject} = {}) {
		if (!this.isSendEnabled) {
			SystemLogger.warn("SMS output is disabled!");
			return;
		}
		check(arguments[0], {
			to: String,
			message: String,
			subject: Match.Optional(String)
		});
		const self = this;
		const REGEX_MAIL = /^\+?\d+@sms.db.de$/;
		const REGEX_PHONE = /^\+?\d+/;

		//"to" may contain a phone number as well as an email-address.
		// => determine which one it actually is and extract the actual number if necessary

		if (to.match(REGEX_MAIL)) {
			to = to.replace('@sms.db.de', '');
		}

		if (to.match(REGEX_PHONE)) {
			SystemLogger.debug("send sms to " + to);

			let effectiveSubject = subject || self.defaultSubject;
			if (!effectiveSubject.trim()) { // no default subject => we need a subject in order to get the message sent from Notes
				effectiveSubject = message;
				message = '';
			}

			let requestBody = {
				to: to.replace(/^\+/, '00').replace(/\s/, '') + self.baseAddress,
				subject: effectiveSubject,
				body: message || ''
			};

			let options = {
				"headers": {
					"Authorization": self.outgoingAuthHeader,
					"Content-Type": "application/json"
				},
				npmRequestOptions: { //todo find out why we get a SELF_SIGNED_CERT_IN_CHAIN Error - cert should be correct
					rejectUnauthorized: false
				},
				"data": requestBody
			};

			HTTP.post(self.lotusEndpoint, options, (error, result) => {
					if (error) {
						SystemLogger.error("unable to send mail to " + to + " -- " + error);
					} else if (result) {
						SystemLogger.debug("mail successfully send to " + to, " with result: \n" + JSON.stringify(result));
					}
				});
		} else {
			SystemLogger.error("unable to send mail to " + to + " --  Couldn't extract phone number.");
		}
	}
}

/**
 * ServiceProvider for reisebuddyCommunicationApis
 * @param serviceName
 * @return {*}
 */
_dbs.getCommunicationService = function (serviceName) {
	switch (serviceName) {
	case LotusMailCommunicationService.SERVICE_NAME():
		return new LotusMailCommunicationService();
	}
	return null;
};
