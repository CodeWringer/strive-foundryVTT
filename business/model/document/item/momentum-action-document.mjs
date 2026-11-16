import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import MomentumActionItemSheet from "../../../../presentation/application/item/momentum-action/momentum-action-item-sheet.mjs";
import { ITEM_TYPES } from "../../domain/const/item-types.mjs";
import DataFieldBridge from "../data-bridge/data-field-bridge.mjs";
import SyntheticDocument from "../synthetic-document.mjs";

/**
 * Represents a Momentum Action. 
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
 * @property {String} name Irrelevant for `MomentumAction`s. 
 * @property {String} description Html content. Irrelevant for `MomentumAction`s. 
 * @property {String | null} gmNotes Html content.
 * * Read-only.
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {String} type Internal type name. 
 * * Read-only.
 * 
 * @property {Object} desperate
 * @property {Number} desperate.name
 * @property {String} desperate.img
 * @property {Number} desperate.momentumChange
 * @property {String} desperate.description
 * @property {Object} heroic
 * @property {Number} heroic.name
 * @property {String} heroic.img
 * @property {Number} heroic.momentumChange
 * @property {String} heroic.description
 * 
 * @extends SyntheticDocument
 */
export default class MomentumActionDocument extends SyntheticDocument {
  /**
   * @param {Object} args 
   * @param {Document} args.parentDocument 
   * @param {Number} args.index 
   * @override
   */
  static fromDto(dto, args) {
    return new MomentumActionDocument({
      parentDocument: args.parentDocument,
      index: args.index,
      id: dto.id,
    });
  }

  /**
   * Index of this document in the parent's collection. 
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
  get defaultImg() { return "systems/strive/presentation/image/momentum-action.svg"; }

  /**
   * Returns the class reference of this document. 
   * @type {MomentumActionDocument}
   * @readonly
   */
  get clazz() { return MomentumActionDocument; }

  /**
   * Returns the content type of this "document". 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return ITEM_TYPES.momentum_action; }

  get name() { return `${this.desperate.name} - ${this.heroic.name}`; }
  get description() { throw new Error("Unsupported"); }

  get desperate() {
    const thiz = this;
    return {
      /**
       * @type {String}
       */
      get name() { return thiz._desperate.name.value; },
      set name(value) { thiz._desperate.name.value = value; },

      /**
       * @type {String}
       */
      get img() { return thiz._desperate.img.value; },
      set img(value) { thiz._desperate.img.value = value; },

      /**
       * @type {Number}
       */
      get momentumChange() { return thiz._desperate.momentumChange.value; },
      set momentumChange(value) { thiz._desperate.momentumChange.value = value; },

      /**
       * @type {String}
       */
      get description() { return thiz._desperate.description.value; },
      set description(value) { thiz._desperate.description.value = value; },
    };
  }

  get heroic() {
    const thiz = this;
    return {
      /**
       * @type {String}
       */
      get name() { return thiz._heroic.name.value; },
      set name(value) { thiz._heroic.name.value = value; },

      /**
       * @type {String}
       */
      get img() { return thiz._heroic.img.value; },
      set img(value) { thiz._heroic.img.value = value; },

      /**
       * @type {Number}
       */
      get momentumChange() { return thiz._heroic.momentumChange.value; },
      set momentumChange(value) { thiz._heroic.momentumChange.value = value; },

      /**
       * @type {String}
       */
      get description() { return thiz._heroic.description.value; },
      set description(value) { thiz._heroic.description.value = value; },
    };
  }

  /**
   * @param {Object} args 
   * @param {Document} args.parentDocument 
   * @param {Number} args.index Index of the document in the parent's collection. 
   * @param {String | undefined} args.id Unique ID of this instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      pathOnParent: `system.momentumActions[${args.index}]`,
    });
    ValidationUtil.validateOrThrow(args, ["index"]);

    this.#index = args.index;

    this._desperate = {
      name: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.desperate.name",
        default: StringUtil.getLoca("system.item.momentumAction.desperate.defaultName"),
      }),
      img: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.desperate.img",
        default: "systems/strive/presentation/image/desperate-measure.svg",
      }),
      momentumChange: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.desperate.momentumChange",
        default: 0,
      }),
      description: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.desperate.description",
        default: "",
      }),
    };
    this._heroic = {
      name: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.heroic.name",
        default: StringUtil.getLoca("system.item.momentumAction.heroic.defaultName"),
      }),
      img: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.heroic.img",
        default: "systems/strive/presentation/image/heroic-act.svg",
      }),
      momentumChange: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.heroic.momentumChange",
        default: 0,
      }),
      description: new DataFieldBridge({
        document: this,
        updater: this._updater,
        dataPath: "system.heroic.description",
        default: "",
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
      desperate: {
        name: this.desperate.name,
        img: this.desperate.img,
        momentumChange: this.desperate.momentumChange,
        description: this.desperate.description,
      },
      heroic: {
        name: this.heroic.name,
        img: this.heroic.img,
        momentumChange: this.heroic.momentumChange,
        description: this.heroic.description,
      },
    };
  }

  /** @override */
  async openSheet() {
    return await new MomentumActionItemSheet(this).render(true);
  }
}
