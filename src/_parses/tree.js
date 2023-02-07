var tree = {};

// 基本属性
tree.options = function (options) {
    _.forEach(options, function (value, key) {
        if (value === "true") {
            options[key] = true
        } else if (value === "false") {
            options[key] = false
        }
    });


    // 检索服务URL的特殊处理
    if (!options.queryUrl) {
        delete options.queryUrl
    } else if (_.indexOf(options.queryUrl, "/") < 0) {
        if (_.indexOf(options.queryUrl, ".") < 0) {
            // 数据字典
            options.queryUrl = "/api/sys/dict_items?kind_code=" + options.queryUrl;
        } else {
            // 数据服务
            options.queryUrl = "/api/sys/data_service?service=" + options.queryUrl;
        }
    }

    // 保存服务URL的特殊处理
    if (!options.save.url) {
        delete options.save.url
    } else if (_.indexOf(options.save.url, "/") < 0) {
        options.save.url = "/api/sys/data_service?service=" + options.save.url;
    }

    var text = options.showText;
    delete options.showText;

    if (options.checkState === "three") {
        options.threeState = true;
        options.template = "{common.icon()} {common.checkbox()} {common.folder()} " + text;
    } else if (options.checkState === "two") {
        options.threeState = false;
        options.template = "{common.icon()} {common.checkbox()} {common.folder()} " + text;
    } else {
        delete options.threeState;
        options.template = "{common.icon()} {common.folder()} " + text;
    }
    delete options.checkState;

    return options;
}

export { tree };