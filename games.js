'use strict';

const helpers = require("helpers");
const moment = require("moment");

module.exports.run = (event, context, callback) => {

    const period = helpers.validatePeriod(event, 7);
    if (period.error) {
        callback(null, period.errors);
        return;
    }

    helpers.getGamesList(data => {
        callback(null, helpers.formatResponse({
            games: helpers.getGamesAfterDate(moment().subtract(period, 'days'), data)
        }))
    });
}