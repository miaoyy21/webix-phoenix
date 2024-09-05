function uploader(options) {
    var id = utils.UUID();
    var uploader_id = utils.UUID();
    var list_id = utils.UUID();

    // 默认配置
    var newOptions = _.extend(
        {
            css: { "border-top": "none" },
            label: "附件",   // 显示名称
            readonly: false, // 是否可以只读，不可编辑（删除，上传）
            accept: "*",    // 上传的文件类型  https://en.wikipedia.org/wiki/Media_type#List_of_common_media_types
            multiple: true, // 是否可以多文件上传
            data: "[]", // 文档信息，JSON格式字符串
            elementsConfig: { labelAlign: "right", clear: false }, // 表单配置
            getValue() { return "[]" }, // 返回JSON格式文档列表
        },
        options
    )

    var docs = JSON.parse(_.size(options["data"]) > 2 ? options["data"] : "[]")

    return {
        id: id,
        view: "form",
        css: newOptions["css"],
        data: { doc: docs },
        rows: [
            {
                view: "fieldset",
                label: newOptions["label"],
                body: {
                    rows: [
                        {
                            id: uploader_id,
                            name: "doc",
                            view: "uploader",
                            value: "上传",
                            inputWidth: 120,
                            apiOnly: true,
                            hidden: newOptions["readonly"],
                            link: list_id,
                            accept: newOptions["accept"],
                            multiple: newOptions["multiple"],
                            upload: "/api/sys/docs?method=Upload",
                            on: {
                                onViewShow() {
                                    var value = _.size(options["value"]) > 2 ? options["value"] : "[]";

                                    $$(uploader_id).files.parse(JSON.parse(value));
                                },
                                // ⭐️ 在文件上传完成后，修改文件ID。否则无法查看和删除
                                onUploadComplete(response) {
                                    _.each(this.files.data.pull,
                                        (v, k) => {
                                            if (k != v.id) this.files.data.changeId(k, v.id);
                                        },
                                    );
                                }
                            }
                        },
                        {
                            id: list_id,
                            view: "list",
                            autoheight: true,
                            borderless: true,
                            type: "uploader",
                            template: (!newOptions["readonly"] ? "{common.removeIcon()}{common.percent()}" : "")
                                + "<div style='float:right'>#sizetext#</div><a>{common.fileName()}</a>",
                            on: {
                                onItemClick(id, e, node) {
                                    var item = $$(list_id).getItem(id);

                                    webix.ajax().response("blob").get("/api/sys/docs?method=Download", { id: id }, function (text, data) {
                                        webix.html.download(data, item ? item["name"] : id);
                                    });
                                }
                            }
                        }
                    ]
                },
            }
        ],
        on: {
            onAfterLoad() {
                // console.log("onAfterLoad", arguments)
            },
            onBindRequest() {
                // console.log("onBindRequest", arguments)
            },
            onValues() {
                // console.log("onValues", arguments)
            }
        },
        elementsConfig: options["elementsConfig"],
        getValue() {
            var values = _.map($$(uploader_id).files.data.pull, (value) => _.pick(value, "id", "value", "name", "sizetext", "status"));
            return JSON.stringify(values);
        }
    }
}

export { uploader };