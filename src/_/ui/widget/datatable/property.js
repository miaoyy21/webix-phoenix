
// DataTable 属性配置
function builder(id, options) {

    if (!options) {
        options = {
            view: "datatable",
            borderless: false,
            css: "webix_data_border webix_header_border",
            hover: "disable",
            tooltip: false,
            select: "row",
            multiselect: false,
            editable: false,
            editaction: "click",
            drag: "false",
            sort: "false",
            math: false,

            columns: [],
            ready: {
                "func": "ready",
                "args": null,
                "body": `
    var self = this;

    // ⭐️ 解析字段配置
    var columns = utils.parses.datatable.columns(this.getColumns(true), this.config.editable);
    this.refreshColumns(columns);

    // ⭐️ 解决数据不在列中，当编辑后未改变内容时，请求服务端的问题
    this.attachEvent("onBeforeEditStart",function(cell){
        var row = this.getItem(cell.row);
        if (!_.has(row,cell.column)){
            row[cell.column] = "";
            webix.dp(this).ignore(function(){ self.updateItem(cell.row,row); });
        }
    });

    // 添加记录后触发事件
    this.attachEvent("onAfterAdd", function (id, index) {
        this.hideOverlay();
        this.select && this.select(id);
    });

    var delete_index = -1; // 标记删除的记录索引
    
    // 删除记录前触发事件
    this.attachEvent("onBeforeDelete", function (id) {
        delete_index = this.getIndexById(id);
    })

    // 删除记录后触发事件
    this.attachEvent("onAfterDelete", function (id) {
        if (!this.count()) {
            this.showOverlay("无检索数据");
            return;
        }

        // 选择删除记录行附近的数据行
        if (this.select) {
            var select_index = delete_index;
            if (this.count() < delete_index + 1) {
                select_index = this.count() - 1;
            }

            var select_id = this.getIdByIndex(select_index);
            if (select_id) {
                this.select(select_id);
            }
        }
    });

    // 选择记录行或单元格后触发
    this.attachEvent("onAfterSelect", function (selection, preserve) {
        // console.log("onAfterSelect", selection, preserve);
    });

    // 默认选择第1条记录
    var first = this.getFirstId();
    if (this.select && first) {
        this.select(first);
    }
`
            },
            header: true,
            footer: false,
            headerRowHeight: 35,
            rowHeight: 28,
            resizeRow: false,
            resizeColumn: false,
            columnWidth: 120,
            leftSplit: 0,
            rightSplit: 0,
            topSplit: 0,

            url: "",
            save: {
                url: "",
                updateFromResponse: true,
                trackMove: true,
                operationName: "operation",
            },

            removeMissed: true,
            checkboxRefresh: true,
            onClick: {},
        }
    }

    return {
        id: id,
        view: "property",
        scroll: true,
        width: 360,
        complexData: true,
        tooltip(element) {
            return element.id + ' : ' + element.label;
        },
        elements: [
            { label: "基本属性", type: "label" },
            { id: "borderless", label: "无外边框", type: "checkbox" },
            { id: "css", label: "样式表", type: "text" },
            { id: "hover", label: "悬浮行样式", type: "richselect", options: [{ id: "phoenix_hover", value: "主色调" }, { id: "phoenix_hover_red", value: "淡红色" }, { id: "phoenix_hover_green", value: "淡绿色" }, { id: "phoenix_hover_blue", value: "淡蓝色" }, { id: "disable", value: "禁用" }] },
            { id: "tooltip", label: "工具提示", type: "checkbox" },
            { id: "select", label: "选择模式", type: "richselect", options: [{ id: "cell", value: "单元格" }, { id: "row", value: "记录行" }, { id: "false", value: "禁用" }] },
            { id: "multiselect", label: "开启多选", type: "checkbox" },
            { id: "editable", label: "开启编辑", type: "checkbox" },
            { id: "editaction", label: "编辑触发", type: "richselect", options: [{ id: "click", value: "单击" }, { id: "dblclick", value: "双击" }, { id: "custom", value: "默认" }] },
            { id: "drag", label: "拖拽排序", type: "richselect", options: [{ id: "order", value: "启用" }, { id: "false", value: "禁用" }] },
            { id: "sort", label: "排序模式", type: "richselect", options: [{ id: "multi", value: "多列" }, { id: "true", value: "单列" }, { id: "false", value: "禁用" }] },
            { id: "math", label: "数学表达式", type: "checkbox" },

            { label: "表格样式", type: "label" },
            { id: "header", label: "显示页眉", type: "checkbox" },
            { id: "footer", label: "显示页脚", type: "checkbox" },
            { id: "headerRowHeight", label: "页眉页脚高", type: "text", format: webix.i18n.intFormat },
            { id: "rowHeight", label: "单元格高", type: "text", format: webix.i18n.intFormat },
            { id: "resizeRow", label: "可调整行高", type: "checkbox" },
            { id: "resizeColumn", label: "可调整列宽", type: "checkbox" },
            { id: "columnWidth", label: "默认列宽", type: "text", format: webix.i18n.intFormat },
            { id: "leftSplit", label: "左侧冻结列", type: "text", format: webix.i18n.intFormat },
            { id: "rightSplit", label: "右侧冻结列", type: "text", format: webix.i18n.intFormat },
            { id: "topSplit", label: "顶部冻结行", type: "text", format: webix.i18n.intFormat },

            { label: "数据源配置", type: "label" },
            { id: "url", label: "数据查询服务", type: "text" },
            { id: "save.url", label: "数据保存服务", type: "text" },
            { id: "save.updateFromResponse", label: "开启自动更新", type: "checkbox" },
            { id: "save.operationName", label: "操作名称命名", type: "text" },
        ],
        data: options,
    };
}

export { builder }