function builder() {
    var tree = utils.protos.tree();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    tree.actions.add(),
                    tree.actions.addChild(),
                    tree.actions.remove(),
                ]
            },
            { view: "toolbar", cols: [tree.actions.filter({ placeholder: "请输入..." })] },
            tree
        ],
    };
}

export { builder };