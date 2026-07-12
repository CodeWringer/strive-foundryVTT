import { common } from "../../../../common/_module.mjs";
import AtReferencer from "../../../search/at-referencer.mjs"
import AdvancementHistoryEntry from "../../domain/advancement-history-entry.mjs";
import AssetSlot from "../../domain/asset/asset-slot.mjs";
import PropertyLocation from "../../domain/asset/property-location.mjs";
import CharacterAttribute from "../../domain/attribute/character-attribute.mjs";
import { ITEM_TYPES } from "../../domain/const/item-types.mjs";
import DriverHistoryEntry from "../../domain/driver-history-entry.mjs";
import InjuryShrugOff from "../../domain/health/injury-shrug-off.mjs";
import Modifier from "../../domain/modifier.mjs";
import Reference from "../../domain/reference.mjs";
import Ruleset from "../../domain/ruleset.mjs";
import ArrayDataFieldBridge from "../array-data-field-bridge.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
import TransientAsset from "../item/transient-asset.mjs";
import TransientHealthCondition from "../item/transient-health-condition.mjs";
import TransientIllness from "../item/transient-illness.mjs";
import TransientInjury from "../item/transient-injury.mjs";
import TransientMutation from "../item/transient-mutation.mjs";
import TransientRecipe from "../item/transient-recipe.mjs";
import TransientSkill from "../item/transient-skill.mjs";
import TransientTrait from "../item/transient-trait.mjs";
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
 * @property {Boolean} meta.isPlayerCharacter
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
 * @property {Array<TransientAsset>} assets.all Derived. 
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
 * * Read-only. 
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
 * @property {Array<TransientRecipe>} recipes
 * * Read-only. 
 * 
 * @property {Object} modifiers 
 * * Read-only. 
 * @property {Array<Modifier>} modifiers.all Derived. Contains all Modifiers. 
 * * Read-only. 
 * @property {Array<Modifier>} modifiers.items Derived. Contains all Modifiers fetched from 
 * embedded Item documents. 
 * * Read-only. 
 * @property {Array<Modifier>} modifiers.own Modifiers directly applied to this character, 
 * not stemming from any embedded Item documents. 
 * 
 * @property {Boolean} isNpc
 */
export default class TransientCharacterActor extends TransientBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }

  /** @override */
  get clazz() { return TransientCharacterActor; }

  /**
   * @type {Array<CharacterAttribute>}
   */
  get attributes() { return this._attributes.value; }
  set attributes(value) { this._attributes.value = value; }

  get actionPoints() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get current() { return thiz._actionPoints.current.value; },
      set current(value) { thiz._actionPoints.current.value = value; },

      /**
       * @type {Number}
       */
      get maximum() { return thiz._actionPoints.maximum.value; },
      set maximum(value) { thiz._actionPoints.maximum.value = value; },
    };
  }

  get meta() {
    const thiz = this;
    return {
      actionPoints: {
        refill: {
          /**
           * @type {Number}
           */
          get amount() { return thiz._meta.actionPoints.refill.amount.value; },
          set amount(value) { thiz._meta.actionPoints.refill.amount.value = value; },

          /**
           * @type {Boolean}
           */
          get enabled() { return thiz._meta.actionPoints.refill.enabled.value; },
          set enabled(value) { thiz._meta.actionPoints.refill.enabled.value = value; },
        },
      },
      initiative: {
        /**
         * @type {Number}
         */
        get perTurn() { return thiz._meta.initiative.perTurn.value; },
        set perTurn(value) { thiz._meta.initiative.perTurn.value = value; },
      },
      itemOrders: {
        /**
         * @type {Array<Reference>}
         */
        get languages() { return thiz._meta.itemOrders.languages.value; },
        set languages(value) { thiz._meta.itemOrders.languages.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get skills() { return thiz._meta.itemOrders.skills.value; },
        set skills(value) { thiz._meta.itemOrders.skills.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get injuries() { return thiz._meta.itemOrders.injuries.value; },
        set injuries(value) { thiz._meta.itemOrders.injuries.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get illnesses() { return thiz._meta.itemOrders.illnesses.value; },
        set illnesses(value) { thiz._meta.itemOrders.illnesses.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get mutations() { return thiz._meta.itemOrders.mutations.value; },
        set mutations(value) { thiz._meta.itemOrders.mutations.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get luggage() { return thiz._meta.itemOrders.luggage.value; },
        set luggage(value) { thiz._meta.itemOrders.luggage.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get projects() { return thiz._meta.itemOrders.projects.value; },
        set projects(value) { thiz._meta.itemOrders.projects.value = value; },
        /**
         * @type {Array<Reference>}
         */
        get recipes() { return thiz._meta.itemOrders.recipes.value; },
        set recipes(value) { thiz._meta.itemOrders.recipes.value = value; },
      },
      /**
       * @type {Boolean}
       */
      get isPlayerCharacter() { return thiz._meta.isPlayerCharacter.value; },
      set isPlayerCharacter(value) { thiz._meta.isPlayerCharacter.value = value; },
    };
  }

  get personals() {
    const thiz = this;
    return {
      /**
       * @type {String}
       */
      get age() { return thiz._personals.age.value; },
      set age(value) { thiz._personals.age.value = value; },
      /**
       * @type {String}
       */
      get ancestry() { return thiz._personals.ancestry.value; },
      set ancestry(value) { thiz._personals.ancestry.value = value; },
      /**
       * @type {String}
       */
      get genderOrPronouns() { return thiz._personals.genderOrPronouns.value; },
      set genderOrPronouns(value) { thiz._personals.genderOrPronouns.value = value; },
    };
  }

  get virtuesAndVices() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._virtuesAndVices.enabled.value; },
      set enabled(value) { thiz._virtuesAndVices.enabled.value = value; },
      /**
       * @type {Number}
       */
      get arrogantOrHumble() { return thiz._virtuesAndVices.arrogantOrHumble.value; },
      set arrogantOrHumble(value) { thiz._virtuesAndVices.arrogantOrHumble.value = value; },
      /**
       * @type {Number}
       */
      get cowardlyOrCourageous() { return thiz._virtuesAndVices.cowardlyOrCourageous.value; },
      set cowardlyOrCourageous(value) { thiz._virtuesAndVices.cowardlyOrCourageous.value = value; },
      /**
       * @type {Number}
       */
      get cruelOrMerciful() { return thiz._virtuesAndVices.cruelOrMerciful.value; },
      set cruelOrMerciful(value) { thiz._virtuesAndVices.cruelOrMerciful.value = value; },
      /**
       * @type {Number}
       */
      get deceitfulOrHonest() { return thiz._virtuesAndVices.deceitfulOrHonest.value; },
      set deceitfulOrHonest(value) { thiz._virtuesAndVices.deceitfulOrHonest.value = value; },
      /**
       * @type {Number}
       */
      get lazyOrEnergetic() { return thiz._virtuesAndVices.lazyOrEnergetic.value; },
      set lazyOrEnergetic(value) { thiz._virtuesAndVices.lazyOrEnergetic.value = value; },
      /**
       * @type {Number}
       */
      get paranoidOrNaive() { return thiz._virtuesAndVices.paranoidOrNaive.value; },
      set paranoidOrNaive(value) { thiz._virtuesAndVices.paranoidOrNaive.value = value; },
      /**
       * @type {Number}
       */
      get recklessOrPrudent() { return thiz._virtuesAndVices.recklessOrPrudent.value; },
      set recklessOrPrudent(value) { thiz._virtuesAndVices.recklessOrPrudent.value = value; },
      /**
       * @type {Number}
       */
      get selfishOrConsiderate() { return thiz._virtuesAndVices.selfishOrConsiderate.value; },
      set selfishOrConsiderate(value) { thiz._virtuesAndVices.selfishOrConsiderate.value = value; },
      /**
       * @type {Number}
       */
      get vengefulOrForgiving() { return thiz._virtuesAndVices.vengefulOrForgiving.value; },
      set vengefulOrForgiving(value) { thiz._virtuesAndVices.vengefulOrForgiving.value = value; },
    };
  }

  get drivers() {
    const thiz = this;
    return {
      ambition: {
        /**
         * @type {String}
         */
        get current() { return thiz._drivers.ambition.current.value; },
        set current(value) { thiz._drivers.ambition.current.value = value; },
        /**
         * @type {Array<DriverHistoryEntry>}
         */
        get history() { return thiz._drivers.ambition.history.value; },
        set history(value) { thiz._drivers.ambition.history.value = value; },
      },
      aspirations: {
        /**
         * @type {String}
         */
        get _0() { return thiz._drivers.aspirations._0.value; },
        set _0(value) { thiz._drivers.aspirations._0.value = value; },
        /**
         * @type {String}
         */
        get _1() { return thiz._drivers.aspirations._1.value; },
        set _1(value) { thiz._drivers.aspirations._1.value = value; },
        /**
         * @type {String}
         */
        get _2() { return thiz._drivers.aspirations._2.value; },
        set _2(value) { thiz._drivers.aspirations._2.value = value; },
        /**
         * @type {Array<DriverHistoryEntry>}
         */
        get history() { return thiz._drivers.aspirations.history.value; },
        set history(value) { thiz._drivers.aspirations.history.value = value; },
      },
      reactions: {
        /**
         * @type {String}
         */
        get _0() { return thiz._drivers.reactions._0.value; },
        set _0(value) { thiz._drivers.reactions._0.value = value; },
        /**
         * @type {String}
         */
        get _1() { return thiz._drivers.reactions._1.value; },
        set _1(value) { thiz._drivers.reactions._1.value = value; },
        /**
         * @type {String}
         */
        get _2() { return thiz._drivers.reactions._2.value; },
        set _2(value) { thiz._drivers.reactions._2.value = value; },
        /**
         * @type {Array<DriverHistoryEntry>}
         */
        get history() { return thiz._drivers.reactions.history.value; },
        set history(value) { thiz._drivers.reactions.history.value = value; },
      },
    };
  }

  get health() {
    const thiz = this;
    return {
      hp: {
        /**
         * @type {Number}
         */
        get current() { return thiz._health.hp.current.value; },
        set current(value) { thiz._health.hp.current.value = value; },
        /**
         * @type {Number}
         * @readonly
         */
        get maximum() { return Ruleset.getCharacterMaximumHp(thiz); },
        /**
         * @type {Number}
         */
        get temporary() { return thiz._health.hp.temporary.value; },
        set temporary(value) { thiz._health.hp.temporary.value = value; },
      },
      stamina: {
        /**
         * @type {Number}
         */
        get current() { return thiz._health.stamina.current.value; },
        set current(value) { thiz._health.stamina.current.value = value; },
        /**
         * @type {Number}
         * @readonly
         */
        get maximum() { return Ruleset.getCharacterMaximumStamina(thiz); },
        /**
         * @type {Number}
         */
        get strain() { return thiz._health.stamina.strain.value; },
        set strain(value) { thiz._health.stamina.strain.value = value; },
      },
      gritPoints: {
        /**
         * @type {Boolean}
         */
        get enabled() { return thiz._health.gritPoints.enabled.value; },
        set enabled(value) { thiz._health.gritPoints.enabled.value = value; },
        /**
         * @type {Number}
         */
        get current() { return thiz._health.gritPoints.current.value; },
        set current(value) { thiz._health.gritPoints.current.value = value; },
      },
      /**
       * @type {Array<InjuryShrugOff>}
       */
      get injuryShrugOffs() { return thiz._health.injuryShrugOffs.value; },
      set injuryShrugOffs(value) { thiz._health.injuryShrugOffs.value = value; },
      deathSaves: {
        /**
         * @type {Boolean}
         */
        get enabled() { return thiz._health.deathSaves.enabled.value; },
        set enabled(value) { thiz._health.deathSaves.enabled.value = value; },
        /**
         * @type {Number}
         */
        get current() { return thiz._health.deathSaves.current.value; },
        set current(value) { thiz._health.deathSaves.current.value = value; },
        /**
         * @type {Number}
         * @readonly
        */
        get maximum() { return Ruleset.getCharacterMaximumDeathSaves(thiz); },
      },
      /**
       * @type {Array<TransientInjury>}
       * @readonly
      */
      get injuries() { return thiz.items.filter(it => it.type === ITEM_TYPES.injury); },
      /**
       * @type {Array<TransientIllness>}
       * @readonly
      */
      get illnesss() { return thiz.items.filter(it => it.type === ITEM_TYPES.illness); },
      /**
       * @type {Array<TransientMutation>}
       * @readonly
      */
      get mutations() { return thiz.items.filter(it => it.type === ITEM_TYPES.mutation); },
      /**
       * @type {Array<TransientHealthCondition>}
       * @readonly
      */
      get conditions() { return thiz.items.filter(it => it.type === ITEM_TYPES.health_condition); },
    };
  }

  get assets() {
    const thiz = this;
    return {
      /**
       * @type {Array<AssetSlot>}
       */
      get slots() { return thiz._assets.slots.value; },
      set slots(value) { thiz._assets.slots.value = value; },
      /**
       * @type {Array<TransientAsset>}
       * @readonly
       */
      get all() { return thiz.items.filter(it => it.type === ITEM_TYPES.asset); },
      /**
       * @type {Array<TransientAsset>}
       * @readonly
       */
      get equipment() {
        const arr = [];
        for (const asset of this.all) {
          const isInAssetSlot = this.slots.find(slot => slot.containedAsset.uuid === asset.id 
            || slot.containedAsset.name === asset.name);
          if (isInAssetSlot) {
            arr.push(asset);
          }
        }
        return arr;
      },
      /**
       * @type {Array<TransientAsset>}
       * @readonly
       */
      get luggage() {
        const arr = [];
        for (const reference of thiz._assets._luggage) {
          const asset = this.all.find(asset => asset.id === reference.id || asset.name === reference.name)
          if (common.util.validation.isDefined(asset)) {
            arr.push(asset);
          }
        }
        return arr;
      },
      property: {
        /**
         * @type {PropertyLocation}
         * @readonly
         */
        get unknownLocation() { return thiz._assets.property.unknownLocation.value; },
        /**
         * @type {Array<PropertyLocation>}
         */
        get locations() { return thiz._assets.property.locations.value; },
        set locations(value) { thiz._assets.property.locations.value = value; },
      },
      bulk: {
        /**
         * @type {Number}
         * @readonly
         */
        get current() {
          let bulk = 0;
          for (const asset of thiz.assets.equipment) {
            bulk += asset.bulk;
          }
          return bulk;
        },
        /**
         * @type {Number}
         * @readonly
         */
        get maximum() { return Ruleset.getCharacterMaximumBulk(thiz); }
      }
    };
  }

  get advancement() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._advancement.enabled.value; },
      set enabled(value) { thiz._advancement.enabled.value = value; },
      /**
       * @type {Number}
       */
      get xp() { return thiz._advancement.xp.value; },
      set xp(value) { thiz._advancement.xp.value = value; },
      /**
       * @type {Number}
       */
      get history() { return thiz._advancement.history.value; },
      set history(value) { thiz._advancement.history.value = value; },
    }
  }

  get skills() {
    const thiz = this;
    return {
      /**
       * @type {Array<TransientSkill>}
       * @readonly
       */
      get all() { return thiz.items.filter(it => it.type === ITEM_TYPES.skill); },
      /**
       * @type {Array<TransientSkill>}
       * @readonly
       */
      get learning() { return thiz.items.filter(it => it.type === ITEM_TYPES.skill && it.level === 0); },
      /**
       * @type {Array<TransientSkill>}
       * @readonly
       */
      get known() { return thiz.items.filter(it => it.type === ITEM_TYPES.skill && it.level > 0); },
      /**
       * @type {Array<TransientSkill>}
       * @readonly
       */
      get innate() { return thiz.items.filter(it => it.type === ITEM_TYPES.skill && it.isInnate); },
    };
  }

  /**
   * @type {Array<TransientTrait>}
   * @readonly
   */
  get traits() { return this.items.filter(it => it.type === ITEM_TYPES.trait); }

  /**
   * @type {Array<TransientProject>}
   * @readonly
   */
  get projects() { return this.items.filter(it => it.type === ITEM_TYPES.project); }

  /**
   * @type {Array<TransientRecipe>}
   * @readonly
   */
  get recipes() { return this.items.filter(it => it.type === ITEM_TYPES.recipe); }

  get modifiers() {
    const thiz = this;
    return {
      /**
       * @type {Array<Modifier>}
       * @readonly
       */
      get all() {
        return thiz.modifiers.items.concat(thiz.modifiers.own);
      },
      /**
       * @type {Array<Modifier>}
       * @readonly
       */
      get items() {
        let arr = [];
        for (const item of thiz.items) {
          arr = arr.concat(item.modifiers);
        }
        return arr;
      },
      /**
       * @type {Array<Modifier>}
       */
      get own() { return thiz._modifiers.own.value; },
      set own(value) { thiz._modifiers.own.value = value; },
    };
  }

  /**
   * @type {Boolean}
   */
  get isNpc() { return this._isNpc.value; }
  set isNpc(value) { this._isNpc.value = value; }

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

    this._actionPoints = {
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.actionPoints.current",
        default: 0,
      }),
      maximum: new DataFieldBridge({
        document: this,
        dataPath: "system.actionPoints.maximum",
        default: 5,
      }),
    };
    this._meta = {
      actionPoints: {
        refill: {
          amount: new DataFieldBridge({
            document: this,
            dataPath: "system.meta.actionPoints.refill.amount",
            default: 4,
          }),
          enabled: new DataFieldBridge({
            document: this,
            dataPath: "system.meta.actionPoints.refill.enabled",
            default: true,
          }),
        },
      },
      initiative: {
        perTurn: new DataFieldBridge({
          document: this,
          dataPath: "system.meta.initiative.perTurn",
          default: 1,
        }),
      },
      itemOrders: {
        languages: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.languages",
          dataClass: Reference,
        }),
        skills: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.skills",
          dataClass: Reference,
        }),
        injuries: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.injuries",
          dataClass: Reference,
        }),
        illnesses: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.illnesses",
          dataClass: Reference,
        }),
        mutations: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.mutations",
          dataClass: Reference,
        }),
        luggage: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.luggage",
          dataClass: Reference,
        }),
        projects: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.projects",
          dataClass: Reference,
        }),
        recipes: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.meta.itemOrders.recipes",
          dataClass: Reference,
        }),
      },
      isPlayerCharacter: new DataFieldBridge({
        document: this,
        dataPath: "system.meta.isPlayerCharacter",
        default: false,
      }),
    };
    this._personals = {
      age: new DataFieldBridge({
        document: this,
        dataPath: "system.personals.age",
      }),
      ancestry: new DataFieldBridge({
        document: this,
        dataPath: "system.personals.ancestry",
      }),
      genderOrPronouns: new DataFieldBridge({
        document: this,
        dataPath: "system.personals.genderOrPronouns",
      }),
    };
    this._virtuesAndVices = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.enabled",
        default: false,
      }),
      arrogantOrHumble: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.arrogantOrHumble",
        default: 0,
      }),
      cowardlyOrCourageous: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.cowardlyOrCourageous",
        default: 0,
      }),
      cruelOrMerciful: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.cruelOrMerciful",
        default: 0,
      }),
      deceitfulOrHonest: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.deceitfulOrHonest",
        default: 0,
      }),
      lazyOrEnergetic: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.lazyOrEnergetic",
        default: 0,
      }),
      paranoidOrNaive: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.paranoidOrNaive",
        default: 0,
      }),
      recklessOrPrudent: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.recklessOrPrudent",
        default: 0,
      }),
      selfishOrConsiderate: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.selfishOrConsiderate",
        default: 0,
      }),
      vengefulOrForgiving: new DataFieldBridge({
        document: this,
        dataPath: "system.virtuesAndVices.vengefulOrForgiving",
        default: 0,
      }),
    };
    this._drivers = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.drivers.enabled",
        default: false,
      }),
      ambition: {
        current: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.ambition.current",
          default: false,
        }),
        history: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.drivers.ambition.history",
          dataClass: DriverHistoryEntry,
        }),
      },
      aspirations: {
        _0: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.aspirations._0",
        }),
        _1: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.aspirations._1",
        }),
        _2: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.aspirations._2",
        }),
        history: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.drivers.aspirations.history",
          dataClass: DriverHistoryEntry,
        }),
      },
      reactions: {
        _0: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.reactions._0",
        }),
        _1: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.reactions._1",
        }),
        _2: new DataFieldBridge({
          document: this,
          dataPath: "system.drivers.reactions._2",
        }),
        history: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.drivers.reactions.history",
          dataClass: DriverHistoryEntry,
        }),
      },
    };
    this._health = {
      hp: {
        current: new DataFieldBridge({
          document: this,
          dataPath: "system.health.hp.current",
          default: 0,
        }),
        temporary: new DataFieldBridge({
          document: this,
          dataPath: "system.health.hp.temporary",
          default: 0,
        }),
      },
      stamina: {
        current: new DataFieldBridge({
          document: this,
          dataPath: "system.health.stamina.current",
          default: 0,
        }),
        strain: new DataFieldBridge({
          document: this,
          dataPath: "system.health.stamina.strain",
          default: 0,
        }),
      },
      gritPoints: {
        enabled: new DataFieldBridge({
          document: this,
          dataPath: "system.health.gritPoints.enabled",
          default: false,
        }),
        current: new DataFieldBridge({
          document: this,
          dataPath: "system.health.gritPoints.current",
          default: 0,
        }),
      },
      injuryShrugOffs: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.health.injuryShrugOffs",
        dataClass: InjuryShrugOff,
      }),
      deathSaves: {
        enabled: new DataFieldBridge({
          document: this,
          dataPath: "system.health.deathSaves.enabled",
          default: false,
        }),
        current: new DataFieldBridge({
          document: this,
          dataPath: "system.health.deathSaves.current",
          default: 0,
        }),
      },
    };
    this._assets = {
      slots: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.assets.slots",
        dataClass: AssetSlot,
      }),
      _luggage: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.assets.luggage",
        dataClass: Reference,
      }),
      property: {
        unknownLocation: new DataFieldBridge({
          document: this,
          dataPath: "system.assets.property.unknownLocation",
          fromDto: (dto) => PropertyLocation.fromDto(dto),
          toDto: (value) => value.toDto(),
        }),
        locations: new ArrayDataFieldBridge({
          document: this,
          dataPath: "system.assets.property.locations",
          dataClass: PropertyLocation,
        }),
      },
    };
    this._advancement = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.advancement.enabled",
        default: false,
      }),
      xp: new DataFieldBridge({
        document: this,
        dataPath: "system.advancement.xp",
        default: 0,
      }),
      history: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.advancement.history",
        dataClass: AdvancementHistoryEntry,
      }),
    };
    this._modifiers = {
      own: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.modifiers.own",
        dataClass: Modifier,
      }),
    };
    this._isNpc = new DataFieldBridge({
      document: this,
      dataPath: "system.isNpc",
      default: false,
    });
  }

  /**
   * Returns all Modifiers currently affecting the given data path. 
   * 
   * @param {String} dataPath 
   * @returns {Array<Modifier>}
   */
  getModifiersOf(dataPath) {
    const arr = [];
    for (const modifier of this.modifiers.all) {
      if (modifier.dataPath == dataPath) {
        arr.push(modifier);
      }
    }
    return arr;
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
