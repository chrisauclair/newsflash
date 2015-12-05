// load dependencies
var _ = require('lodash');
var Promise = require('node-promise').Promise;

module.exports = (function() {

    var splitWords = function(content) {
        return _.words(content);
    }

    // https://stackoverflow.com/questions/12588618/javascript-n-dimensional-array-creation
    var createNDimArray = function(dimensions) {
        var t, i = 0, s = dimensions[0], arr = new Array(s);
        if ( dimensions.length < 3 ) for ( t = dimensions[1] ; i < s ; ) arr[i++] = new Array(t);
        else for ( t = dimensions.slice(1) ; i < s ; ) arr[i++] = createNDimArray(t);
        return arr;
    }

    function createPromises(num) {
        var promises = [];
        for (var i = 0; i < num; i++) {
            var promise = new Promise();
            promises.push(promise);
        }

        return promises;
    }

    return {
        splitWords: splitWords,
        createNDimArray: createNDimArray,
        createPromises: createPromises
    }
})();
