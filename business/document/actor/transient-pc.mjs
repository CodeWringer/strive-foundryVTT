import Ruleset from "../../ruleset/ruleset.mjs";
import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of a pc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Object} beliefSystem
 * * Read-only. 
 * @property {String} beliefSystem.ambition
 * @property {Object} beliefSystem.beliefs
 * @property {String} beliefSystem.beliefs.0
 * @property {String} beliefSystem.beliefs.1
 * @property {String} beliefSystem.beliefs.2
 * @property {Object} beliefSystem.instincts
 * @property {String} beliefSystem.instincts.0
 * @property {String} beliefSystem.instincts.1
 * @property {String} beliefSystem.instincts.2
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
  get beliefSystem() {
    const thiz = this;

    return {
      get ambition() { return thiz.document.system.beliefSystem.ambition; },
      set ambition(value) { thiz.updateByPath("system.beliefSystem.ambition", value); },

      get beliefs() {
        return {
          get _0() { return thiz.document.system.beliefSystem.beliefs._0; },
          set _0(value) { thiz.updateByPath("system.beliefSystem.beliefs._0", value); },
          get _1() { return thiz.document.system.beliefSystem.beliefs._1; },
          set _1(value) { thiz.updateByPath("system.beliefSystem.beliefs._1", value); },
          get _2() { return thiz.document.system.beliefSystem.beliefs._2; },
          set _2(value) { thiz.updateByPath("system.beliefSystem.beliefs._2", value); },
        }
      },
     
      get instincts() {
        return {
          get _0() { return thiz.document.system.beliefSystem.instincts._0; },
          set _0(value) { thiz.updateByPath("system.beliefSystem.instincts._0", value); },
          get _1() { return thiz.document.system.beliefSystem.instincts._1; },
          set _1(value) { thiz.updateByPath("system.beliefSystem.instincts._1", value); },
          get _2() { return thiz.document.system.beliefSystem.instincts._2; },
          set _2(value) { thiz.updateByPath("system.beliefSystem.instincts._2", value); },
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
