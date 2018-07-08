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
        var games = helpers.getGamesAfterDate(moment().subtract(period, 'days'), data);
        var toRet = games.reduce((data, val) => {
            var name = val.host;
            var nameObject = data.refs.find(item => item.name === name);
            if (nameObject) {
                nameObject.value++;
            } else {
                data.refs.push({name: name, value: 1});
            }
            return data;
        }, {refs: []});
        callback(null, helpers.formatResponse(toRet));
    });

}