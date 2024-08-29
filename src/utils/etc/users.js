var base64 = require('base-64');
var utf8 = require('utf8');

var users = {};

users.getUserId = function () {
    return webix.storage.cookie.getRaw("PHOENIX_USER_ID");
}

users.getUserCode = function () {
    return webix.storage.cookie.getRaw("PHOENIX_USER_CODE");
}

users.getUserName = function () {
    var encoded = webix.storage.cookie.getRaw("PHOENIX_USER_NAME");
    return utf8.decode(base64.decode(encoded));
}

users.getDepartId = function () {
    return webix.storage.cookie.getRaw("PHOENIX_DEPART_ID");
}

users.getDepartCode = function () {
    return webix.storage.cookie.getRaw("PHOENIX_DEPART_CODE");
}

users.getDepartName = function () {
    var encoded = webix.storage.cookie.getRaw("PHOENIX_DEPART_NAME");
    return utf8.decode(base64.decode(encoded));
}

users.getDateTime = function () {
    return webix.Date.dateToStr("%Y-%m-%d %H:%i:%s")(new Date());
}


export { users };