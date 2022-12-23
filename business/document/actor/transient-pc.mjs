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
 * @property {Array<String>} beliefSystem.beliefs
 * @property {Array<String>} beliefSystem.instincts
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
      get ambition() { return thiz.document.data.data.beliefSystem.ambition; },
      set ambition(value) { thiz.updateSingle("data.data.beliefSystem.ambition", value); },

      get beliefs() { return thiz.document.data.data.beliefSystem.beliefs; },
      set beliefs(value) { thiz.updateSingle("data.data.beliefSystem.beliefs", value); },

      get instincts() { return thiz.document.data.data.beliefSystem.instincts; },
      set instincts(value) { thiz.updateSingle("data.data.beliefSystem.instincts", value); },
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
      get remainingFateCards() { return thiz.maxFateCards - this.fateCards.length; },

      get miFP() { return thiz.document.data.data.fateSystem.miFP; },
      set miFP(value) { thiz.updateSingle("data.data.fateSystem.miFP", value); },

      get maFP() { return thiz.document.data.data.fateSystem.maFP; },
      set maFP(value) { thiz.updateSingle("data.data.fateSystem.maFP", value); },

      get AFP() { return thiz.document.data.data.fateSystem.AFP; },
      set AFP(value) { thiz.updateSingle("data.data.fateSystem.AFP", value); },
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
   * Prepare PC type specific data. 
   * @param {Actor} context
   * @override
   */
  prepareData(context) {
    super.prepareData(context);

    const actorData = context.data.data;

    // Ensure beliefs array has 3 items. 
    while (actorData.beliefSystem.beliefs.length < 3) {
      actorData.beliefSystem.beliefs.push("")
    }

    // Ensure instincts array has 3 items. 
    while (actorData.beliefSystem.instincts.length < 3) {
      actorData.beliefSystem.instincts.push("")
    }
  }

  /**
   * Searches in: 
   * * Embedded fate-card name.
   * 
   * @override
   */
  _resolveReference(reference, comparableReference) {
    // Search fate-cards.
    for (const fateCard of this.fateCards) {
      const match = fateCard._resolveReference(reference, comparableReference);
      if (match !== undefined) {
        return match;
      }
    }

    return super._resolveReference(reference, comparableReference);
  }
}

ACTOR_SUBTYPE.set("pc", (document) => { return new TransientPc(document) });
