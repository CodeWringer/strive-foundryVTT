import AtReferencer from "../../referencing/at-referencer.mjs";
import Ruleset from "../../ruleset/ruleset.mjs";
import { isDefined } from "../../util/validation-utility.mjs";
import { ITEM_TYPES } from "../item/item-types.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of a pc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
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
 * @property {Object} fateSystem
 * * Read-only. 
 * @property {Array<TransientFateCard>} fateSystem.fateCards
 * * Read-only. 
 * @property {Number} fateSystem.maxFateCards The maximum number of fate cards allowed on the actor. 
 * * Read-only. 
 * @property {Number} fateSystem.remainingFateCards The remaining number of fate cards currently 
 * allowed on the actor. 
 * * Read-only. 
 * @property {Number} fateSystem.miFP
 * @property {Number} fateSystem.maFP
 * @property {Number} fateSystem.AFP
 */
export default class TransientPc extends TransientBaseCharacterActor {
  /**
   * @type {Object}
   * @readonly
   */
  get driverSystem() {
    const thiz = this;

    return {
      get ambition() { return thiz.document.system.driverSystem.ambition; },
      set ambition(value) { thiz.updateByPath("system.driverSystem.ambition", value); },

      get aspirations() {
        return {
          get _0() { return thiz.document.system.driverSystem.aspirations._0; },
          set _0(value) { thiz.updateByPath("system.driverSystem.aspirations._0", value); },
          get _1() { return thiz.document.system.driverSystem.aspirations._1; },
          set _1(value) { thiz.updateByPath("system.driverSystem.aspirations._1", value); },
          get _2() { return thiz.document.system.driverSystem.aspirations._2; },
          set _2(value) { thiz.updateByPath("system.driverSystem.aspirations._2", value); },
        }
      },
     
      get reactions() {
        return {
          get _0() { return thiz.document.system.driverSystem.reactions._0; },
          set _0(value) { thiz.updateByPath("system.driverSystem.reactions._0", value); },
          get _1() { return thiz.document.system.driverSystem.reactions._1; },
          set _1(value) { thiz.updateByPath("system.driverSystem.reactions._1", value); },
          get _2() { return thiz.document.system.driverSystem.reactions._2; },
          set _2(value) { thiz.updateByPath("system.driverSystem.reactions._2", value); },
        }
      },
    };
  }
  
  /**
   * @type {Object}
   * @readonly
   */
  get fateSystem() {
    const thiz = this;
    
    return {
      get fateCards() { return thiz.items.filter(it => it.type === ITEM_TYPES.FATE_CARD); },
      get maxFateCards() { return new Ruleset().getMaximumFateCards(); },
      get remainingFateCards() { return this.maxFateCards - this.fateCards.length; },

      get miFP() { return thiz.document.system.fateSystem.miFP; },
      set miFP(value) { thiz.updateByPath("system.fateSystem.miFP", value); },

      get maFP() { return thiz.document.system.fateSystem.maFP; },
      set maFP(value) { thiz.updateByPath("system.fateSystem.maFP", value); },

      get AFP() { return thiz.document.system.fateSystem.AFP; },
      set AFP(value) { thiz.updateByPath("system.fateSystem.AFP", value); },
    };
  }

  /**
   * @param {Actor} actor An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `actor` is `undefined`. 
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * Tries to resolve the given reference in the embedded documents of 
   * this document. 
   * 
   * Searches in: 
   * * Embedded fate-cards.
   * 
   * This method will be called implicitly, by an `AtReferencer`, when it tries 
   * to resolve a reference on *this* document. 
   * 
   * @param {String} comparableReference A comparable version of a reference. 
   * * Comparable in the sense that underscores "_" are replaced with spaces " " 
   * or only the last piece of a property path is returned. 
   * * E. g. `"@Heavy_Armor"` -> `"@heavy armor"`
   * * E. g. `"@A.B.c"` -> `"a"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, 
   * if no match was found. 
   */
  resolveReference(comparableReference, propertyPath) {
    const collectionsToSearch = [
      this.fateSystem.fateCards,
    ];
    const r = new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);

    if (isDefined(r)) {
      return r;
    } else {
      return super.resolveReference(comparableReference, propertyPath);
    }
  }
}
