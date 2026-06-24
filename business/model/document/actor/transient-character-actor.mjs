import AtReferencer from "../../../search/at-referencer.mjs"
import { CharacterAttribute } from "../../domain/_module.mjs";
import ArrayDataFieldBridge from "../array-data-field-bridge.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseActor from "./transient-base-actor.mjs"

/**
 * Represents the base contract for a "specific" actor "sub-type" that 
 * represents a "character", in the way the rule set regards them. 
 * 
 * @extends TransientBaseActor
 * 
 * @property {String} defaultImg Returns the default icon image path for this type of document. 
 * * Read-only.
 * * Abstract. 
 * @property {String} clazz Returns the class reference of this document. 
 * Required for use in the `getExtenders` method. 
 * * Read-only.
 * * Abstract. 
 * @property {String} id Returns the id of the document. 
 * * Read-only.
 * @property {String} img Returns the icon/image path of the document. 
 * @property {String} name Internal name. 
 * @property {String} description Html content.
 * @property {String | null} gmNotes Html content.
 * @property {String} documentName Returns the document type name. E. g. `"Actor"`
 * * Read-only.
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {Item | Actor} document Returns the encapsulated document instance. 
 * * Read-only.
 * @property {String} type Internal type name. E. g. `"skill"`
 * * Read-only.
 * @property {Object | undefined | null} pack A compendium pack this document is contained in. 
 * * Read-only.
 * @property {Object} system Passes through the `document.system` field. 
 * * Read-only.
 * 
 * @property {Array<TransientBaseItem>} items The embedded documents of this document. 
 * * Read-only. 
 * 
 * @property {Array<CharacterAttribute>} attributes The attributes of the character. 
 * * Read-only. 
 * 
 * @property {Object} derivedAttributes
 * * Read-only. 
 * @property {Number} derivedAttributes.baseInitiative Derived. 
 * * Read-only. 
 * @property {Number} derivedAttributes.sprintingSpeed Derived. 
 * * Read-only. 
 * @property {Number} derivedAttributes.stability Derived. 
 * * Read-only. 
 * 
 * @property {Object} actionPoints 
 * * Read-only. 
 * @property {Number} actionPoints.current The current number of action points of this character. 
 * @property {Number} actionPoints.maximum The maximum number of action points allowed for this character. 
 * 
 * @property {Object} meta
 * * Read-only. 
 * @property {Object} meta.actionPoints.refill 
 * * Read-only. 
 * @property {Number} meta.actionPoints.refill.amount The number of action points regained each turn for this character. 
 * @property {Boolean} meta.actionPoints.refill.enabled If `true`, automatic AP refilling is enabled for this character. 
 * @property {Object} meta.initiative 
 * * Read-only. 
 * @property {Number} meta.initiative.perTurn 
 * @property {Object} meta.itemOrders
 * * Read-only. 
 * @property {Array<Reference>} meta.itemOrders.languages 
 * @property {Array<Reference>} meta.itemOrders.skills 
 * @property {Array<Reference>} meta.itemOrders.injuries 
 * @property {Array<Reference>} meta.itemOrders.illnesses 
 * @property {Array<Reference>} meta.itemOrders.mutations 
 * @property {Array<Reference>} meta.itemOrders.luggage 
 * @property {Array<Reference>} meta.itemOrders.projects 
 * @property {Array<Reference>} meta.itemOrders.recipes 
 * 
 * @property {Object} personals
 * * Read-only. 
 * @property {Number} personals.age
 * @property {String} personals.ancestry
 * @property {String} personals.genderOrPronouns
 * 
 * @property {Object} virtuesAndVices
 * * Read-only. 
 * @property {Boolean} virtuesAndVices.enabled
 * @property {Number} virtuesAndVices.arrogantOrHumble Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.cowardlyOrCourageous Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.cruelOrMerciful Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.deceitfulOrHonest Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.lazyOrEnergetic Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.paranoidOrNaive Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.recklessOrPrudent Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.selfishOrConsiderate Ranges from `-2` to `+2`.
 * @property {Number} virtuesAndVices.vengefulOrForgiving Ranges from `-2` to `+2`.
 * 
 * @property {Object} drivers
 * * Read-only. 
 * @property {Boolean} drivers.enabled
 * @property {Object} drivers.ambition
 * * Read-only. 
 * @property {String} drivers.ambition.current
 * @property {Array<DriverHistoryEntry>} drivers.ambition.history
 * @property {Object} drivers.aspirations Html content.
 * * Read-only. 
 * @property {String} drivers.aspirations._0 Html content.
 * @property {String} drivers.aspirations._1 Html content.
 * @property {String} drivers.aspirations._2 Html content.
 * @property {Array<DriverHistoryEntry>} drivers.aspirations.history
 * @property {Object} drivers.reactions
 * * Read-only. 
 * @property {String} drivers.reactions._0 Html content.
 * @property {String} drivers.reactions._1 Html content.
 * @property {String} drivers.reactions._2 Html content.
 * @property {Array<DriverHistoryEntry>} drivers.reactions.history
 * 
 * @property {Object} health
 * * Read-only. 
 * @property {Object} health.hp 
 * * Read-only. 
 * @property {Number} health.hp.current
 * @property {Number} health.hp.temporary
 * @property {Number} health.hp.maximum Derived. 
 * * Read-only. 
 * @property {Object} health.stamina 
 * * Read-only. 
 * @property {Number} health.stamina.current 
 * @property {Number} health.stamina.maximum Derived. 
 * * Read-only. 
 * @property {Number} health.stamina.strain 
 * @property {Object} health.gritPoints 
 * * Read-only. 
 * @property {Boolean} health.gritPoints.enabled 
 * @property {Number} health.gritPoints.current 
 * @property {Array<InjuryShrugOff>} health.injuryShrugOffs 
 * @property {Object} health.deathSaves 
 * * Read-only. 
 * @property {Boolean} health.deathSaves.enabled 
 * @property {Number} health.deathSaves.current 
 * @property {Number} health.deathSaves.maximum Derived. 
 * * Read-only. 
 * @property {Array<TransientInjury>} health.injuries Derived. 
 * * Read-only. 
 * @property {Array<TransientIllness>} health.illnesss Derived. 
 * * Read-only. 
 * @property {Array<TransientMutation>} health.mutations Derived. 
 * * Read-only. 
 * @property {Array<TransientHealthCondition>} health.conditions Derived. 
 * * Read-only. 
 * 
 * @property {Object} assets
 * * Read-only. 
 * @property {Array<AssetSlot>} assets.slots 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.all 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.equipment Derived. All assets that are currently 
 * assigned to a slot. 
 * * Read-only. 
 * @property {Array<Reference>} assets._luggage Identifiers of all assets that should be in 
 * luggage. 
 * * Private. 
 * @property {Array<TransientAsset>} assets.luggage Derived. All assets currently in luggage. 
 * @property {Object} assets.property 
 * * Read-only. 
 * @property {PropertyLocation} assets.property.unknownLocation Catch-all for all assets 
 * that are in no specific location. 
 * @property {Array<PropertyLocation>} assets.property.locations User definable 
 * property locations. 
 * @property {Object} assets.bulk
 * * Read-only. 
 * @property {Number} assets.bulk.current Derived. 
 * * Read-only. 
 * @property {Number} assets.bulk.maximum Derived. 
 * * Read-only. 
 * 
 * @property {Object} advancement The current experience points of this character.  
 * * Read-only. 
 * @property {Boolean} advancement.enabled If `true`, then this character may advance their abilities. 
 * @property {Number} advancement.xp The current experience points of this character.  
 * @property {Array<AdvancementHistoryEntry>} advancement.history A log of when XP were gained and spent, 
 * and for what reason. 
 * 
 * @property {Object} skills
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.all Derived. Returns **all** skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.learning Derived. Returns all learning skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.known Derived. Returns all known skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.innate Derived. Returns all innate skills of the character. 
 * * Read-only. 

 * @property {Array<TransientTrait>} traits A list of character traits. These are **not** the same as 
 * personality traits! 
 * * Read-only. 
 * @property {Array<TransientProject>} projects
 * * Read-only. 
 */
export default class TransientCharacterActor extends TransientBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }

  /** @override */
  get clazz() { return TransientCharacterActor; }

  /**
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._attributes = new ArrayDataFieldBridge({
      document: this,
      dataPath: "system.attributes",
      dataClass: CharacterAttribute,
    });
  }

  /**
   * @override
   * 
   * Searches in: 
   * * Attribute names.
   * * Embedded documents.
   */
  resolveReference(comparableReference, propertyPath) {
    // Search attributes. 
    // const attribute = this.attributes.find(it =>
    //   it.name === comparableReference
    //   || game.i18n.localize(it.localizableName).toLowerCase() === comparableReference
    //   || game.i18n.localize(it.localizableAbbreviation).toLowerCase() === comparableReference
    // );
    // if (attribute !== undefined) {
    //   return attribute;
    // }

    const collectionsToSearch = [
      // this.skills.all,
      // this.assets.all,
      // this.health.injuries,
      // this.health.illnesses,
      // this.health.mutations,
      // this.health.scars,
      // this.health.conditions,
      // this.traits,
    ];
    return new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);
  }
}
