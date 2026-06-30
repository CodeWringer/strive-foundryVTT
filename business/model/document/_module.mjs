import { common } from "../../../common/_module.mjs";
import TransientDocument from "./transient-document.mjs";
import TransientBaseItem from "./item/transient-base-item.mjs";
import TransientBaseActor from "./actor/transient-base-actor.mjs";
import TransientBaseCharacterActor from "./actor/transient-character-actor.mjs";
import TransientPlainActor from "./actor/transient-plain-actor.mjs";
import { GameSystemActor } from "./actor/actor.mjs";
import { GameSystemItem } from "./item/item.mjs";
import { DOCUMENT_COLLECTION_SOURCES, DocumentCollectionSource } from "./document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "./document-fetcher/document-fetcher.mjs";
import { DocumentIndex } from "./document-fetcher/document-index.mjs";
import BulkDevDocumentUpdater from "./document-updater/bulk-dev-document-updater.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";
import TransientAsset from "./item/transient-asset.mjs";
import TransientFateCard from "./item/transient-fate-card.mjs";
import TransientHealthCondition from "./item/transient-health-condition.mjs";
import TransientIllness from "./item/transient-illness.mjs";
import TransientInjury from "./item/transient-injury.mjs";
import TransientMutation from "./item/transient-mutation.mjs";
import TransientProject from "./item/transient-project.mjs";
import TransientTrait from "./item/transient-trait.mjs";
import DataFieldBridge from "./data-field-bridge.mjs";
import ArrayDataFieldBridge from "./array-data-field-bridge.mjs";
import TransientLanguage from "./item/transient-language.mjs";
import TransientSkill from "./item/transient-skill.mjs";
import TransientRecipe from "./item/transient-recipe.mjs";
import ModifiableDataFieldBridge from "./modifiable-data-field-bridge.mjs";
import TransientCharacterActor from "./actor/transient-character-actor.mjs";

/**
 * Wraps the `business.model.document` module, which contains all the transient 
 * document models as well as associate classes for fetching, creating and 
 * updating transient documents. 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const document = {
  TransientDocument: TransientDocument,
  DataFieldBridge: DataFieldBridge,
  ArrayDataFieldBridge: ArrayDataFieldBridge,
  ModifiableDataFieldBridge: ModifiableDataFieldBridge,
  fetcher: {
    DocumentCollectionSource: DocumentCollectionSource,
    DOCUMENT_COLLECTION_SOURCES: DOCUMENT_COLLECTION_SOURCES,
    DocumentFetcher: DocumentFetcher,
    DocumentIndex: DocumentIndex,
  },
  updater: {
    BulkDevDocumentUpdater: BulkDevDocumentUpdater,
    DocumentUpdater: DocumentUpdater,
  },
  actor: {
    TransientBaseActor: TransientBaseActor,
    TransientBaseCharacterActor: TransientBaseCharacterActor,
    TransientPlainActor: TransientPlainActor,
    TransientCharacterActor: TransientCharacterActor,
    GameSystemActor: GameSystemActor,
  },
  item: {
    GameSystemItem: GameSystemItem,
    TransientAsset: TransientAsset,
    TransientBaseItem: TransientBaseItem,
    TransientFateCard: TransientFateCard,
    TransientHealthCondition: TransientHealthCondition,
    TransientIllness: TransientIllness,
    TransientInjury: TransientInjury,
    TransientLanguage: TransientLanguage,
    TransientMutation: TransientMutation,
    TransientProject: TransientProject,
    TransientRecipe: TransientRecipe,
    TransientSkill: TransientSkill,
    TransientTrait: TransientTrait,
  },
  init() {
    common.util.constants.enrichConstant(DOCUMENT_COLLECTION_SOURCES);
    CONFIG.Actor.documentClass = GameSystemActor;
    CONFIG.Item.documentClass = GameSystemItem;
  },
};
