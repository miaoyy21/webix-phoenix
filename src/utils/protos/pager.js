function pager(options) {
    options = options || {};

    // Pager ID
    var pager_id = options["id"] || utils.UUID();
    var _options = {
        id: pager_id,
        borderless: false,
        css: { "border-top": "none", "border-right": "none", "border-bottom": "none" },
        template: function (obj, common) {
            var master = $$(obj.id).$master;

            switch (master.config.view) {
                case "datatable":
                    if (master.count()) {
                        return common.first(obj) + common.prev(obj) + common.pages(obj) + common.next(obj) + common.last(obj)
                            + "  当前 第" + common.page(obj) + "页，总共 " + obj.limit + "页，共计 " + webix.i18n.intFormat(obj.count) + "条记录。";
                    }

                    return "<span style='margin-left:24px'>共计 0条记录</span>";
                case "editlist":
                case "list":
                    if (master.count()) {
                        return common.first(obj) + common.prev(obj) + "<span style='margin-left:24px;margin-right:24px'>第" + common.page(obj) + "/" + obj.limit + "页</span>" + common.next(obj) + common.last(obj);
                    }

                    return "";
                default:
                    return common.first(obj) + common.prev(obj) + common.next(obj) + common.last(obj);
            }
        },
        group: 5,
        size: 50
    }

    return _.extend(_options, options, { view: "pager" });
}

export { pager };
