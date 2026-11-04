import { CompareUtility } from "../../../../common/util/compare-utility.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ExpertiseItemSheet from "../../../../presentation/application/item/expertise/expertise-item-sheet.mjs";
import AtReferencer from "../../../search/at-referencer.mjs";
import { ITEM_TYPES } from "../../domain/const/item-types.mjs";
import { TARGETING_TYPES } from "../../domain/const/targeting-types.mjs";
import GradedEffect from "../../domain/graded-effect.mjs";
import ArrayDataFieldBridge from "../data-bridge/array-data-field-bridge.mjs";
import DataFieldBridge from "../data-bridge/data-field-bridge.mjs";
import SyntheticDocument from "../synthetic-document.mjs";
import SkillDocument from "./skill-document.mjs";
// Do not import SkillDocument

/**
 * Represents an Expertise (of a Skill). 
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
 * @property {String} name 
 * @property {String} description Html content.
 * @property {String | null} gmNotes Html content.
 * * Read-only.
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {String} type Internal type name: `"expertise"`
 * * Read-only.
 * @property {Number} requiredLevel
 * @property {Object} actionPoints
 * * Read-only.
 * @property {Boolean} actionPoints.enabled
 * @property {Number} actionPoints.current
 * @property {Object} distance
 * * Read-only.
 * @property {Boolean} distance.enabled
 * @property {Number} distance.current
 * @property {Object} targetingType
 * * Read-only.
 * @property {Boolean} targetingType.enabled
 * @property {TargetingType} targetingType.current
 * @property {Object} obstacle
 * * Read-only.
 * @property {Boolean} obstacle.enabled
 * @property {String} obstacle.current
 * @property {Object} opposedBy
 * * Read-only.
 * @property {Boolean} opposedBy.enabled
 * @property {String} opposedBy.current
 * @property {Object} gradedEffects
 * * Read-only.
 * @property {Boolean} gradedEffects.enabled
 * @property {Array<GradedEffect>} gradedEffects.entries
 * 
 * @extends SyntheticDocument
 */
export default class ExpertiseDocument extends SyntheticDocument {
  /**
   * @param {Object} args 
   * @param {SkillDocument} args.parentDocument 
   * @param {Number} args.index 
   * @override
   */
  static fromDto(dto, args) {
    return new ExpertiseDocument({
      raw: dto,
      parentDocument: args.parentDocument,
      index: args.index,
      id: dto.id,
    });
  }

  /**
   * Index of this Expertise in the parent Skill's array. 
   * @type {Number}
   * @private
   */
  #index;

  /**
   * Returns the default icon image path for this type of document. 
   * 
   * @type {String}
   * @readonly
   */
  get defaultImg() { return "systems/strive/presentation/image/expertise-light.svg"; }

  /**
   * Returns the class reference of this document. 
   * @type {ExpertiseDocument}
   * @readonly
   */
  get clazz() { return ExpertiseDocument; }

  /**
   * Returns the content type of this "document". 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return ITEM_TYPES.expertise; }

  /**
   * @type {Number}
   */
  get requiredLevel() { return this._requiredLevel.value; }
  set requiredLevel(value) { this._requiredLevel.value = value; }

  get actionPoints() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._actionPoints.enabled.value; },
      set enabled(value) { thiz._actionPoints.enabled.value = value; },

      /**
       * @type {Number}
       */
      get current() { return thiz._actionPoints.current.value; },
      set current(value) { thiz._actionPoints.current.value = value; },
    };
  }

  get distance() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._distance.enabled.value; },
      set enabled(value) { thiz._distance.enabled.value = value; },

      /**
       * @type {Number}
       */
      get current() { return thiz._distance.current.value; },
      set current(value) { thiz._distance.current.value = value; },
    };
  }

  get targetingType() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._targetingType.enabled.value; },
      set enabled(value) { thiz._targetingType.enabled.value = value; },

      /**
       * @type {TargetingType}
       */
      get current() { return thiz._targetingType.current.value; },
      set current(value) { thiz._targetingType.current.value = value; },
    };
  }

  get obstacle() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._obstacle.enabled.value; },
      set enabled(value) { thiz._obstacle.enabled.value = value; },

      /**
       * @type {String}
       */
      get current() { return thiz._obstacle.current.value; },
      set current(value) { thiz._obstacle.current.value = value; },
    };
  }

  get opposedBy() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._opposedBy.enabled.value; },
      set enabled(value) { thiz._opposedBy.enabled.value = value; },

      /**
       * @type {String}
       */
      get current() { return thiz._opposedBy.current.value; },
      set current(value) { thiz._opposedBy.current.value = value; },
    };
  }

  get gradedEffects() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get enabled() { return thiz._gradedEffects.enabled.value; },
      set enabled(value) { thiz._gradedEffects.enabled.value = value; },

      /**
       * @type {Array<GradedEffect>}
       */
      get entries() { return thiz._gradedEffects.entries.value; },
      set entries(value) { thiz._gradedEffects.entries.value = value; },
    };
  }

  /**
   * @param {Object} args 
   * @param {SkillDocument} args.parentDocument 
   * @param {Number} args.index Index of the Expertise on the parent document. 
   * @param {Object | undefined} args.raw Raw data object. 
   * @param {String | undefined} args.id Unique ID of this instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      pathOnParent: `system.expertises[${args.index}]`,
    });
    ValidationUtil.validateOrThrow(args, ["index"]);

    this.#index = args.index;

    this._name.default = StringUtil.getLoca("system.item.expertise.defaultName");
    this._requiredLevel = new DataFieldBridge({
      document: this,
      dataPath: "system.requiredLevel",
      default: 0,
    });
    this._actionPoints = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.actionPoints.enabled",
        default: false,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.actionPoints.current",
        default: 0,
      }),
    };
    this._distance = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.distance.enabled",
        default: false,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.distance.current",
        default: 0,
      }),
    };
    this._targetingType = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.targetingType.enabled",
        default: false,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.targetingType.current",
        fromDto: (dto) => {
          const targetingType = TARGETING_TYPES.asArray().find(it => it.name === dto);
          if (ValidationUtil.isDefined(targetingType)) {
            return targetingType;
          } else {
            return TARGETING_TYPES.none;
          }
        },
        toDto: (value) => value.name,
        default: TARGETING_TYPES.none,
      }),
    };
    this._obstacle = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.obstacle.enabled",
        default: false,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.obstacle.current",
        default: "",
      }),
    };
    this._opposedBy = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.opposedBy.enabled",
        default: false,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.opposedBy.current",
        default: "",
      }),
    };
    this._gradedEffects = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.gradedEffects.enabled",
        default: false,
      }),
      entries: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.gradedEffects.entries",
        dataClass: GradedEffect,
        default: [],
      }),
    };
  }

  /**
   * Returns a data transfer object version of this instance. 
   * 
   * IMPORTANT: To avoid problems with recursion, the `parentDocument` field 
   * **is not and must not** be included!
   * 
   * @returns {Object}
   * @override
   */
  toDto() {
    return {
      id: this.id,
      img: this.img,
      name: this.name,
      description: this.description,
      gmNotes: this.gmNotes,
      requiredLevel: this.requiredLevel,
      actionPoints: {
        enabled: this.actionPoints.enabled,
        current: this.actionPoints.current,
      },
      distance: {
        enabled: this.distance.enabled,
        current: this.distance.current,
      },
      targetingType: {
        enabled: this.targetingType.enabled,
        current: this.targetingType.current,
      },
      obstacle: {
        enabled: this.obstacle.enabled,
        current: this.obstacle.current,
      },
      opposedBy: {
        enabled: this.opposedBy.enabled,
        current: this.opposedBy.current,
      },
      gradedEffects: {
        enabled: this.gradedEffects.enabled,
        entries: this.gradedEffects.entries.map(it => it.toDto()),
      },
    };
  }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this `Expertise`. 
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! E. g. `@a_fate_card.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   * @override
   */
  resolveReferences(str) {
    return new AtReferencer().resolveReferences(str, this);
  }

  /**
   * Compares the raw required level of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {ExpertiseDocument} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   * @override
   */
  compareRequiredLevel(other) {
    return CompareUtility.compareOrdinal(this.requiredLevel, other.requiredLevel)
  }

  /** @override */
  async openSheet() {
    return await new ExpertiseItemSheet(this).render(true);
  }
}
