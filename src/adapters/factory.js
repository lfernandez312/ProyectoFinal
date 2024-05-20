const { environment } = require("../config/app.config");
const SmsAdapter = require('../adapters/sms.adapter');
const MailAdapter = require('../adapters/mail.adapter');

class MessageFactory {
  constructor() {
    const trimmedEnvironment = environment.trim();

    switch (trimmedEnvironment) {
      case 'prod':
        this.messageManager = new MailAdapter();
        break;

      case 'dev':
        this.messageManager = new SmsAdapter();
        break;

      default:
        break;
    }
  }

  getMessageManager() {
    return this.messageManager;
  }
}

module.exports = MessageFactory;
