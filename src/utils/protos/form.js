function form(options) {
    options = options || {};

    // Form ID
    var form_id = options["id"] || utils.UUID();

    var newOptions = _.extend(
        {
            id: form_id,
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
            actions: {
                required(fields, flag) {
                    /*** {fields: String Array, flag: Bollean} ***/
                    _.each(fields, (field) => {
                        $$(form_id).elements[field].define("required", flag);
                        $$(form_id).elements[field].refresh();
                    })
                },
                readonly(fields, flag) {
                    /*** {fields: String Array, flag: Bollean} ***/
                    _.each(fields, (field) => {
                        $$(form_id).elements[field].define("readonly", flag);
                        $$(form_id).elements[field].refresh();
                    })
                }
            }
        },
        options,
        { view: "form" }
    );

    return newOptions;
};

export { form };