function checkbox(options) {
    var _options = options["editable"] ? {
        view: "checkbox", name: "__tybz__", label: "__tybz__",
        checkValue: "1",
        uncheckValue: "0",
        on: { onChange(val) { } }
    } : {
        id: "__tybz__",
        header: { text: "__tybz__", css: { "text-align": "center" } },
        template: function (obj, common, value, config) {
            if (value == config.checkValue) {
                return "<span class='webix_icon phoenix_primary_icon mdi mdi-checkbox-marked' />"
            }

            return "<span class='webix_icon mdi mdi-checkbox-blank-outline' />"
        },
        checkValue: "1",
        uncheckValue: "0",
        tooltip: false,
        css: { "text-align": "center" },
        width: 60,
    };

    return _.extend(_options, options || {})
}

export { checkbox }