import Ruleset from "../../ruleset/ruleset.mjs";
import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of a pc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Array<TransientFateCard>} fateCards
 * * Read-only. 
 * @property {Number} maxFateCards The maximum number of fate cards allowed on the actor. 
 * * Read-only. 
 * @property {Number} remainingFateCards The remaining number of fate cards currently 
 * allowed on the actor. 
 * * Read-only. 
 */
export default class TransientPc extends TransientBaseCharacterActor {
  /**
   * @type {Array<TransientFateCard>}
   * @readonly
   */
  get fateCards() { return this.items.filter(it => it.type === "fate-card"); };

  /**
   * The maximum number of fate cards allowed on the actor. 
   * 
   * @type {Number}
   * @readonly
   */
  get maxFateCards() { return new Ruleset().getMaximumFateCards(); };

  /**
   * The remaining number of fate cards currently allowed on the actor. 
   * 
   * @type {Number}
   * @readonly
   */
  get remainingFateCards() { return this.maxFateCards - this.fateCards.length; };

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
