
const instance = {
    window_id: "phoenix_utils_windows_coding",
    editor_id: "phoenix_utils_windows_coding_editor",

    options: { js: { "function": { "arguments": null, "body": "" } }, callback: function (text) { } }
}

instance.ok = function () {
    var text = $$(instance.editor_id).getValue().trim();
    instance.options.callback(
        _.extend(
            instance.options["js"],
            {
                "args": text.substring(text.indexOf("(") + 1, text.indexOf(")")),
                "body": text.substring(text.indexOf("{") + 1, text.lastIndexOf("}"))
            }
        )
    );

    $$(instance.window_id).hide();
}

/*
    {
        js          必须    js代码  格式 {function: {name, arguments, body}}
        callback    必须    点击确定的回调函数
    }
*/
function coding(options) {
    _.extend(instance.options, options);

    webix.ui({
        id: instance.window_id,
        view: "window",
        close: true,
        modal: true,
        head: "事件脚本",
        position: "center",
        fullscreen: true,
        body: {
            rows: [
                { id: instance.editor_id, view: "ace-editor", mode: "javascript" },
                { height: 8, css: { "border-top": "none" } },
                {
                    cols: [
                        {},
                        { view: "button", label: "确定", autowidth: true, css: "webix_primary", click: instance.ok },
                        { width: 8 }
                    ]
                },
                { height: 8 }
            ],
        },
        on: {
            onHide() {
                this.close();
            }
        }
    }).show();

    var fn = instance.options["js"];
    var text = "function " + fn["func"] + " (" + (fn["args"] || "") + ") {" + fn["body"] + "}";

    $$(instance.editor_id).setValue(text);
}

export { coding };