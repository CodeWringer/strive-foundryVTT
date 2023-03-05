import Ruleset from "../../ruleset/ruleset.mjs";
import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
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
      get fateCards() { return thiz.items.filter(it => it.type === "fate-card"); },
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
   * Searches in: 
   * * Embedded fate-card name.
   * 
   * @override
   */
  _resolveReference(reference, comparableReference, propertyPath) {
    // Search fate-cards.
    for (const fateCard of this.fateSystem.fateCards) {
      const match = fateCard._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    return super._resolveReference(reference, comparableReference, propertyPath);
  }
}

ACTOR_SUBTYPE.set("pc", (document) => { return new TransientPc(document) });
