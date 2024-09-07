function importExcelButton(options) {
    options = _.extend({
        id: utils.UUID(),
        label: "Excel导入",
        onImport(docId) {
            // 文档ID
        }
    }, options);

    return {
        id: options["id"],
        view: "uploader",
        label: options["label"],
        type: "icon",
        icon: "mdi mdi-18px mdi-microsoft-excel",
        width: 100,
        inputWidth: 100,
        apiOnly: true,
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
        multiple: false,
        upload: "/api/sys/docs?method=Import",
        on: {
            onUploadComplete(res) {
                options["onImport"](res["value"]);
            }
        }
    };
};

export { importExcelButton };