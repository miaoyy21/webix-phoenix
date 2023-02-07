var tree = {};

tree.buildTree = function (items, parentId, idField, parentIdField) {
    if (!idField) idField = "id";
    if (!parentIdField) parentIdField = "parent_id_";

    var parts = _.partition(items, (item) =>
        (_.isUndefined(item[parentIdField]) && _.isNull(parentId)) ||
        (_.isNull(item[parentIdField]) && _.isUndefined(parentId)) ||
        (item[parentIdField] === parentId));

    return _.map(parts[0], (root) => {
        var node = _.clone(root);

        var children = tree.buildTree(parts[1], root[idField], idField, parentIdField);
        if (_.size(children)) {
            node.data = children;
        }

        return node;
    });
}

tree.builder = function (view, url, callback) {
    webix.extend(view, webix.OverlayBox).hideOverlay();
    webix.extend(view, webix.ProgressBar).showProgress();

    webix.ajax(url)
        .then((data) => {
            view.define("data", tree.buildTree(data.json(), null))

            webix.extend(view, webix.ProgressBar).hideProgress();
            if (!view.count()) {
                webix.extend(view, webix.OverlayBox).showOverlay("无检索数据");
                return;
            }

            _.isFunction(callback) && callback();
        })
}

tree.path = function (tree, id) {
    var path = [];
    var fn = function (cid) {
        var pid = tree.getParentId(cid);
        if (pid) {
            path.push(pid);
            fn(pid);
        }
    }

    fn(id);
    return path;
}

export { tree };