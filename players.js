'use strict';

const helpers = require("helpers");

module.exports.run = (event, context, callback) => {
    helpers.getIndexPage($ => {
        var namesSelect = $("select").get()[0];
        var names = $(namesSelect)
            .find("option")
            .get()
            .filter(item => $(item).text() !== "")
            .map(item => $(item).text());
        callback(null, helpers.formatResponse(names));
    });
};