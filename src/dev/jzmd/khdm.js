function builder() {
    var pager = utils.protos.pager();

    var datatable = utils.protos.datatable({
        multiselect: false,
        editable: true,
        leftSplit: 4,
        rightSplit: 1,
        url: "/api/sys/data_service?service=JZMD_KHDM.query&pager=true",
        save: {
            url: "/api/sys/data_service?service=JZMD_KHDM.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },

        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "tybz", header: { text: "停用", css: { "text-align": "center" } }, template: "{common.checkbox()}", checkValue: "1", uncheckValue: "0", tooltip: false, css: { "text-align": "center" }, width: 60 },
            { id: "khbh", header: { text: "供应商编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 90 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, editor: "text", width: 240 },
            { id: "gyssx", header: { text: "供应商属性", css: { "text-align": "center" } }, editor: "combo", options: utils.dicts["md_gyssx"], css: { "text-align": "center" }, width: 100 },
            { id: "cpfw", header: { text: "产品认定范围", css: { "text-align": "center" } }, editor: "text", width: 360 },
            { id: "sf", header: { text: "省份", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 80 },
            { id: "cs", header: { text: "城市", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 80 },
            { id: "dwdz", header: { text: "单位地址", css: { "text-align": "center" } }, editor: "text", width: 200 },
            { id: "nsh", header: { text: "纳税号", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 160 },
            { id: "khyh", header: { text: "开户银行", css: { "text-align": "center" } }, editor: "text", width: 240 },
            { id: "yhzh", header: { text: "银行账号", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 160 },
            { id: "frdb", header: { text: "法人代表", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 80 },
            { id: "lxr", header: { text: "联系人", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 80 },
            { id: "lxdh", header: { text: "联系电话", css: { "text-align": "center" } }, editor: "text", width: 100 },
            { id: "tyry", header: { text: "禁用人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "tyrq", header: { text: "禁用日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 140 },
            { id: "tyyy", header: { text: "禁用原因", css: { "text-align": "center" } }, editor: "text", width: 360 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: "text", width: 360 },
            { id: "create_user_name_", header: { text: "创建人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 140 },
            {
                id: "buttons",
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                 <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`,
            }
        ],
        rules: {
            "khmc": webix.rules.isNotEmpty,
        },
        styles: {
            cellTextColor: function (row, col) { return row["tybz"] == "1" ? "red" : "none" }
        },
        pager: pager.id
    });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    datatable.actions.add(() => ({ "gyssx": "合格供方", "tybz": "0" })),
                    datatable.actions.refresh(),
                    {},
                    datatable.actions.search("khbh,khmc,gyssx,cpfw,sf,cs,dwdz,nsh,khyh,yhzh,lxr"),
                ]
            },
            datatable,
            pager
        ],
    };
}

export { builder };