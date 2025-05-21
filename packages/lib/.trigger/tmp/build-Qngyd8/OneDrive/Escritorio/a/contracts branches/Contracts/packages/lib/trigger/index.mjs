import {
  extractBodyContractTask
} from "../../../../../../../../chunk-5GL4673B.mjs";
import "../../../../../../../../chunk-Q4E3NULC.mjs";
import "../../../../../../../../chunk-F2LHJZUF.mjs";
import {
  init_esm
} from "../../../../../../../../chunk-X4WC7F2Z.mjs";

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
