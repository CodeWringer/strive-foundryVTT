import { common } from "../../../common/_module.mjs";
import BaseActorDocument from "./actor/base-actor-document.mjs";
import TransientBaseCharacterActor from "./actor/character-actor-document.mjs";
import PlainActorDocument from "./actor/plain-actor-document.mjs";
import { GameSystemActor } from "./actor/actor.mjs";
import { GameSystemItem } from "./item/item.mjs";
import { DOCUMENT_COLLECTION_SOURCES, DocumentCollectionSource } from "./document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "./document-fetcher/document-fetcher.mjs";
import { DocumentIndex } from "./document-fetcher/document-index.mjs";
import AssetDocument from "./item/asset-document.mjs";
import FateCardDocument from "./item/fate-card-document.mjs";
import HealthConditionDocument from "./item/health-condition-document.mjs";
import IllnessDocument from "./item/illness-document.mjs";
import InjuryDocument from "./item/injury-document.mjs";
import MutationDocument from "./item/mutation-document.mjs";
import ProjectDocument from "./item/project-document.mjs";
import TraitDocument from "./item/trait-document.mjs";
import LanguageDocument from "./item/language-document.mjs";
import SkillDocument from "./item/skill-document.mjs";
import RecipeDocument from "./item/recipe-document.mjs";
import CharacterActorDocument from "./actor/character-actor-document.mjs";
import { documentUpdater } from "./document-updater/_module.mjs";
import { dataBridge } from "./data-bridge/_module.mjs";

/**
 * Wraps the `business.model.document` module, which contains all the transient 
 * document models as well as associate classes for fetching, creating and 
 * updating transient documents. 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const document = {
  dataBridge: dataBridge,
  fetcher: {
    DocumentCollectionSource: DocumentCollectionSource,
    DOCUMENT_COLLECTION_SOURCES: DOCUMENT_COLLECTION_SOURCES,
    DocumentFetcher: DocumentFetcher,
    DocumentIndex: DocumentIndex,
  },
  updater: documentUpdater,
  actor: {
    BaseActorDocument: BaseActorDocument,
    TransientBaseCharacterActor: TransientBaseCharacterActor,
    PlainActorDocument: PlainActorDocument,
    CharacterActorDocument: CharacterActorDocument,
    GameSystemActor: GameSystemActor,
  },
  item: {
    GameSystemItem: GameSystemItem,
    AssetDocument: AssetDocument,
    FateCardDocument: FateCardDocument,
    HealthConditionDocument: HealthConditionDocument,
    IllnessDocument: IllnessDocument,
    InjuryDocument: InjuryDocument,
    LanguageDocument: LanguageDocument,
    MutationDocument: MutationDocument,
    ProjectDocument: ProjectDocument,
    RecipeDocument: RecipeDocument,
    SkillDocument: SkillDocument,
    TraitDocument: TraitDocument,
  },
  init() {
    common.util.constants.enrichConstant(DOCUMENT_COLLECTION_SOURCES);
    CONFIG.Actor.documentClass = GameSystemActor;
    CONFIG.Item.documentClass = GameSystemItem;
  },
};
