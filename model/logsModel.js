/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var dbHandler = require('../lib/databaseHandler').dbHandler;
var constants = require('../lib/constants');
var _ = require('lodash');

exports.saveLogDetail = function (handlerInfo, updateData, username, id, inventoryType, changeType, callback) {
    var changes = Object.keys(updateData);

    var data = {
        username: username,
        item_id: id,
        changes: changes.join(','),
        change_type: changeType,
        inventory_type : inventoryType
    };
    var sql = 'INSERT INTO logs_pool SET ?';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, data, function (err, upd) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};
/*
exports.saveLogDetail = function (handlerInfo, updateData, username, id, inventoryType, changeType, callback) {
    var changes = Object.keys(updateData);

    var data = {
        username: username,
        item_id: id,
        changes: changes.join(','),
        change_type: changeType,
        inventory_type : inventoryType
    };
    var sql = 'SELECT * FROM logs_pool ORDER BY id desc LIMIT 1';
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, [], function (err, log) {
        if (err) {
            return callback(err);
        }
        if(!log.length) {
            var sql4 = 'INSERT INTO logs_pool SET ?';
            var sqlQuery4 = dbHandler.getInstance().executeQuery(sql4, data, function (err4, upd4) {
                if (err4) {
                    return callback(err4);
                }
                return callback();
            });
        } else {
            if((log[0].username === username) && (log[0].item_id === id) && (log[0].change_type === changeType)){
                //update changes column
                var temp = log[0].changes.split(',');
                var changeObj = new Set(temp);

                for(var i=0;i<changes.length;i++){
                    changeObj.add(changes[i]);
                }
                var changeStr = Array.from(changeObj).join(',');
                var sql2 = 'UPDATE logs_pool SET changes = ? WHERE id = ?';
                var sqlQuery2 = dbHandler.getInstance().executeQuery(sql2, [changeStr, log[0].id], function (err2, upd2) {
                    if (err2) {
                        return callback(err2);
                    }
                    return callback();
                });
            } else {
                var sql3 = 'INSERT INTO logs_pool SET ?';
                var sqlQuery3 = dbHandler.getInstance().executeQuery(sql3, data, function (err3, upd3) {
                    if (err3) {
                        return callback(err3);
                    }
                    return callback();
                });
            }
        }
    });
};
*/

exports.getLogs = function (handlerInfo, userId, callback) {
    var sql = '';
    var values = [];
    if (userId) {
        sql = 'SELECT i.name, u.username, l.changes, l.change_type, l.inventory_type ' +
            'FROM logs_pool l, items i, users u WHERE ' +
            'u.uuid = ? AND u.username = l.username AND l.item_id = i.uuid ' +
            'order by l.id';
        values.push(userId);
    }
    else {
        sql = 'SELECT i.name, u.username, l.changes, l.change_type, l.inventory_type ' +
            'FROM logs_pool l, items i, users u WHERE ' +
            'u.username = l.username AND l.item_id = i.uuid order by l.id';
    }
    var sqlQuery = dbHandler.getInstance().executeQuery(sql, values, function (err, logs) {
        if (err) {
            return callback(err);
        }
        if (!logs.length) {
            return callback();
        }
        var tempResult = [];
        var result = [];

        var changeObj;
        var itemObj;
        var obj = {};
        var str;
        for (var i = 0; i < logs.length; i++) {
            if(logs[i].change_type == 'DELETED'){
                tempResult.push(logs[i]);
                continue;
            }
            if (logs[i].change_type == 'ADDED') {
                tempResult.push(logs[i]);
                continue;
            }
            if (_.isEmpty(obj)) {
                obj = logs[i];
                var temp = logs[i].changes.split(',');
                changeObj = new Set(temp);
                itemObj = new Set();
                itemObj.add(logs[i].name);
                if(obj.change_type === 'DELETED')
                    continue;
            }
            if (logs[i + 1]) {
                if ((logs[i].username == logs[i + 1].username)) {
                    if(logs[i+1].change_type == 'DELETED'){
                        obj.changeObj = changeObj;
                        obj.itemObj = itemObj;
                        tempResult.push(obj);
                        changeObj = new Set();
                        itemObj = new Set();
                        obj = {};
                        continue;
                    }
                    if (logs[i + 1].change_type == 'ADDED') {
                        obj.changeObj = changeObj;
                        obj.itemObj = itemObj;
                        tempResult.push(obj);
                        changeObj = new Set();
                        itemObj = new Set();
                        obj = {};
                        continue;
                    }
                    var changeTemp = logs[i + 1].changes.split(',');
                    for (var j = 0; j < changeTemp.length; j++) {
                        changeObj.add(changeTemp[j]);
                    }

                    itemObj.add(logs[i+1].name);
                } else {
                    obj.changeObj = changeObj;
                    obj.itemObj = itemObj;
                    tempResult.push(obj);
                    changeObj = new Set();
                    itemObj = new Set();
                    obj = {};
                }
            } else {
                var temp2 = logs[i].changes.split(',');
                for (var k = 0; k < temp2.length; k++) {
                    changeObj.add(temp2[k]);
                }
                itemObj.add(logs[i].name);
                logs[i].changeObj = changeObj;
                logs[i].itemObj = itemObj;
                tempResult.push(logs[i]);
            }
        }

        for(var q=0; q<tempResult.length;q++){
            if(tempResult[q].change_type == 'EDITED') {
                var changes = Array.from(tempResult[q].changeObj).join(', ');
                var items = Array.from(tempResult[q].itemObj).join(', ');
                str = tempResult[q].username + ' ' + tempResult[q].change_type + ' ' + changes + ' of item(s) ' + items;
                str = str.toLowerCase();
                result.push(str);
            }
            else if (tempResult[q].change_type == 'DELETED') {
                str = tempResult[q].username + ' ' + tempResult[q].change_type + ' variant of ' + tempResult[q].name;
                str = str.toLowerCase();
                result.push(str);
            } else {
                str = tempResult[q].username + ' ' + tempResult[q].change_type + ' variant of ' + tempResult[q].name;
                str = str.toLowerCase();
                result.push(str);
            }
        }
        callback(null, result);
    });
};

