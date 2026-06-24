import { common } from "../../../../common/_module.mjs"
import AtReferencer from "../../../search/at-referencer.mjs";
import ArrayDataFieldBridge from "../../document/array-data-field-bridge.mjs";
import DataFieldBridge from "../../document/data-field-bridge.mjs";
import DataFieldBridge from "../../document/data-field-bridge.mjs";
import TransientSkill from "../../document/item/transient-skill.mjs";
import { ITEM_TYPES } from "../const/item-types.mjs";
import GradedEffect from "../graded-effect.mjs";
import MomentumAction from "../momentum-action.mjs";
import Persistable from "../persistable.mjs"
import Reference from "../reference.mjs";

/**
 * Represents an Expertise (of a Skill). 
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
 * @property {TransientDocument | null} owningDocument
 * * Read-only.
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {String} type Internal type name: `"expertise"`
 * * Read-only.
 * @property {Number} requiredLevel
 * @property {Object} itemOrders
 * * Read-only.
 * @property {Array<Reference>} itemOrders.momentumActions
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
 * @property {Object} advancement
 * * Read-only.
 * @property {Boolean} advancement.enabled
 * @property {Number} advancement.progress
 * @property {Object} gradedEffects
 * * Read-only.
 * @property {Boolean} gradedEffects.enabled
 * @property {Array<GradedEffect>} gradedEffects.entries
 * @property {Array<MomentumAction>} momentumActions
 * 
 * @extends Persistable
 */
export default class Expertise extends Persistable {
  /**
   * @param {Object} dto 
   * @param {TransientSkill} owningDocument 
   * 
   * @returns {Expertise}
   * 
   * @static
   * @override
   */
  static fromDto(dto, owningDocument) {
    return new Expertise({
      owningDocument: owningDocument,
      id: dto.id,
    });
  }

  /**
   * Returns the data path of this expertise on its parent. 
   * 
   * @type {String}
   * @private
   * @readonly
   */
  get _pathOnParent() { return `system.abilities.${this.id}`; }

  /**
   * @type {String}
   */
  get description() { return this._description.value; }
  set description(value) { this._description.value = value; }

  /**
   * Arbitrary notes only visible to game-masters. 
   * 
   * @type {String | null}
   */
  get gmNotes() { return this._gmNotes.value; }
  set gmNotes(value) { this._gmNotes.value = value; }

  /**
   * Returns the default icon image path for this type of document. 
   * 
   * @type {String}
   * @abstract
   * @readonly
   */
  get defaultImg() { return "icons/svg/book.svg"; }

  /**
   * Returns the class reference of this document. 
   * 
   * Required for use in the `getExtenders` method. 
   * 
   * @type {Expertise}
   * @abstract
   * @readonly
   */
  get clazz() { return Expertise; }

  /**
   * Returns the class reference of this document. 
   * 
   * Required for use in the `getExtenders` method. 
   * 
   * @type {Expertise}
   * @abstract
   * @readonly
   */
  get id() { return this._id; }

  /**
   * Returns the content type of this "document". 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return ITEM_TYPES.expertise; }

  /**
   * Returns true, if there is an owning document. 
   * @type {Boolean}
   * @readonly
   */
  get hasParent() {
    return common.util.validation.isDefined(this.owningDocument);
  }

  /**
   * Returns true, if the current user is the owner of the document. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return this.hasParent ? this.owningDocument.isOwner : false; }

  /**
   * @type {Number}
   */
  get requiredLevel() { return this._requiredLevel.value; }
  set requiredLevel(value) { this._requiredLevel.value = value; }

  get itemOrders() {
    const thiz = this;
    return {
      /**
       * @type {Array<Reference>}
       */
      get momentumActions() { return thiz._itemOrders.momentumActions.value; },
      set momentumActions(value) { thiz._itemOrders.momentumActions.value = value; },
    };
  }

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
   * @type {Array<MomentumAction>}
   */
  get momentumActions() { return this._momentumActions.value; }
  set momentumActions(value) { this._momentumActions.value = value; }

  /**
   * @param {Object} args 
   * @param {TransientSkill} args.owningDocument The owning document.
   * @param {String | undefined} args.id
   * 
   * @throws {Error} Thrown, if `owningDocument` is undefined. 
   */
  constructor(args = {}) {
    super(args);
    common.util.validation.validateOrThrow(args, ["owningDocument"]);

    this.owningDocument = args.owningDocument;
    this._id = args.id ?? common.util.uuid.createUUID();

    this._gmNotes = new DataFieldBridge({
      document: this,
      dataPath: `${this._pathOnParent}.gmNotes`,
      fromDto: (dto) => {
        if (common.util.validation.isBlankOrUndefined(dto)) {
          return null;
        } else {
          return dto;
        }
      },
      toDto: (value) => {
        if (common.util.validation.isBlankOrUndefined(value)) {
          return null;
        } else {
          return value;
        }
      },
    });
    this._description = new DataFieldBridge({
      document: this,
      dataPath: `${this._pathOnParent}.description`,
    });
    this._requiredLevel = new DataFieldBridge({
      document: this.owningDocument,
      dataPath: `${this._pathOnParent}.requiredLevel`,
    });
    this._itemOrders = {
      momentumActions: new ArrayDataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.itemOrders.momentumActions`,
        dataClass: Reference,
      }),
    };
    this._actionPoints = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.actionPoints.enabled`,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.actionPoints.current`,
        default: 0,
      }),
    };
    this._distance = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.distance.enabled`,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.distance.current`,
      }),
    };
    this._targetingType = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.targetingType.enabled`,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.targetingType.current`,
      }),
    };
    this._obstacle = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.obstacle.enabled`,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.obstacle.current`,
      }),
    };
    this._opposedBy = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.opposedBy.enabled`,
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.opposedBy.current`,
      }),
    };
    this._gradedEffects = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.gradedEffects.enabled`,
      }),
      entries: new ArrayDataFieldBridge({
        document: this,
        dataPath: `${this._pathOnParent}.gradedEffects.entries`,
        dataClass: GradedEffect,
      }),
    };
    this._momentumActions = new ArrayDataFieldBridge({
      document: this,
      dataPath: `${this._pathOnParent}.momentumActions`,
      dataClass: MomentumAction,
    });
  }

  /**
   * Deletes this `Expertise`. 
   * 
   * @returns {Boolean} True, if the `Expertise` could be removed. 
   */
  delete() {
    if (!this.hasParent) {
      game.strive.logger.logWarn("No parent");
      return false;
    }

    const safecopy = this.owningDocument.expertises.concat([]);
    const index = safecopy.findIndex(it => it.id === this.id);
    if (index < 0) {
      game.strive.logger.logWarn("Not part of parent Skill's Expertises");
      return false;
    }

    safecopy.splice(index, 1);
    this.owningDocument.expertises = safecopy;

    return true;
  }

  /**
   * Updates the properties of this object, based on the given delta object. 
   * 
   * @param {Object} delta An object containing the properties of this object to update. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async update(delta, render = true) {
    if (!this.hasParent) {
      game.strive.logger.logWarn("No parent");
      return;
    }

    const safecopy = this.owningDocument.expertises.concat([]);
    const index = safecopy.findIndex(it => it.id === this.id);
    if (index < 0) {
      game.strive.logger.logWarn("Not part of parent Skill's Expertises");
      return false;
    }

    safecopy[index] = {
      ...safecopy[index],
      ...delta,
    };
    // This causes the actual update through the parent Skill. 
    this.owningDocument.expertises = safecopy;
  }

  /**
   * Updates a property of this Expertise on the parent item, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the Expertise. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "itemOrders.momentumActions[0]"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async updateByPath(propertyPath, newValue, render = true) {
    if (propertyPath.startsWith(this._pathOnParent)) {
      this.owningDocument.updateByPath(propertyPath, newValue, render);
    } else {
      const newPath = `${this._pathOnParent}.${propertyPath}`;
      this.owningDocument.updateByPath(newPath, newValue, render);
    }
  }

  /**
   * Deletes a property on the expertise, via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "system.attributes[0].level" 
   *        E.g.: "system.attributes[4]" 
   *        E.g.: "system.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    if (propertyPath.startsWith(this._pathOnParent)) {
      this.owningDocument.deleteByPath(propertyPath, render);
    } else {
      const newPath = `${this._pathOnParent}.${propertyPath}`;
      this.owningDocument.deleteByPath(newPath, render);
    }
  }

  /**
   * Returns a data transfer object version of this instance. 
   * 
   * IMPORTANT: To avoid problems with recursion, the `owningDocument` field 
   * **is not and must not** be included!
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      description: this.description,
      gmNotes: this.gmNotes,
      requiredLevel: this.requiredLevel,
      itemOrders: {
        momentumActions: this.itemOrders.momentumActions.map(it => it.toDto()),
      },
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
      momentumActions: this.momentumActions.map(it => it.toDto()),
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
   */
  resolveReferences(str) {
    return new AtReferencer().resolveReferences(str, this);
  }

  /**
   * Compares the raw required level of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {Expertise} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   */
  compareRequiredLevel(other) {
    return common.util.compare.compareOrdinal(this.requiredLevel, other.requiredLevel)
  }
}
