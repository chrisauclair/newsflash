// load dependencies
var _ = require('lodash');

module.exports = (function() {

    var splitWords = function(content) {
        return _.words(content);
    }

    return {
        splitWords: splitWords
    }
})();
