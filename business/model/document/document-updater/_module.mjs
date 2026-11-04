import BulkDevDocumentUpdater from "./bulk-dev-document-updater.mjs";
import DocumentUpdater from "./document-updater.mjs";
import SyntheticDocumentUpdater from "./synthetic-document-updater.mjs";

export const documentUpdater = {
  DocumentUpdater: DocumentUpdater,
  SyntheticDocumentUpdater: SyntheticDocumentUpdater,
  BulkDevDocumentUpdater: BulkDevDocumentUpdater,
}
