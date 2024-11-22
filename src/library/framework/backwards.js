
function backwards(options) {
    var win = utils.UUID();
    var comm = utils.UUID();

    // 是否为结束节点
    var isEnd = _.findWhere(options["backwards"], { "category": "End" });

    var elements = !isEnd ?
        _.map(options["backwards"], (back) => {
            console.log(back);

            return {
                view: "fieldset",
                label: "指定【" + back["name"] + "】执行者",
                body: {
                    minHeight: 88,
                    cols: [
                        {
                            id: win + "$" + back["key"],
                            view: "dataview",
                            borderless: true,
                            autoheight: true,
                            template: `
                            <div class='webix_strong' >
                                <button type="button" class="btn_remove webix_icon_button" >
                                    <span class="phoenix_danger_icon mdi mdi-dark mdi-18px mdi-account-remove"></span>
                                </button> 
                                #name#
                            </div>
                        `,
                            data: back["executors"],
                            type: {
                                type: "tiles",
                                width: 112,
                                height: 38,
                            },
                            onClick: {
                                btn_remove(e, id) {
                                    this.remove(id);
                                },
                            },
                        },
                        {
                            view: "icon", icon: "mdi mdi-24px mdi-account-plus-outline", width: 48,
                            click() {
                                var checked = _.map($$(win + "$" + back["key"]).data.pull, (row) => ({ "id": row["id"], "user_name_": row["name"] }));

                                // 选择用户
                                utils.windows.users({
                                    multiple: true,
                                    cache: false,
                                    checked: checked,
                                    filter: (departId, userId) => _.findIndex(back["organization"], (org) => org == departId || org == userId) >= 0,
                                    callback: (checked) => {
                                        $$(win + "$" + back["key"]).clearAll();
                                        $$(win + "$" + back["key"]).parse(_.map(checked, (user) => ({ "id": user["id"], "name": user["user_name_"] })));

                                        return true;
                                    }
                                })
                            }
                        },
                    ]
                }
            };
        }) : [{ template: "【结束】", type: "section" }];

    webix.ui({
        id: win,
        view: "window",
        modal: true,
        close: true,
        move: true,
        width: 600,
        minHeight: !isEnd ? 300 : 240,
        headHeight: 40,
        position: "center",
        head: options["title"],
        body: {
            paddingX: 12,
            rows: [
                { height: 8 },
                ...elements,
                {
                    view: "fieldset",
                    label: "流转意见",
                    body: { id: comm, name: "comment", view: "textarea", placeholder: "请输入流转意见 ..." },
                },
                {
                    cols: [
                        {},
                        {
                            view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary",
                            click() {
                                var data = {
                                    "id": options["id"],
                                    "backwards":
                                        _.map(options["backwards"],
                                            (back) => {
                                                var item = _.pick(back, "key", "name", "routes");

                                                item["executors"] = !isEnd ? _.values($$(win + "$" + back["key"]).data.pull) : [];
                                                return item;
                                            }
                                        ),
                                    "comment": $$(comm).getValue()
                                };

                                if (options.callback(data)) {
                                    $$(win).hide();
                                }
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