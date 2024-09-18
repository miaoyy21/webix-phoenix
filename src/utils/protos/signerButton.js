function signerButton(options) {
    options = _.extend({
        id: utils.UUID(),
        onSigner(docId) {
            // 文档ID
        }
    }, options);

    return {
        id: options["id"],
        view: "uploader",
        type: "icon",
        label: "上传",
        icon: "mdi mdi-18px mdi-signature-text",
        width: 80,
        inputWidth: 80,
        apiOnly: true,
        accept: "image/png,image/jpeg",
        multiple: false,
        upload: "/api/sys/docs?method=Signer",
        on: {
            onUploadComplete(res) {
                options["onSigner"](res["value"]);
            }
        }
    };
};

export { signerButton };