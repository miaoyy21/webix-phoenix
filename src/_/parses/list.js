var list = {};

// 基本属性
list.options = function (options) {
    _.forEach(options, function (value, key) {
        if (value === "true") {
            options[key] = true
        } else if (value === "false") {
            options[key] = false
        }
    });

    // 检索服务URL的特殊处理
    if (!options.url) {
        delete options.url
    } else if (_.indexOf(options.url, "/") < 0) {
        if (_.indexOf(options.url, ".") < 0) {
            // 数据字典
            options.url = "/api/sys/dict_items?kind_code=" + options.url;
        } else {
            // 数据服务
            options.url = "/api/sys/data_service?service=" + options.url;
        }
    }

    // 保存服务URL的特殊处理
    if (!options.save.url) {
        delete options.save.url
    } else if (_.indexOf(options.save.url, "/") < 0) {
        options.save.url = "/api/sys/data_service?service=" + options.save.url;
    }

    var text = options.showText;
    options.template = text;
    delete options.showText;

    // 预置事件
    options.on = {
        "data->onStoreUpdated": function () {
            this.data.each(function (obj, i) {
                obj.index = i + 1;
            })
        },
        onBeforeLoad: function () {
            webix.extend(this, webix.OverlayBox);

            this.showOverlay("数据加载中...");
            return true;
        },
        onAfterLoad: function () {
            this.hideOverlay();
            if (!this.count()) {
                this.showOverlay("无检索数据");
                return;
            }

            // 因为可能会设置index，所以需要重新刷新1次
            this.refresh();
        },
    }

    return options;
}

export { list };