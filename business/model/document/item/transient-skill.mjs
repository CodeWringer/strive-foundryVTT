import AtReferencer from "../../../../search/at-referencer.mjs"
import GradedEffect from "../../domain/graded-effect.mjs";
import MomentumAction from "../../domain/momentum-action.mjs";
import { DataFieldBridge, ArrayDataFieldBridge, Expertise } from "../_module.mjs";
import TransientBaseItem from "../transient-base-item.mjs"

/**
 * Represents the full transient data of a skill. 
 * 
 * @see `SkillItemData` - Must contain all the fields defined in this data model. 
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
 * @property {Array<String>} baseAttributes
 * @property {Number} level
 * @property {Array<Expertise>} expertises
 * @property {Object} itemOrders
 * * Read-only.
 * @property {Array<String>} itemOrders.expertises
 * @property {Array<String>} itemOrders.momentumActions
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
 * @property {Array<GradedEffect>} gradedEffects
 * @property {Array<MomentumAction>} momentumActions
 * 
 * @extends TransientBaseItem
 */
export default class TransientSkill extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get clazz() { return TransientSkill; }
  
  /**
   * @type {Array<String>}
   */
  get baseAttributes() { return this._baseAttributes.value; }
  set baseAttributes(value) { this._baseAttributes.value = value; }
  
  /**
   * @type {Number}
   */
  get level() { return this._level.value; }
  set level(value) { this._level.value = value; }
  
  /**
   * @type {Array<Expertise>}
   */
  get expertises() { return this._expertises.value; }
  set expertises(value) { this._expertises.value = value; }
  
  get itemOrders() {
    const thiz = this;
    return {
      /**
       * @type {Array<String>}
       */
      get expertises() { return thiz._itemOrders.expertises.value; },
      set expertises(value) { thiz._itemOrders.expertises.value = value; },
      
      /**
       * @type {Array<String>}
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
      get progress() { return thiz._advancement.progress.value; },
      set progress(value) { thiz._advancement.progress.value = value; },
    };
  }

  /**
   * @type {Array<GradedEffect>}
   */
  get gradedEffects() { return this._gradedEffects.value; }
  set gradedEffects(value) { this._gradedEffects.value = value; }
  
  /**
   * @type {Array<MomentumAction>}
   */
  get momentumActions() { return this._momentumActions.value; }
  set momentumActions(value) { this._momentumActions.value = value; }
  
  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._baseAttributes = new DataFieldBridge({
      document: this,
      dataPath: "system.baseAttributes",
    });
    this._level = new DataFieldBridge({
      document: this,
      dataPath: "system.level",
    });
    this._expertises = new ArrayDataFieldBridge({
      document: this,
      dataPath: "system.expertises",
      dataClass: Expertise,
    });
    this._itemOrders = {
      expertises: new DataFieldBridge({
        document: this,
        dataPath: "system.itemOrders.expertises",
      }),
      momentumActions: new DataFieldBridge({
        document: this,
        dataPath: "system.itemOrders.momentumActions",
      }),
    };
    this._actionPoints = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.actionPoints.enabled",
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
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.distance.current",
      }),
    };
    this._targetingType = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.targetingType.enabled",
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.targetingType.current",
      }),
    };
    this._obstacle = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.obstacle.enabled",
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.obstacle.current",
      }),
    };
    this._opposedBy = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.opposedBy.enabled",
      }),
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.opposedBy.current",
      }),
    };
    this._advancement = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.advancement.enabled",
      }),
      progress: new DataFieldBridge({
        document: this,
        dataPath: "system.advancement.progress",
        default: 0,
      }),
    };
    this._gradedEffects = {
      enabled: new DataFieldBridge({
        document: this,
        dataPath: "system.gradedEffects.enabled",
      }),
      entries: new ArrayDataFieldBridge({
        document: this,
        dataPath: "system.gradedEffects.entries",
        dataClass: GradedEffect,
      }),
    };
    this._momentumActions = new ArrayDataFieldBridge({
      document: this,
      dataPath: "system.momentumActions",
      dataClass: MomentumAction,
    });
  }

  /**
   * @override
   * 
   * Also searches in: 
   * * Embedded expertises
   */
  resolveReference(comparableReference, propertyPath) {
    const collectionsToSearch = [
      this.expertises,
    ];
    const r = new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);
    if (r !== undefined) {
      return r;
    }

    return super.resolveReference(comparableReference, propertyPath);
  }
}
