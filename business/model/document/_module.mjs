import TransientDocument from "./transient-document.mjs";
import TransientBaseItem from "./item/transient-base-item.mjs";
import TransientBaseActor from "./actor/transient-base-actor.mjs";
import TransientBaseCharacterActor from "./actor/transient-base-character-actor.mjs";
import TransientNpc from "./actor/transient-npc.mjs";
import TransientPc from "./actor/transient-pc.mjs";
import TransientPlainActor from "./actor/transient-plain-actor.mjs";
import { GameSystemActor } from "./actor/actor.mjs";
import { GameSystemItem } from "./item/item.mjs";
import { DOCUMENT_COLLECTION_SOURCES, DocumentCollectionSource } from "./document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "./document-fetcher/document-fetcher.mjs";
import { DocumentIndex } from "./document-fetcher/document-index.mjs";
import BulkDevDocumentUpdater from "./document-updater/bulk-dev-document-updater.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";
import DocumentCreationStrategy from "./creation/document-creation-strategy.mjs";
import ExpertiseCreationStrategy from "./creation/expertise-creation-strategy.mjs";
import InjuryCreationStrategy from "./creation/injury-creation-strategy.mjs";
import RollableSpecificDocumentCreationStrategy from "./creation/rollable-specific-document-creation-strategy.mjs";
import SpecificDocumentCreationStrategy from "./creation/specific-document-creation-strategy.mjs";
import TransientSkill from "./item/skill/transient-skill.mjs";
import Expertise from "../domain/skill/expertise.mjs";
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

export {
  TransientDocument,
  DataFieldBridge,
  ArrayDataFieldBridge,
  DOCUMENT_COLLECTION_SOURCES,
  DocumentCollectionSource,
  DocumentIndex,
  DocumentFetcher,
  BulkDevDocumentUpdater,
  DocumentCreationStrategy,
  ExpertiseCreationStrategy,
  InjuryCreationStrategy,
  RollableSpecificDocumentCreationStrategy,
  SpecificDocumentCreationStrategy,
  DocumentUpdater,
  TransientBaseItem,
  TransientSkill,
  Expertise,
  GameSystemItem,
  TransientAsset,
  TransientFateCard,
  TransientHealthCondition,
  TransientIllness,
  TransientInjury,
  TransientMutation,
  TransientProject,
  TransientTrait,
  TransientBaseActor,
  TransientBaseCharacterActor,
  TransientNpc,
  TransientPc,
  TransientPlainActor,
  GameSystemActor,
};

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
  creation: {
    DocumentCreationStrategy: DocumentCreationStrategy,
    ExpertiseCreationStrategy: ExpertiseCreationStrategy,
    InjuryCreationStrategy: InjuryCreationStrategy,
    RollableSpecificDocumentCreationStrategy: RollableSpecificDocumentCreationStrategy,
    SpecificDocumentCreationStrategy: SpecificDocumentCreationStrategy,
  },
  actor: {
    TransientBaseActor: TransientBaseActor,
    TransientBaseCharacterActor: TransientBaseCharacterActor,
    TransientNpc: TransientNpc,
    TransientPc: TransientPc,
    TransientPlainActor: TransientPlainActor,
    GameSystemActor: GameSystemActor,
  },
  item: {
    TransientBaseItem: TransientBaseItem,
    TransientSkill: TransientSkill,
    Expertise: Expertise,
    GameSystemItem: GameSystemItem,
    TransientAsset: TransientAsset,
    TransientFateCard: TransientFateCard,
    TransientHealthCondition: TransientHealthCondition,
    TransientIllness: TransientIllness,
    TransientInjury: TransientInjury,
    TransientMutation: TransientMutation,
    TransientProject: TransientProject,
    TransientTrait: TransientTrait,
  },
  init() {
    CONFIG.Actor.documentClass = GameSystemActor;
    CONFIG.Item.documentClass = GameSystemItem;
  },
};
