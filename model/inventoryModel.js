/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var dbHandler = require('../lib/databaseHandler').dbHandler;
var constants = require('../lib/constants');
var _         = require('lodash');

exports.createNewItem = function (handlerInfo, data, callback) {
    var sql = 'INSERT INTO items SET ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, data, function (err, insert) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

exports.getItemList = function (handlerInfo, itemId, callback) {
    var sql = 'SELECT uuid as item_id, name, brand, category FROM items';
    var values = [];
    if(itemId){
        sql+= ' WHERE uuid = ?';
        values.push(itemId);
    }
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, values, function (err, items) {
        if (err) {
            return callback(err);
        }
        callback(null, items);
    });
};

exports.updateItem = function (handlerInfo, data, itemId, callback) {
    var sql = 'UPDATE items SET ? WHERE uuid = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [data, itemId], function (err, update) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

exports.checkIfItemExists = function (handlerInfo, itemId, callback) {
    var sql = 'SELECT * FROM items WHERE ' +
        'uuid = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [itemId], function (err, item) {
        if (err) {
            return callback(new Error("Error in fetching data"));
        }

        if (!item.length) {
            err = new Error();
            err.flag = constants.responseFlags.ITEM_NOT_FOUND;
            return callback(err);
        }
        callback();
    });
};

exports.createNewVariant = function (handlerInfo, data, callback) {
    var sql = 'INSERT INTO variant SET ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, data, function (err, insert) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

exports.updateVariant = function (handlerInfo, data, properties, variantId, callback) {
    var sql = 'UPDATE variant SET ';
    var setter = [];
    var values = [];
    if (!_.isEmpty(properties)) {
        if (!_.isEmpty(data)) {
            for (var dataKey in data) {
                if (data.hasOwnProperty(dataKey)) {
                    setter.push(dataKey + '= ?');
                    values.push(data[dataKey]);
                }
            }
        }
        setter.push('properties = JSON_SET(properties');
        for (var propKey in properties) {
            if (properties.hasOwnProperty(propKey)) {
                setter.push('"$.' + propKey + '", ?');
                values.push(properties[propKey]);
            }
        }
        sql += setter.join(', ');
        sql += ')';
    } else {
        sql += '?';
        values.push(data);
    }

    sql += ' where uuid = ?';
    values.push(variantId);
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, values, function (err, update) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

exports.checkIfVariantExists = function (handlerInfo, variantId, callback) {
    var sql = 'SELECT * FROM variant WHERE ' +
        'uuid = ? AND status = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [variantId, 'ACTIVE'], function (err, item) {
        if (err) {
            return callback(new Error("Error in fetching data"));
        }

        if (!item.length) {
            err = new Error();
            err.flag = constants.responseFlags.VARIANT_NOT_FOUND;
            return callback(err);
        }
        callback();
    });
};

exports.getVariantList = function (handlerInfo, variantId, itemList, callback) {
    var sql = 'SELECT * FROM variant WHERE status = ?';
    var values = ['ACTIVE'];
    if (variantId) {
        sql += ' AND uuid = ?';
        values.push(variantId);
    }
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, values, function (err, variantList) {
        if (err) {
            return callback(err);
        }
        if (!variantList.length) {
            return callback(null, itemList);
        }
        if(typeof itemList !== 'undefined') {
            var interimResult = {};
            for (var i = 0; i < variantList.length; i++) {
                var variant = variantList[i].item_id;
                if (!interimResult[variant]) {
                    interimResult[variant] = [];
                }
                interimResult[variant].push(variantList[i])
            }

            for (var j = 0; j < itemList.length; j++) {
                if (interimResult.hasOwnProperty(itemList[j].item_id)) {
                    itemList[j].variant = interimResult[itemList[j].item_id];
                }
            }
            return callback(null, itemList);
        } else{
            return callback(null, variantList);
        }
    });
};

exports.deleteVariant = function (handlerInfo, variantId, callback) {
    var sql = 'UPDATE variant SET status = ?' +
        'WHERE uuid = ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, ['INACTIVE', variantId], function (err, update) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};