'use strict';

const baseurl = "http://cta.critical-hq.net";
const request = require("request");
const cheerio = require("cheerio");
const moment = require("moment");

module.exports.baseurl = baseurl;

module.exports.getIndexPage = (callback) => {
    request(baseurl, function(error, response, html) {
        var $ = cheerio.load(html);
        callback && callback($);
    });
}

/**
 * Get the player statstics.
 * @param {string} player Player name.
 * @param {function} callback Callback for caller.
 * @param {moment} date How far to go back.
 */
module.exports.getPlayerGames = (player, cb, date) => {
    request(baseurl + '/player.php?playerName=' + player, function (error, response, html) {
        var $ = cheerio.load(html)

        // Check for player not found.
        if($('.message.errormsg p').text()){
            cb({error: "Player not found."});
        }

        var currDate = moment();
        var stats = {};
        var maps = {};
        var gamesCount = 0;
        var games = [];
        $('.gamelog tbody tr').each((i, elem) => {
            if(currDate.isBefore(date)) return false;
            gamesCount++;
            var currCols = $(elem).find('td').get();
            var colDate = $(currCols).eq(1).text();
            var map = $(currCols).eq(2).text();
            maps = addOrIncrement(maps, map);
            var kills = $(currCols).eq(3).text();
            stats = addOrIncrement(stats, 'kills', parseInt(kills));
            var deaths = $(currCols).eq(4).text();
            stats = addOrIncrement(stats, 'deaths', parseInt(deaths));
            var dr = $(currCols).eq(5).text();
            stats = addOrIncrement(stats, 'dr', parseFloat(dr));
            var kd = $(currCols).eq(6).text();
            stats = addOrIncrement(stats, 'kd', parseFloat(kd));
            var winLose = $(currCols).eq(8).text();
            winLose.includes('Won') ? addOrIncrement(stats, 'won') : addOrIncrement(stats, 'lost');
            currDate = moment(colDate, 'MM.DD.YYYY');
            games.push({
                date: colDate,
                map: map,
                kills: kill,
                deaths: deaths,
                dr: dr,
                kd: kd,
                winLose: winLose
            });
        });
        stats.kills /= gamesCount;
        stats.deaths /= gamesCount;
        stats.dr /= gamesCount;
        stats.kd /= gamesCount;
        cb({stats: stats, maps: maps, played: gamesCount, games: games});
    });
}

/**
 * Fetch the games from the endpoint
 * @param {*} cb 
 */
module.exports.getGamesList = (cb) => {
    return request(baseurl + '/json/json_data_combo3.php', function (error, response, html) {
        var resjson = JSON.parse(html.substr(1, html.length-3));
        var data = resjson.aaData.reduce((items, item) => {
            items.items.push({
                id: item[0], 
                date: item[1],
                map: item[2],
                type: item[3],
                host: item[4]
            });
            return items;
        }, {items: []})
        cb && cb(data)
    });
}

/**
 * Slice up the games based on the timeframe.
 * @param {*} date 
 * @param {*} data 
 */
module.exports.getGamesAfterDate = (date, data) => {
    var index = data.items.length - 1;
    var currDate = moment(data.items[index].date);
    while (currDate.isAfter(date)) {
        index--;
        var currDate = moment(data.items[index].date);
    }
    return data.items.slice(index, data.items.length-1);
}

module.exports.validatePeriod = (event, defaultPeriod) => {
    // validate period param
    let period;
    if(
        event.queryStringParameters === null ||
        'period' in event.queryStringParameters === false
    ) {
        period = defaultPeriod;
    }
    else { 
        if (Number.isNaN(Number.parseInt(event.queryStringParameters.period))) {
            return {
                error: true, 
                errors: {
                    statusCode: 200,
                    body: JSON.stringify({ error: "period must be a number." }),
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
                    }
                }
            }
        }
        period = event.queryStringParameters.period; 
    }

    return period;
}

module.exports.formatResponse = (data) => {
    return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
        }
    }
}

/**
 * Add or increment a value in an object.
 * @param {*} obj 
 * @param {*} key 
 * @param {*} value 
 */
function addOrIncrement(obj, key, value = 1) {
    if (obj.hasOwnProperty(key)) {
        obj[key]+=value;
    } else {
        obj[key] = value;
    }
    return obj;
}