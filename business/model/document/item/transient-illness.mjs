import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import Reference from "../../domain/reference.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * Represents the full transient data of an illness. 
 * 
 * @see `IllnessItemData` - Must contain all the fields defined in this data model. 
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
 * @property {Object} treatment
 * * Read-only.
 * @property {String} treatment.obstacle
 * @property {Reference} treatment.skill
 * @property {Object} treatment.requiredSupplies
 * * Read-only.
 * @property {Number} treatment.requiredSupplies.amount
 * @property {Reference} treatment.requiredSupplies.asset
 * @property {Object} healProgress
 * * Read-only.
 * @property {Number} healProgress.current
 * @property {Number} healProgress.required
 * @property {Boolean} healProgress.untilCured
 * 
 * @extends TransientBaseItem
 */
export default class TransientIllness extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "systems/strive/presentation/image/illness-light.svg"; }

  /** @override */
  get clazz() { return TransientIllness; }

  get treatment() {
    const thiz = this;
    return {
      /**
       * @type {String}
       */
      get obstacle() { return thiz._treatment.obstacle.value; },
      set obstacle(value) { thiz._treatment.obstacle.value = value; },

      /**
       * @type {Reference}
       */
      get skill() { return thiz._treatment.skill.value; },
      set skill(value) { thiz._treatment.skill.value = value; },

      get requiredSupplies() {
        return {
          /**
           * @type {Number}
           */
          get amount() { return thiz._treatment.requiredSupplies.amount.value; },
          set amount(value) { thiz._treatment.requiredSupplies.amount.value = value; },

          /**
           * @type {Reference}
           */
          get asset() { return thiz._treatment.requiredSupplies.asset.value; },
          set asset(value) { thiz._treatment.requiredSupplies.asset.value = value; },
        };
      },
    };
  }


  get healProgress() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get current() { return thiz._healProgress.current.value; },
      set current(value) { thiz._healProgress.current.value = value; },

      /**
       * @type {Number}
       */
      get required() { return thiz._healProgress.required.value; },
      set required(value) { thiz._healProgress.required.value = value; },

      /**
       * @type {Boolean}
       */
      get untilCured() { return thiz._healProgress.untilCured.value; },
      set untilCured(value) { thiz._healProgress.untilCured.value = value; },
    };
  }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._treatment = {
      obstacle: new DataFieldBridge({
        document: this,
        dataPath: "system.treatment.obstacle",
      }),
      skill: new DataFieldBridge({
        document: this,
        dataPath: "system.treatment.skill",
        fromDto: (dto) => {
          return Reference.fromDto(dto);
        },
        toDto: (value) => {
          if (ValidationUtil.isDefined(value)) {
            return value.toDto();
          } else {
            return new Reference();
          }
        },
      }),

      requiredSupplies: {
        amount: new DataFieldBridge({
          document: this,
          dataPath: "system.treatment.requiredSupplies.amount",
        }),
        asset: new DataFieldBridge({
          document: this,
          dataPath: "system.treatment.requiredSupplies.asset",
          fromDto: (dto) => {
            return Reference.fromDto(dto);
          },
          toDto: (value) => {
            if (ValidationUtil.isDefined(value)) {
              return value.toDto();
            } else {
              return new Reference();
            }
          },
        }),
      }
    };

    this._healProgress = {
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.healProgress.current",
      }),
      required: new DataFieldBridge({
        document: this,
        dataPath: "system.healProgress.required",
      }),
      untilCured: new DataFieldBridge({
        document: this,
        dataPath: "system.healProgress.untilCured",
      }),
    };
  }
}
