import { open } from "./window";

function builder() {
    var dview = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar", cols: [
                    {
                        view: "search", placeholder: "请输入流程名称等 ...",
                        on: {
                            onTimedKeyPress() {
                                var value = this.getValue().toLowerCase();

                                $$(dview).filter(function (obj) {
                                    return (obj["diagram_code_"] + "|" + obj["diagram_name_"] + "|" + (obj["description_"] || "")).toLowerCase().indexOf(value) != -1;
                                });
                            }
                        }
                    },
                    {}
                ]
            },
            {
                view: "dataview",
                id: dview,
                tooltip: "【#diagram_code_#】#diagram_name_#</br>#description_#",
                template: `
                    <div class='webix_strong'> 
                        <span class='phoenix_primary_icon mdi-18px #icon_#'></span>
                        【#diagram_code_#】#diagram_name_#
                    </div> 
                    <div class='webix_light' style="height:24px;text-indent:1em;">#description_#</div>
                    <div style="text-align:right">
                        <button webix_tooltip="发起" type="button" class="btn_launch webix_icon_button" style="height:36px;width:36px;">
                            <span class="webix_icon phoenix_warning_icon mdi-dark mdi-18px mdi mdi-arrow-right-circle-outline"></span>
                        </button> 
                    </div>`,
                type: {
                    type: "tiles",
                    height: 100,
                    width: 360,
                    templateLoading: `<div class="lds-dual-ring"></div>`,
                },
                onClick: {
                    btn_launch(e, id) {
                        var row = this.getItem(id);
                        if (!row) return;

                        open(_.pick(row, "diagram_id_", "diagram_code_", "diagram_name_", "keyword_"));
                    },
                },
                url: "/api/wf/diagrams?method=Publish&scope=SIMPLE",
                on: {
                    "data->onStoreUpdated": function () {
                        this.data.each(function (obj, i) {
                            obj.index = i + 1;
                        })
                    },
                    onBeforeLoad() {
                        webix.extend(this, webix.ProgressBar).showProgress();
                    },
                    onAfterLoad() {
                        webix.extend(this, webix.ProgressBar).hideProgress();
                    },
                }
            }
        ]
    }
}

export { builder }
