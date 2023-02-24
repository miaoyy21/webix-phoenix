
// Tree 属性配置
function builder(id, options) {
    if (!options) {
        options = {
            view: "edittree",
            borderless: false,
            css: "",
            tooltip: "false",
            select: false,
            editable: false,
            editor: "text",
            editValue: "value",
            drag: "false",
            ready: {
                "func": "ready",
                "args": null,
                "body": `
    webix.extend(this, webix.OverlayBox).hideOverlay();
    webix.extend(this, webix.ProgressBar).showProgress();
    
    // ⭐️ 根据检索地址加载平面数据，然后进行建树
    webix.ajax(this.config.queryUrl)
        .then((res) => {
            var data = utils.tree.buildTree(res.json().data, null,this.config.idField, this.config.parentIdField);
            this.define("data", data);
            this.refresh();
            
            this.hideProgress();
            if (!this.count()) {
                this.showOverlay("无检索数据");
                return;
            } else {
                this.config.allOpen && this.openAll();

                // 默认选择第1个节点
                this.config.select && this.select(this.getFirstId());
            }
        });

    // 添加节点后触发事件
    this.attachEvent("onAfterAdd", function (id, index) {
        this.hideOverlay();
        this.select && this.select(id);
    });

    // 删除节点后触发事件
    this.attachEvent("onAfterDelete", function (id) {
        if (!this.count()) {
            this.showOverlay("无检索数据");
            return;
        }
    });

    // 选择节点后触发
    this.attachEvent("onAfterSelect", function (id) {
        // console.log("onAfterSelect", id);
    });
`
            },

            save: {
                url: "",
                updateFromResponse: true,
                trackMove: true,
                operationName: "operation",
            },
            removeMissed: true,

            queryUrl: "",
            showText: "#!value#",
            checkState: "disable",
            allOpen: false,
            idField: "id",
            parentIdField: "parent_id_"
        }
    }

    return {
        id: id,
        view: "property",
        scroll: true,
        width: 360,
        complexData: true,
        tooltip(element) {
            switch (element.id) {
                case "tooltip":
                    return "支持两种配置格式: \n\tfalse  不启用; #{字段1}#{...}#{字段2}#  指定使用哪些字段进行显示";
                case "editValue":
                    return "指定编辑字段: \n\t{字段}  指定编辑的字段"
                case "showText":
                    return "支持配置的格式: \n\t#{字段1}#{...}#{字段2}#  指定使用哪些字段进行显示"
                default:
                    return element.id + ": " + element.label;
            }
        },
        elements: [
            { label: "基本属性", type: "label" },
            { id: "borderless", label: "无外边框", type: "checkbox" },
            { id: "css", label: "样式表", type: "text" },
            { id: "tooltip", label: "工具提示", type: "text" },
            { id: "select", label: "开启选择", type: "checkbox" },
            { id: "editable", label: "开启编辑", type: "checkbox" },
            { id: "editValue", label: "编辑字段", type: "text" },
            { id: "checkState", label: "勾选模式", type: "richselect", options: [{ id: "three", value: "级联模式" }, { id: "two", value: "单一模式" }, { id: "disable", value: "禁用" }] },
            { id: "drag", label: "拖拽排序", type: "richselect", options: [{ id: "order", value: "启用" }, { id: "false", value: "禁用" }] },
            { id: "allOpen", label: "全部展开", type: "checkbox" },
            { id: "showText", label: "显示模版", type: "text" },

            { label: "数据源配置", type: "label" },
            { id: "queryUrl", label: "数据查询服务", type: "text" },
            { id: "save.url", label: "数据保存服务", type: "text" },
            { id: "save.updateFromResponse", label: "开启自动更新", type: "checkbox" },
            { id: "save.operationName", label: "操作名称命名", type: "text" },

            { label: "建树模式", type: "label" },
            { id: "idField", label: "ID字段", type: "text" },
            { id: "parentIdField", label: "父级字段", type: "text" },
        ],
        data: options,
    };
}

export { builder }