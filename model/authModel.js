/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var dbHandler = require('../lib/databaseHandler').dbHandler;
var constants = require('../lib/constants');

exports.registerUser = function (handlerInfo, data, callback) {
    var sql = 'INSERT INTO users SET ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, data, function (err, insert) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

exports.getUser = function (handlerInfo, userId, callback) {
    var sql = 'SELECT * FROM users WHERE ' +
        'id = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [userId], function (err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user[0]);
    });
};

exports.checkIfUsernameAlreadyExists = function (handlerInfo, username, callback) {
    var sql = 'SELECT username FROM users WHERE ' +
        'username = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [username], function (err, user) {
        if (err) {
            return callback(new Error("Error in fetching data"));
        }

        if (user.length) {
            err = new Error();
            err.flag = constants.responseFlags.USERNAME_ALREADY_EXISTS;
            return callback(err);
        }
        callback();
    });
};

exports.getUserByUsername = function (handlerInfo, username, callback) {
    var sql = 'SELECT * FROM users WHERE ' +
        'username = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [username], function (err, user) {
        if (err) {
            return callback(err);
        }

        if (!user.length) {
            err = new Error("No user found.");
            err.flag = constants.responseFlags.USER_NOT_FOUND;
            return callback(err);
        }
        callback(null, user[0]);
    });
};

exports.createSession = function (handlerInfo, userId, sessionId, callback) {
    var sql = 'UPDATE users SET ' +
        'auth_token = ? ' +
        'WHERE id = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [sessionId, userId], function (err, insert) {
        if (err) {
            return callback(err);
        }
        callback(null, sessionId);
    });
};

exports.checkIfUserExists = function (handlerInfo, uuid, callback) {
    var sql = 'SELECT * FROM users WHERE ' +
        'uuid = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [uuid], function (err, user) {
        if (err) {
            return callback(err);
        }

        if (!user.length) {
            err = new Error("No user found.");
            err.flag = constants.responseFlags.USER_NOT_FOUND;
            return callback(err);
        }
        callback();
    });
};