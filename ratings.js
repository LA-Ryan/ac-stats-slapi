'use strict';

const helpers = require("helpers");
const request = require("request");
const cheerio = require("cheerio");

module.exports.run = (event, context, callback) => {

    request(helpers.baseurl + "/ratings.php", function(error, response, html) {
      var $ = cheerio.load(html);
      var template = ["rank", "name", "rating"];
      var tbl = $(".col-lg-7 tbody tr")
        .get()
        .reduce(
          function(data, row) {
            var rowData = $(row)
              .find("td")
              .get()
              .reduce(function(item, cell, index) {
                if ($(cell).has("a").length == 1) {
                  item[template[index]] = $(cell)
                    .find("a")
                    .html();
                } else {
                  item[template[index]] = $(cell).text();
                }
                return item;
              }, {});
            data.players.push(rowData);
            return data;
          },
          { players: [] }
        );
        callback(null, helpers.formatResponse(tbl));
    });
};
