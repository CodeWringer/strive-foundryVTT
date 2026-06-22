import { TIME_UNITS } from "../../const/time-units.mjs";
import { Complication, Reference } from "../../domain/_module.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * Represents the full transient data of a project. 
 * 
 * @see `ProjectItemData` - Must contain all the fields defined in this data model. 
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
 * 
 * @property {Array<Complication>} complications
 * @property {Object} progress
 * * Read-only.
 * @property {Number} progress.current
 * @property {Number} progress.increment
 * @property {Number} progress.total
 * @property {Reference} projectSkill
 * @property {Number} pushes
 * @property {Number} quality
 * @property {Object} timeIncrement
 * * Read-only.
 * @property {Number} timeIncrement.value
 * @property {TimeUnit} timeIncrement.unit
 * 
 * @extends TransientBaseItem
 */
export default class TransientProject extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }

  /** @override */
  get clazz() { return TransientProject; }

  /**
   * @type {Array<Complication>}
   */
  get complications() { return this._complications.value; }
  set complications(value) { this._complications.value = value; }

  get progress() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get current() { return thiz._progress.current.value; },
      set current(value) { thiz._progress.current.value = value; },

      /**
       * @type {Number}
       */
      get increment() { return thiz._progress.increment.value; },
      set increment(value) { thiz._progress.increment.value = value; },

      /**
       * @type {Number}
       */
      get total() { return thiz._progress.total.value; },
      set total(value) { thiz._progress.total.value = value; },
    };
  }

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
  get projectSkill() { return this._projectSkill.value; }
  set projectSkill(value) { this._projectSkill.value = value; }

  /**
   * @type {Number}
   */
  get pushes() { return this._pushes.value; }
  set pushes(value) { this._pushes.value = value; }

  /**
   * @type {Number}
   */
  get quality() { return this._quality.value; }
  set quality(value) { this._quality.value = value; }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._complications = new DataFieldBridge({
      document: this,
      dataPath: "system.complications",
      fromDto: (dto) => {
        return dto.map(it => Complication.fromDto(it));
      },
      toDto: (value) => {
        return value.map(it => it.toDto());
      },
    });

    this._progress = {
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.progress.current",
      }),
      increment: new DataFieldBridge({
        document: this,
        dataPath: "system.progress.increment",
      }),
      total: new DataFieldBridge({
        document: this,
        dataPath: "system.progress.total",
      }),
    };

    this._projectSkill = new DataFieldBridge({
      document: this,
      dataPath: "system.projectSkill",
      fromDto: (dto) => {
        return Reference.fromDto(dto);
      },
      toDto: (value) => {
        return value.toDto();
      },
    });
    this._pushes = new DataFieldBridge({
      document: this,
      dataPath: "system.pushes",
    });
    this._quality = new DataFieldBridge({
      document: this,
      dataPath: "system.quality",
    });

    this._timeIncrement = {
      value: new DataFieldBridge({
        document: this,
        dataPath: "system.timeIncrement.value",
      }),
      unit: new DataFieldBridge({
        document: this,
        dataPath: "system.timeIncrement.unit",
        fromDto: (dto) => {
          return TIME_UNITS[dto];
        },
        toDto: (value) => {
          return value.name;
        },
      }),
    };
  }
}