import { json } from "./json";
import { datatable } from "./datatable";
import { tree } from "./tree";
import { list } from "./list";

var parses = {};

parses.json = json;
parses.datatable = datatable;
parses.tree = tree;
parses.list = list;

export { parses };