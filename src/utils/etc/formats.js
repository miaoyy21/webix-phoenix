var formats = {}

formats.fileSize = function (size) {
    var index = 0;

    while (size > 1024) {
        index++;
        size = size / 1024;
    }

    return Math.round(size * 100) / 100 + " " + webix.i18n.fileSize[index];
}

formats.date = {
    format: function (value) {
        if (!value) return "";

        if (_.isDate(value)) {
            return webix.Date.dateToStr("%Y-%m-%d")(value);
        }

        return value.substring(0, 10);
    },
    editParse: function (value) {
        var date = webix.Date.strToDate("%Y-%m-%d")(value);
        if (_.isDate(date)) {
            return webix.Date.dateToStr("%Y-%m-%d")(date);
        }

        return date;
    },
    editFormat: function (value) {
        if (_.isObject(value)) {
            return webix.Date.dateToStr("%Y-%m-%d")(value);
        }

        return value.substring(0, 10);
    }
};

formats.datetime = {
    format: function (value) {
        if (_.isDate(value)) {
            return webix.Date.dateToStr("%Y-%m-%d %H:%i:%s")(value);
        }

        if (_.size(value) === 10) {
            return value + " 00:00:00";
        }

        return value;
    },
    editParse: function (value) {
        var datetime = webix.Date.strToDate("%Y-%m-%d %H:%i:%s")(value);
        if (_.isDate(datetime)) {
            return webix.Date.dateToStr("%Y-%m-%d %H:%i:%s")(datetime);
        }

        return datetime;
    },
    editFormat: function (value) {
        if (typeof value === "object") {
            return webix.Date.dateToStr("%Y-%m-%d %H:%i:%s")(value);
        }

        if (_.size(value) === 10) {
            return value + " 00:00:00";
        }

        return value;
    }
};

formats.int = {
    format: function (value) {
        return webix.Number.format(value, {
            groupDelimiter: webix.i18n.groupDelimiter,
            groupSize: webix.i18n.groupSize,
        });
    },
    editParse: function (value) {
        if (_.isNumber(value)) return value;

        value = value.replace(/,/g, "");

        // 如果不是数值类型
        if (_.isNaN(Number(value))) {
            value = webix.Number.format(value).replace(/,/g, "")
            if (_.isNaN(Number(value))) {
                value = 0;
            } else {
                value = Math.round(Number(value));
            }
        }

        return webix.Number.parse(value, {
            groupSize: webix.i18n.groupSize,
            groupDelimiter: webix.i18n.groupDelimiter,
        });
    },
    editFormat: function (value) {
        return webix.Number.format(value, {
            groupSize: webix.i18n.groupSize,
            groupDelimiter: webix.i18n.groupDelimiter,
        });
    }
};

formats.number = {
    format: function (value, size) {
        // console.log("format", value, size);
        // console.log("format", webix.Number.format(value, _.extend({}, webix.i18n, { decimalSize: size })));
        return webix.Number.format(value, _.extend({}, webix.i18n, { decimalSize: size }));
    },
    editParse: function (value, size) {
        // console.log("editParse", typeof value, typeof size);
        // console.log("editParse", value, size);
        if (_.isNumber(value)) return value;

        value = value.replace(/,/g, "");

        // 如果不是数值类型
        if (_.isNaN(Number(value))) {
            value = webix.Number.format(value).replace(/,/g, "");
            if (_.isNaN(Number(value))) {
                value = 0;
            }
        }

        // console.log("editParse", value, webix.Number.parse(value, _.extend({}, webix.i18n, { decimalSize: size })));
        return Number(webix.Number.parse(value, _.extend({}, webix.i18n, { decimalSize: size })));
    },
    editFormat: function (value, size) {
        return webix.Number.format(value, _.extend({}, webix.i18n, { decimalSize: size }));
    }
};

formats.price = {
    format: function (value, size) {
        if (_.isString(value) && !value) {
            return value
        }

        return webix.Number.format(value, _.extend({}, webix.i18n, { decimalSize: size, prefix: "¥" }));
    },
    editParse: function (value, size) {
        if (_.isNumber(value)) return value;

        value = value.replace(/,/g, "");

        // 如果不是数值类型
        if (_.isNaN(Number(value))) {
            value = webix.Number.format(value).replace(/,/g, "");
            if (_.isNaN(Number(value))) {
                value = 0;
            }
        }

        return webix.Number.parse(value, _.extend({}, webix.i18n, { decimalSize: size }));
    },
    editFormat: function (value, size) {
        return webix.Number.format(value, _.extend({}, webix.i18n, { decimalSize: size }));
    }
};

formats.method = function (value) {
    var background;

    if (value === "GET") {
        background = "#FFFFFF";
    } else if (value === "PUT") {
        background = "#F0FFF0";
    } else if (value === "POST") {
        background = "#F0F0FF";
    } else {
        background = "#FFF0F0";
    }

    return { "background": background };
}

export { formats }