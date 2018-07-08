'use strict';

const moment = require("moment");
const helpers = require("./helpers");

module.exports.run = (event, context, callback) => {

    // Validate name query param.
    if(
        event.queryStringParameters === null ||
        'name' in event.queryStringParameters === false
    ) { 
        callback(null,  helpers.formatResponse({ error: "name required." }));
        return;   
    }

    const period = helpers.validatePeriod(event, 7);
    if (period.error) {
        callback(null, period.errors);
        return;
    }

    helpers.getPlayerGames(event.queryStringParameters.name, games => {
        callback(null, helpers.formatResponse(games));
    }, moment().subtract(period, "days"));
};

