/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var mysql   = require('mysql');
var config  = require('config');

var dbPoolConfig = {
    host: config.get('dbPoolSettings.host'),
    user: config.get('dbPoolSettings.user'),
    password: config.get('dbPoolSettings.password'),
    database: config.get('dbPoolSettings.database'),
    connectionLimit: config.get('dbPoolSettings.connectionLimit')
};

var numConnectionsInPool = 0;

function initializePool(dbPoolConfig) {
    console.log('CALLING INITIALIZE POOL');
    console.log('');
    var dbConnectionsPool = mysql.createPool(dbPoolConfig);

    dbConnectionsPool.on('connection', function (connection) {
        numConnectionsInPool++;
        console.log('NUMBER OF CONNECTION IN POOL : ' + numConnectionsInPool);
    });
    return dbConnectionsPool;
}

var dbConnectionsPool = initializePool(dbPoolConfig);

var dbClient = {
    executeQuery: function (sql, values, callback) {

        var queryObject = {};
        if (typeof sql === 'object') {
            // query(options, cb)
            queryObject = sql;
            if (typeof values === 'function') {
                queryObject.callback = values;
            } else if (typeof values !== 'undefined') {
                queryObject.values = values;
            }
        } else if (typeof values === 'function') {
            // query(sql, cb)
            queryObject.sql = sql;
            queryObject.values = undefined;
            queryObject.callback = values;
        } else {
            // query(sql, values, cb)
            queryObject.sql = sql;
            queryObject.values = values;
            queryObject.callback = callback;
        }

        return dbConnectionsPool.query(queryObject.sql, queryObject.values, function (err, result) {
            if (err) {
                if (err.code === 'ER_LOCK_DEADLOCK' || err.code === 'ER_QUERY_INTERRUPTED') {
                    setTimeout(module.exports.dbHandler.getInstance().executeQuery.bind(null, sql, values, callback), 50);
                }
                else {
                    queryObject.callback(err, result);
                }
            }
            else {
                queryObject.callback(err, result);
            }
        });
    },

    executeTransaction: function (queries, values, callback) {
    },

    escape: function (values) {
        return dbConnectionsPool.escape(values);
    }
};

exports.dbHandler = (function () {

    var handler = null;

    return {
        getInstance: function () {
            if (!handler) {
                handler = dbClient;
            }
            return handler;
        }
    };
})();