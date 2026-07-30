import { common } from "../../../../common/_module.mjs";
import { LANGUAGE_GRADES, LanguageGrade } from "../../domain/const/language-grades.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * Represents the full transient data of a language. 
 * 
 * @see `LanguageItemData` - Must contain all the fields defined in this data model. 
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
 * @property {TransientBaseActor | undefined} owningDocument Another 
 * document that this document is embedded in. 
 * * Read-only.
 * @property {Boolean} hasParent Returns true, if there is an owning document. 
 * * Read-only.
 * @property {Array<Modifier>} modifiers Modifiers to apply to the `owningDocument`. 
 * 
 * @property {LanguageGrade} grade
 * @property {Boolean} readAndWrite
 * 
 * @extends TransientBaseItem
 */
export default class TransientLanguage extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/ice-aura.svg"; }

  /** @override */
  get clazz() { return TransientLanguage; }

  /**
   * @type {LanguageGrade}
   */
  get grade() { return this._grade.value; }
  set grade(value) { this._grade.value = value; }

  /**
   * @type {Boolean}
   */
  get readAndWrite() { return this._readAndWrite.value; }
  set readAndWrite(value) { this._readAndWrite.value = value; }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._grade = new DataFieldBridge({
      document: this,
      dataPath: "system.grade",
      default: LANGUAGE_GRADES.dabbling.name,
      fromDto: (dto) => {
        return LANGUAGE_GRADES[dto];
      },
      toDto: (value) => {
        return value.name;
      },
    });
    this._readAndWrite = new DataFieldBridge({
      document: this,
      dataPath: "system.readAndWrite",
    });
  }

  /**
   * Compares the grade of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {TransientLanguage} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   */
  compareGrade(other) {
    return common.util.compare.compareOrdinal(this.grade.ordinal, other.grade.ordinal);
  }
}
