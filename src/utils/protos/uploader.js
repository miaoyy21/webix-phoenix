function uploader(options) {
    var uploader_id = utils.UUID();
    var list_id = utils.UUID();

    console.log(options);

    // 默认配置
    var _options = _.extend(
        {
            name: "uploader_",   // 控件名
            label: "附件",   // 显示名称
            editable: true, // 是否可以编辑（删除，上传）
            accept: "*",    // 上传的文件类型  https://en.wikipedia.org/wiki/Media_type#List_of_common_media_types
            multiple: true, // 是否可以多文件上传
        },
        options
    )

    return {
        view: "fieldset",
        label: _options["label"],
        body: {
            rows: [
                {
                    id: uploader_id,
                    view: "uploader",
                    value: "上传",
                    inputWidth: 120,
                    apiOnly: true,
                    hidden: !_options["editable"],
                    name: _options["name"],
                    link: list_id,
                    accept: _options["accept"],
                    multiple: _options["multiple"],
                    upload: "/api/sys/docs?method=Upload",
                    on: {
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
                    template: (_options["editable"] ? "{common.removeIcon()}{common.percent()}" : "")
                        + "<div style='float:right'>#sizetext#</div><a>{common.fileName()}</a>",
                    on: {
                        onItemClick(id, e, node) {
                            console.log(id);
                            console.log($$(uploader_id).files.data.pull);


                            var item = $$(list_id).getItem(id);
                            webix.ajax().response("blob").post("/api/sys/docs?method=Download", { id: id }, function (text, data) {
                                // TODO 设置刚上传成功的文件名
                                webix.html.download(data, item ? item["name"] : id);
                            });
                        }
                    }
                }
            ]
        },
    }
}

export { uploader };