
import { formats } from "../etc/formats"

// 默认状态
const DefaultOptions = { filter: (row) => true, callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_fund",

    filter_id: "phoenix_utils_windows_fund_filter",
    filter_placeholder: "请输入基金代码、基金名称",

    grid_id: "phoenix_utils_windows_fund_grid",
    pager_id: "phoenix_utils_windows_fund_pager",

    // 状态设置
    options: DefaultOptions,
}

// 刷新
instance.reload = function () {
    var request = webix.ajax().sync().get("/api/sys/data_service?service=ST_FUND.query");
    var allData = JSON.parse(request.responseText)["data"];

    // 根据条件进行数据筛选
    var data = _.filter(allData, (row) => instance.options.filter(row));

    // 设置选中状态
    $$(instance.grid_id).clearAll();

    $$(instance.grid_id).define("data", data)
    $$(instance.grid_id).refresh();

    // 默认选中第1个可选用户
    if ($$(instance.grid_id).getFirstId()) {
        $$(instance.grid_id).select($$(instance.grid_id).getFirstId());
    }

    // 是否根据条件过滤用户
    if ($$(instance.filter_id).getValue()) {
        instance.filter();
    }
}

// 过滤
instance.filter = function () {
    $$(instance.grid_id).filter((row) => ((row["code"] || "") + "|" + (row["name"] || "")).toUpperCase().indexOf($$(instance.filter_id).getValue().toUpperCase()) >= 0);

    // 没有符合条件的数据
    if (!$$(instance.grid_id).count()) {
        $$(instance.grid_id).showOverlay("没有找到符合条件的数据");
    } else {
        $$(instance.grid_id).hideOverlay();

        // 默认选中第1个可选用户
        $$(instance.grid_id).select($$(instance.grid_id).getFirstId());
    }
}

// 确定
instance.ok = function () {
    var checked = $$(instance.grid_id).getSelectedItem(false);

    // 回调成功，隐藏对话框
    if (instance.options.callback(checked)) {
        instance.options = _.extend({}, DefaultOptions);

        $$(instance.window_id).hide();
    }
}

webix.ui({
    id: instance.window_id,
    view: "window",
    modal: true,
    close: true,
    move: true,
    height: 600,
    width: 800,
    headHeight: 38,
    position: "center",
    head: "选择基金",
    body: {
        paddingX: 12,
        rows: [
            {
                rows: [
                    { id: instance.filter_id, view: "text", keyPressTimeout: 250, placeholder: instance.filter_placeholder, clear: true, on: { onTimedKeyPress: instance.filter } },
                    {
                        id: instance.grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        select: "row",
                        headerRowHeight: 35,
                        rowHeight: 28,
                        data: [],
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "code", header: { text: "基金代码", css: { "text-align": "center" } }, sort: "text", css: { "text-align": "center" }, width: 100 },
                            { id: "name", header: { text: "基金名称", css: { "text-align": "center" } }, sort: "text", minWidth: 240, fillspace: true },
                            { id: "npv", header: { text: "净值", css: { "text-align": "center" } }, format: (value) => formats.number.format(value, 4), sort: "int", css: { "text-align": "right" }, minWidth: 80 },
                        ],
                        elementsConfig: { labelAlign: "right", clear: false },
                        on: {
                            "data->onStoreUpdated": function () {
                                this.data.each((obj, i) => { obj.index = i + 1; })
                            },
                            onBeforeLoad() {
                                this.showOverlay("数据加载中...");
                            },
                            onAfterLoad() {
                                this.hideOverlay();
                                if (!this.count()) {
                                    this.showOverlay("无检索数据");
                                    return;
                                }
                            },
                            onItemDblClick: instance.ok
                        },
                        pager: instance.pager_id,
                    },
                    {
                        id: instance.pager_id,
                        view: "pager",
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
                ]
            },
            {
                cols: [
                    { width: 8 },
                    { view: "button", label: "刷新", minWidth: 88, autowidth: true, css: "webix_transparent", click: instance.reload },
                    {},
                    { view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary", click: instance.ok },
                    { width: 8 }
                ]
            },
            { height: 8 }
        ]
    }
})

/*
    {
        filter      可选    筛选数据回调函数
        callback    必须    点击确定的回调函数
    }
*/
export function fund(options) {

    // 参数配置
    instance.options = _.extend({}, DefaultOptions, options);

    // 如果未设置缓存，或者无数据，那么执行刷新
    if ($$(instance.grid_id).count() < 1) {
        instance.reload();
    }

    $$(instance.window_id).show();
}