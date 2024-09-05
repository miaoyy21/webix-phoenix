import { datatable } from "./datatable";
import { tree } from "./tree";
import { list } from "./list";
import { form } from "./form";
import { uploader } from "./uploader";
import { checkbox } from "./checkbox";
import { importExcelButton } from "./importExcelButton";
import { importExcel } from "./importExcel";

import { window } from "./window";
import { pager } from "./pager";


var protos = {};

protos = _.extend(protos, { datatable, tree, list });
protos = _.extend(protos, { form, uploader, checkbox, importExcelButton, importExcel });
protos = _.extend(protos, { window, pager });

export { protos };