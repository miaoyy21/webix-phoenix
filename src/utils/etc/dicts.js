var dicts = {}

// 加载所有的字典分类及数据字典
function load() {
    var data = webix.ajax().sync().get("/api/sys", { "method": "Dictionary", "PHOENIX_USING_MENU": "[系统预加载]" });

    dicts = _.groupBy(JSON.parse(data.response), "code");
}

load();

export { dicts }