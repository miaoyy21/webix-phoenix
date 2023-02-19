
/*
{
    title: "*******",
    backwards:{},
    callback: function(backwards){ }
}
*/
function backwards(options) {
    var win = utils.UUID();
    var form = utils.UUID();

    var values = _.extend({}, { executors: {}, comment: "无" });
    _.each(options["backwards"], (back, key) => { values["executors"][key] = _.values(back["executors"]).join("; ") });

    // 构建执行者选择
    var keys = _.map(options["backwards"], (back, key) => {
        return ({
            view: "fieldset",
            label: back["name"],
            body: {
                rows: [
                    {
                        name: "executors." + key, view: "search", label: " ", labelWidth: 20, readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                var checked = _.map(back["executors"], (value, key) => ({ "id": key, "user_name_": value }));

                                // 选择用户
                                utils.windows.users({
                                    multiple: true,
                                    cache: false,
                                    checked: checked,
                                    filter: (departId, userId) => _.findIndex(back["organization"], (org) => org == departId || org == userId) >= 0,
                                    callback: (checked) => {
                                        options["backwards"][key]["executors"] = _.object(_.pluck(checked, "id"), _.pluck(checked, "user_name_"));

                                        values["executors"][key] = _.pluck(checked, "user_name_").join("; ");
                                        $$(form).setValues(values);

                                        return true;
                                    }
                                })
                            }
                        }
                    },
                ]
            },
        });
    });

    webix.ui({
        id: win,
        view: "window",
        modal: true,
        close: true,
        move: true,
        width: 600,
        minHeight: 300,
        headHeight: 40,
        position: "center",
        head: options["title"],
        body: {
            paddingX: 12,
            rows: [
                { height: 8 },
                {
                    id: form,
                    view: "form",
                    borderless: true,
                    complexData: true,
                    data: {},
                    rows: [
                        ...keys,
                        {
                            view: "fieldset",
                            label: "流转意见",
                            body: {
                                rows: [
                                    { name: "comment", view: "textarea", placeholder: "请输入流转意见 ..." },
                                ]
                            },
                        },
                    ],
                    elementsConfig: { labelAlign: "right", clear: false },
                },
                {
                    view: "toolbar",
                    borderless: true,
                    height: 34,
                    cols: [
                        {},
                        {
                            view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary",
                            click() {
                                if (!$$(form).validate()) return;

                                // 获取设置的执行者
                                var backs = {};
                                _.each(options["backwards"], (back, key) => {
                                    backs[key] = _.pick(back, "key", "name", "routes", "executors")
                                })

                                var values = $$(form).getValues();
                                var execute = { "id": options["id"], "backwards": backs, "comment": values["comment"] };

                                console.log(execute);
                            }
                        },
                        { width: 8 }
                    ]
                },
                { height: 8 }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();

    $$(form).setValues(values);
}

export { backwards }