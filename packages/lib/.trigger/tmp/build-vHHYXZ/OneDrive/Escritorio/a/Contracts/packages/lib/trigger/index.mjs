import {
  extractBodyContractTask
} from "../../../../../../../chunk-C6URBZOY.mjs";
import "../../../../../../../chunk-CPIDBU7G.mjs";
import "../../../../../../../chunk-MC5LTTK4.mjs";
import {
  init_esm
} from "../../../../../../../chunk-GTHMB43D.mjs";

// trigger/index.ts
init_esm();
var getExtractBodyContractTask = async (userId, documentId, urlDocument, teamId) => {
  const { id } = await extractBodyContractTask.trigger({
    userId,
    documentId,
    teamId,
    urlDocument
  });
  return id;
};
export {
  getExtractBodyContractTask
};
//# sourceMappingURL=index.mjs.map
