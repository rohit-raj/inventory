/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var router  = require('express').Router();
var uuid    = require('uuid/v4');
var moment  = require('moment');
var bcrypt  = require('bcryptjs');
var async   = require('async');
var xss     = require('xss');
var _       = require('lodash');


var util        = require('../lib/util');
var response    = require('../lib/response');
var __          = require('../model/inventoryModel');
var logs        = require('../model/logsModel');
var constants   = require('../lib/constants');

router.post('/create-item', function (req, res) {
    var handlerInfo = {
        apiModule:  'inventory',
        apiHandler: 'create-item'
    };

    var name        = xss(req.body.name);
    var brand       = xss(req.body.brand);
    var category    = req.body.category;

    var user        = res.locals.userInfo;

    if (util.checkBlank([name, brand, category])) {
        return response.parameterMissing(handlerInfo, res);
    }

    var token = uuid();
    var data = {
        uuid: token,
        name: name,
        brand: brand,
        category: category,
        created_by : user.username
    };

    var tasks = [
        __.createNewItem.bind(null, handlerInfo, data)
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            return response.actionFailed(handlerInfo, res);
        }
        response.actionComplete(handlerInfo, res, {});
    });
});

router.get('/get-items', function (req, res) {
    var handlerInfo = {
        apiModule: 'inventory',
        apiHandler: 'get-items'
    };

    var tasks = [
        __.getItemList.bind(null, handlerInfo, null),
        __.getVariantList.bind(null, handlerInfo, null)
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            return response.actionFailed(handlerInfo, res);
        }
        response.actionComplete(handlerInfo, res, result);
    });
});

router.post('/update-item', function (req, res) {
    var handlerInfo = {
        apiModule: 'inventory',
        apiHandler: 'update-item'
    };

    var body        = req.body;
    var uuid        = req.body.item_id;

    var data = {
        name: xss(body.name),
        brand: xss(body.brand),
        category: xss(body.category)
    };

    var user        = res.locals.userInfo;

    if (util.checkBlank([uuid])) {
        return response.parameterMissing(handlerInfo, res);
    }

    if (util.specialCharacterCheck(uuid)) {
        return response.specialCharacterFound({}, res);
    }

    var updateData = {};
    _.forOwn(body, function (value, key) {
        if (!util.checkBlank([data[key]])) {
            updateData[key] = data[key];
        }
    });
    //updateData.updated_by = user.username;

    var tasks = [
        __.checkIfItemExists.bind(null, handlerInfo, uuid),
        __.updateItem.bind(null, handlerInfo, updateData, uuid),
        logs.saveLogDetail.bind(null, handlerInfo, updateData, user.username, uuid, 'ITEM', 'EDITED')
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            if (error.flag === constants.responseFlags.ITEM_NOT_FOUND) {
                return response.itemNotFound(handlerInfo, res);
            } else {
                return response.actionFailed(handlerInfo, res);
            }
        }
        response.actionComplete(handlerInfo, res, {});
    });

});

router.post('/create-variant', function (req, res) {
    var handlerInfo = {
        apiModule: 'inventory',
        apiHandler: 'create-variant'
    };

    var name         = xss(req.body.name);
    var sellingPrice = xss(req.body.selling_price);
    var costPrice    = req.body.cost_price;
    var quantity     = req.body.quantity;
    var propData     = req.body.properties;

    var itemId       = req.body.item_id;

    var properties = {};
    if (propData) {
        if (propData.hasOwnProperty('size')) {
            properties.size = propData.size;
        }
        if (propData.hasOwnProperty('color')) {
            properties.color = propData.color;
        }
        if (propData.hasOwnProperty('cloth')) {
            properties.cloth = propData.cloth;
        }
    }

    var user = res.locals.userInfo;

    if (util.checkBlank([name, costPrice, sellingPrice, quantity, properties, itemId])) {
        return response.parameterMissing(handlerInfo, res);
    }

    var token = uuid();
    var data = {
        uuid: token,
        item_id : itemId,
        name: name,
        selling_price: sellingPrice,
        cost_price: costPrice,
        quantity: quantity,
        properties: JSON.stringify(properties),
        status : 'ACTIVE'
    };

    var tasks = [
        __.createNewVariant.bind(null, handlerInfo, data),
        logs.saveLogDetail.bind(null, handlerInfo, {}, user.username, itemId, 'VARIANT', 'ADDED')
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            return response.actionFailed(handlerInfo, res);
        }
        response.actionComplete(handlerInfo, res, {});
    });
});

router.post('/update-variant', function (req, res) {
    var handlerInfo = {
        apiModule: 'inventory',
        apiHandler: 'update-variant'
    };

    var body = req.body;
    var data = {
        name: xss(body.name),
        selling_price: xss(body.selling_price),
        cost_price: xss(body.cost_price),
        quantity: xss(body.quantity)
    };

    var itemId      = body.item_id;
    var variantId   = body.variant_id;
    var propData    = body.properties;

    var properties = {};
    if(propData) {
        if (propData.hasOwnProperty('size')) {
            properties.size = propData.size;
        }
        if (propData.hasOwnProperty('color')) {
            properties.color = propData.color;
        }
        if (propData.hasOwnProperty('cloth')) {
            properties.cloth = propData.cloth;
        }
    }

    var user = res.locals.userInfo;

    if (util.checkBlank([itemId, variantId])) {
        return response.parameterMissing(handlerInfo, res);
    }

    if (util.specialCharacterCheck(itemId+variantId)) {
        return response.specialCharacterFound({}, res);
    }

    var updateData = {};
    _.forOwn(body, function (value, key) {
        if (!util.checkBlank([data[key]])) {
            updateData[key] = data[key];
        }
    });

    var tasks = [
        __.checkIfVariantExists.bind(null, handlerInfo, variantId),
        __.updateVariant.bind(null, handlerInfo, updateData, properties, variantId),
        logs.saveLogDetail.bind(null, handlerInfo, Object.assign({}, updateData, properties), user.username, itemId, 'VARIANT', 'EDITED')
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            if (error.flag === constants.responseFlags.VARIANT_NOT_FOUND) {
                return response.itemNotFound(handlerInfo, res);
            } else {
                return response.actionFailed(handlerInfo, res);
            }
        }
        response.actionComplete(handlerInfo, res, {});
    });

});

router.get('/get-variant', function (req, res) {
    var handlerInfo = {
        apiModule: 'inventory',
        apiHandler: 'get-variant'
    };

    var itemList;
    var tasks = [
        __.getVariantList.bind(null, handlerInfo, null, itemList)
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            return response.actionFailed(handlerInfo, res);
        }
        response.actionComplete(handlerInfo, res, result);
    });
});

router.post('/delete-variant', function (req, res) {
    var handlerInfo = {
        apiModule: 'inventory',
        apiHandler: 'delete-variant'
    };

    var body = req.body;

    var itemId = body.item_id;
    var variantId = body.variant_id;

    var user = res.locals.userInfo;

    if (util.checkBlank([itemId, variantId])) {
        return response.parameterMissing(handlerInfo, res);
    }

    if (util.specialCharacterCheck(itemId + variantId)) {
        return response.specialCharacterFound({}, res);
    }

    var tasks = [
        __.checkIfVariantExists.bind(null, handlerInfo, variantId),
        __.deleteVariant.bind(null, handlerInfo, variantId),
        logs.saveLogDetail.bind(null, handlerInfo, {}, user.username, itemId, 'VARIANT', 'DELETED')
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            if (error.flag === constants.responseFlags.VARIANT_NOT_FOUND) {
                return response.variantNotFound(handlerInfo, res);
            } else {
                return response.actionFailed(handlerInfo, res);
            }
        }
        response.actionComplete(handlerInfo, res, {});
    });

});

module.exports = router;
