function form(options) {
    options = options || {};

    // Form ID
    var form_id = options["id"] || utils.UUID();

    var _options = _.extend(
        {
            id: form_id,
            uploader: [],
            data: {},
            rows: [
                {
                    view: "fieldset",
                    label: "Fieldet Text",
                    body: {
                        rows: [
                            { name: "text_", view: "text", required: true, label: "Text", placeholder: "Text ..." },
                            { name: "text_suggest_", view: "text", required: true, label: "Suggest", suggest: utils.dicts["user_sex"], placeholder: "Text of Suggest ..." },
                            { name: "text_password_", view: "text", type: "password", label: "Password", placeholder: "Text of Password ...", bottomLabel: "* This is a Bottom Label" },
                        ]
                    },
                },
                utils.protos.uploader({ name: "doc_", label: "附件资料", editable: true }),
                { name: "textarea_", view: "textarea", label: "Textarea", placeholder: "Textarea ..." },
                {
                    name: "search_datatable_", view: "search", label: "DataTable", readonly: true, required: true,
                    on: {
                        onSearchIconClick() {
                            utils.protos.window.form(
                                {
                                    head: "Search Datatable",
                                    height: 180,
                                    form: {
                                        data: { "search_datatable_": $$(form_id).getValues()["search_datatable_"] },
                                        rows: [
                                            { view: "text", name: "search_datatable_", label: "SD Code", required: true },
                                        ],
                                    },
                                    callback(value) {
                                        $$(form_id).setValues({ "search_datatable_": value["search_datatable_"] });
                                    }
                                }
                            );
                        }
                    }
                },
                { name: "search_tree_", view: "search", label: "Tree", readonly: true, required: true, on: { onSearchIconClick() { console.log(this) } } },
                { name: "search_list_", view: "search", label: "List", readonly: true, required: true, on: { onSearchIconClick() { console.log(this) } } },
                { name: "rich_select_", view: "richselect", label: 'Rich Select', options: utils.dicts["user_sex"] },
                { name: "combo_", view: "combo", label: 'Combo', options: utils.dicts["user_sex"] },
                { name: "checkbox_", view: "checkbox", label: "Checkbox" },
                { name: "radio_", view: "radio", label: "Radio", options: utils.dicts["user_sex"] },
                { name: "switch_", view: "switch", label: "Switch" },
                { name: "slider_", view: "slider", label: "Slider", title: webix.template("#value#") },
                { name: "counter_", view: "counter", label: "Counter" },
                { name: "datepicker_", view: "datepicker", label: "Datepicker", stringResult: true, format: utils.formats.date.format },
            ],
            elementsConfig: { labelAlign: "right", clear: false },
        },
        options,
        { view: "form" }
    );

    // 设置附件上传组件数据
    if (_options["data"] && _.size(_options["uploader"])) {
        var uploader = !_.isArray(_options["uploader"]) ? [_options["uploader"]] : _options["uploader"];

        // Ajax请求附件信息
        _.each(uploader, function (name) {
            console.log(_options);
            var text = _options["data"][name];
            if (_.size(text) < 1) {
                _options["data"][name] = [];
            } else if (_.isString(text)) {
                var value = JSON.parse(webix.ajax().sync().get("/api/sys/docs", { id: text }).responseText);
                _options["data"][name] = _.map(value, (v) => ({
                    id: v.id,
                    value: v.id,
                    name: v["name_"],
                    sizetext: utils.formats.fileSize(Number(v["size_"])),
                    status: "server"
                }));
            } else {
                console.error("it is not a document Object ", text)
            }
        })
    }

    return _options;
};

export { form };