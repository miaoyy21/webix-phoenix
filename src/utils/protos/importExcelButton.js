function importExcelButton(options) {
    options = options || {
        onImport(docId) {
            // 文档ID
        }
    };

    return {
        view: "uploader",
        label: "Excel导入",
        type: "icon",
        icon: "mdi mdi-18px mdi-microsoft-excel",
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