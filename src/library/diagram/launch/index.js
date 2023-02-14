
function builder() {
    var dview = utils.UUID();
    var big_film_set = [
        { "id": 1, "code_": "A01", "name_": "流程名称需要1个字", "icon_": "mdi mdi-rocket-launch", "description_": "The Shawshank Redemption 1 dsfdsfsdfemption 1 dsfdsfsdfgstreremption 1 dsfdsfsdfgstreremption 1 dsfdsfsdfgstreremption 1 dsfdsfsdfgstreremption 1 dsfdsfsdfgstreremption 1 dsfdsfsdfgstrergstreretetre fdgfdsgsfdsg", "publish_at_": "2023-01-02 13:21:23" },
        { "id": 2, "code_": "A02", "name_": "流程名称需要2个字", "icon_": "mdi mdi-account-details", "description_": "The Shawshank Redemption 2", "publish_at_": "2023-01-02 11:21:23" },
        { "id": 3, "code_": "A03", "name_": "流程名称需要3个字", "icon_": "mdi mdi-account-multiple-outline", "description_": "The Shawshank Redemption 3", "publish_at_": "2023-01-02 12:21:23" },
        { "id": 4, "code_": "A04", "name_": "流程名称需要4个字", "icon_": "mdi mdi-cogs", "description_": "The Shawshank Redemption 4", "publish_at_": "2023-01-02 14:21:23" },
        { "id": 5, "code_": "A05", "name_": "流程名称需要5个字", "icon_": "mdi mdi-account-network-outline", "description_": "The Shawshank Redemption 5", "publish_at_": "2023-01-02 15:21:23" },
        { "id": 6, "code_": "A06", "name_": "流程名称需要6个字", "icon_": "mdi mdi-file-tree-outline", "description_": "The Shawshank Redemption 6", "publish_at_": "2023-01-02 16:21:23" },
        { "id": 7, "code_": "A07", "name_": "流程名称需要7个字", "icon_": "mdi mdi-format-list-bulleted", "description_": "The Shawshank Redemption 7", "publish_at_": "2023-01-02 17:21:23" },
    ];

    return {
        rows: [
            {
                view: "toolbar", cols: [
                    {
                        view: "search", align: "center", placeholder: "请输入流程名称等 ...", id: "search",
                        on: {
                            onTimedKeyPress() {
                                var value = this.getValue().toLowerCase();

                                $$(dview).filter(function (obj) {
                                    return (obj["code_"] + "|" + obj["name_"] + "|" + (obj["description_"] || "")).toLowerCase().indexOf(value) != -1;
                                });
                            }
                        }
                    },
                ]
            },
            {
                view: "dataview",
                id: dview,
                tooltip: "【#code_#】#name_#</br>#description_#",
                template: `
                    <div class='webix_strong'> 
                        <span class='phoenix_primary_icon mdi-18px #icon_#'></span>
                        【#code_#】#name_#
                    </div> 
                    <div class='webix_light' style="height:24px;text-indent:2em;">#description_#</div>
                    <div style="text-align:right">
                        <button webix_tooltip="发起" type="button" class="btn_launch webix_icon_button" style="height:30px;width:30px;">
                            <span class="webix_icon phoenix_warning_icon mdi-dark mdi-18px mdi mdi-arrow-right-circle-outline"></span>
                        </button> 
                    </div>`,
                type: {
                    type: "tiles",
                    height: 90,
                    width: 360,
                    templateLoading: `<div class="lds-dual-ring"></div>`,
                },
                select: true,
                data: big_film_set,
                onClick: {
                    btn_launch(e, item) {
                        console.log("click btn_launch", arguments);
                    },
                },
                // url(params) {
                //     const promise = webix.promise.defer();
                //     // imitate slow resopnse
                //     setTimeout(() => {
                //         webix.ajax()
                //             .get("//docs.webix.com/samples/server/packages_dynamic", params)
                //             .then(result => promise.resolve(result));
                //     }, params ? 1500 : 100);
                //     return promise;
                // },
            }
        ]
    }
}

export { builder }
