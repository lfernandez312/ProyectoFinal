const { environment } = require("../../config/app.config");
const trimmedEnvironment = environment.trim();

switch (trimmedEnvironment) {
    case 'prod':
        module.exports = require('./prodLogger')
        break;

    case 'dev':
        module.exports = require('./devLogger')
        break;

    default:
        break;
}