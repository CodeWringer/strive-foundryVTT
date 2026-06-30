import Complication from "../../domain/complication/complication.mjs";
import { TIME_UNITS } from "../../domain/const/time-units.mjs";
import Reference from "../../domain/reference.mjs";
import ArrayDataFieldBridge from "../array-data-field-bridge.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @extends TransientBaseItem
 * 
 * @see `RecipeItemData` - Must contain all the fields defined in this data model. 
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
 * @property {TransientBaseActor | undefined} owningDocument Another 
 * document that this document is embedded in. 
 * * Read-only.
 * @property {Boolean} hasParent Returns true, if there is an owning document. 
 * * Read-only.
 * @property {Array<Modifier>} modifiers Modifiers to apply to the `owningDocument`. 
 * 
 * @property {Array<Complication>} complications
 * @property {Number} requiredProgress
 * @property {Reference} projectSkill
 * @property {Number} quality
 * @property {Object} timeIncrement
 * * Read-only
 * @property {Number} timeIncrement.value
 * @property {TimeUnit} timeIncrement.unit
 * @property {Reference} product
 */
export default class TransientRecipe extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }

  /** @override */
  get clazz() { return TransientRecipe; }

  /**
   * @type {Array<Complication>}
   */
  get complications() { return this._complications.value; }
  set complications(value) { this._complications.value = value; }

  /**
   * @type {Number}
   */
  get requiredProgress() { return this._requiredProgress.value; }
  set requiredProgress(value) { this._requiredProgress.value = value; }

  /**
   * @type {Reference}
   */
  get projectSkill() { return this._projectSkill.value; }
  set projectSkill(value) { this._projectSkill.value = value; }

  /**
   * @type {Number}
   */
  get quality() { return this._quality.value; }
  set quality(value) { this._quality.value = value; }

  get timeIncrement() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get value() { return thiz._timeIncrement.value.value; },
      set value(value) { thiz._timeIncrement.value.value = value; },

      /**
       * @type {TimeUnit}
       */
      get unit() { return thiz._timeIncrement.unit.value; },
      set unit(value) { thiz._timeIncrement.unit.value = value; },
    };
  }

  /**
   * @type {Reference}
   */
  get product() { return this._product.value; }
  set product(value) { this._product.value = value; }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._complications = new ArrayDataFieldBridge({
      document: this,
      dataPath: "system.complications",
      dataClass: Complication,
    });
    this._requiredProgress = new DataFieldBridge({
      document: this,
      dataPath: "system.requiredProgress",
      default: 0,
    });
    this._projectSkill = new DataFieldBridge({
      document: this,
      dataPath: "system.projectSkill",
      default: null,
      fromDto: (dto) => {
        return Reference.fromDto(dto);
      },
      toDto: (value) => {
        return value.toDto();
      },
    });
    this._quality = new DataFieldBridge({
      document: this,
      dataPath: "system.quality",
      default: 1,
    });

    this._timeIncrement = {
      value: new DataFieldBridge({
        document: this,
        dataPath: "system.timeIncrement.value",
        default: 0,
      }),
      unit: new DataFieldBridge({
        document: this,
        dataPath: "system.timeIncrement.unit",
        default: TIME_UNITS.none,
        fromDto: (dto) => {
          return TIME_UNITS[dto];
        },
        toDto: (value) => {
          return value.name;
        },
      }),
    };

    this._product = new DataFieldBridge({
      document: this,
      dataPath: "system.product",
      default: null,
      fromDto: (dto) => {
        return Reference.fromDto(dto);
      },
      toDto: (value) => {
        return value.toDto();
      },
    });
  }
}
