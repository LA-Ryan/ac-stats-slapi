'use strict';

const helpers = require('helpers');

module.exports.run = (event, context, callback) => {
    helpers.getIndexPage($ => {
        var averagePlayers = $('.home-table tbody tr').get().reduce((ret, row, index) => {
            var num = parseInt($(row).children().eq(3).text());
            if(!isNaN(num)) {
                ret.average.total_games++;
                ret.average.total_players += num;
            }
            return ret;
        }, {average: {total_players: 0, total_games: 0}});
        averagePlayers.average.average_players = averagePlayers.average.total_players / averagePlayers.average.total_games;
        callback(null, helpers.formatResponse(averagePlayers));
    });
}