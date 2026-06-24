import AtReferencer from "../../../search/at-referencer.mjs"
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
 * @property {Object} derivedAttributes
 * * Read-only. 
 * @property {Number} derivedAttributes.baseInitiative 
 * * Read-only. 
 * @property {Number} derivedAttributes.sprintingSpeed 
 * * Read-only. 
 * @property {Number} derivedAttributes.stability
 * * Read-only. 
 * @property {Object} actionPoints 
 * * Read-only. 
 * @property {Number} actionPoints.current The current number of action points of this character. 
 * @property {Number} actionPoints.maximum The maximum number of action points allowed for this character. 
 * @property {Object} actionPoints.refill 
 * * Read-only. 
 * @property {Number} actionPoints.refill.amount The number of action points regained each turn for this character. 
 * @property {Boolean} actionPoints.refill.enabled If `true`, automatic AP refilling is enabled for this character. 
 * @property {Object} initiative 
 * * Read-only. 
 * @property {Number} initiative.perTurn 
 * 
 * @property {Object} person
 * * Read-only. 
 * @property {Number} person.age
 * @property {String} person.species
 * @property {String} person.culture
 * @property {String} person.sex
 * @property {String} person.appearance
 * @property {String} person.biography
 * @property {Object} skills
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.all Returns **all** skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.learning Returns all learning skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.known Returns all known skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.innate Returns all innate skills of the character. 
 * * Read-only. 
 * @property {Object} health
 * * Read-only. 
 * @property {Array<TransientInjury>} health.injuries 
 * * Read-only. 
 * @property {Array<TransientIllness>} health.illnesss 
 * * Read-only. 
 * @property {Array<TransientMutation>} health.mutations 
 * * Read-only. 
 * @property {Array<TransientHealthCondition>} health.conditions
 * * Read-only. 
 * @property {Number} health.HP 
 * @property {Number} health.maxHP 
 * * Read-only. 
 * @property {Number} health.maxHpModifier 
 * @property {Number} health.modifiedMaxHp 
 * * Read-only. 
 * @property {Number} health.injuryShrugOffs 
 * @property {Number} health.exhaustion 
 * @property {Number} health.maxExhaustion 
 * * Read-only. 
 * @property {Number} health.maxExhaustionModifier 
 * @property {Number} health.modifiedMaxExhaustion 
 * * Read-only. 
 * @property {Number} health.deathSaves
 * @property {Number} health.deathSaveLimit
 * @property {Object} assets
 * * Read-only. 
 * @property {Array<CharacterAssetSlotGroup>} assets.equipmentSlotGroups 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.all 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.equipment 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.luggage 
 * @property {Array<TransientAsset>} assets.property 
 * * Read-only. 
 * @property {Number} assets.currentBulk
 * * Read-only. 
 * @property {Number} assets.maxBulk
 * * Read-only. 
 * @property {Object} personalityTraits
 * * Read-only
 * @property {Number} personalityTraits.arrogantOrHumble
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.cowardlyOrCourageous
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.cruelOrMerciful
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.deceitfulOrHonest
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.lazyOrEnergetic
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.paranoidOrNaive
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.recklessOrPrudent
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.selfishOrConsiderate
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.vengefulOrForgiving
 * * Ranges from -3 to +3
 * @property {Object} driverSystem
 * * Read-only. 
 * @property {String} driverSystem.ambition
 * @property {Object} driverSystem.aspirations
 * @property {String} driverSystem.aspirations.0
 * @property {String} driverSystem.aspirations.1
 * @property {String} driverSystem.aspirations.2
 * @property {Object} driverSystem.reactions
 * @property {String} driverSystem.reactions.0
 * @property {String} driverSystem.reactions.1
 * @property {String} driverSystem.reactions.2
 * @property {Object} gritPoints
 * * Read-only. 
 * @property {Number} gritPoints.current The current number of grit points of this character. 
 * @property {Boolean} gritPoints.enabled If `true`, grit points are enabled character. 

 * @property {Object} advancement The current experience points of this character.  
 * * Read-only. 
 * @property {Number} advancement.xp The current experience points of this character.  
 * @property {Boolean} advancement.advancementEnabled If `true`, then this character may advance their abilities. 
 * * Read-only
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
