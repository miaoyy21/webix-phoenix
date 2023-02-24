var json = {};

// 包含函数的JSON序列化
json.marshal = function (source) {
    var target = JSON.stringify(source, function (key, value) {
        if (typeof value === "function") {
            var sfn = value.toString().trim();
            return {
                "func": key,
                "args": sfn.substring(sfn.indexOf("(") + 1, sfn.indexOf(")")),
                "body": sfn.substring(sfn.indexOf("{") + 1, sfn.lastIndexOf("}"))
            };
        }

        return value;
    })

    return target;
};

// 包含函数的JSON解析
json.unmarshal = function (target) {
    var source = JSON.parse(target, function (key, value) {
        if (_.has(value, "func") && _.has(value, "args") && _.has(value, "body")) {
            return new Function(value["args"] || "", value["body"]);
        }

        return value;
    })

    return source;
}

export { json };