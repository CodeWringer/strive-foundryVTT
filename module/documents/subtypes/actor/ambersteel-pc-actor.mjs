import AmbersteelBaseCharacterActor from "./ambersteel-base-character-actor.mjs";

export default class AmbersteelPcActor extends AmbersteelBaseCharacterActor {
  /**
   * Prepare PC type specific data. 
   * @param {Actor} context
   * @override
   */
  prepareData(context) {
    super.prepareData(context);
    const actorData = context.data.data;

    context.getFateCards = () => { return context.getItemsByType("fate-card"); }

    // Ensure beliefs array has 3 items. 
    while (actorData.beliefSystem.beliefs.length < 3) {
      actorData.beliefSystem.beliefs.push("")
    }

    // Ensure instincts array has 3 items. 
    while (actorData.beliefSystem.instincts.length < 3) {
      actorData.beliefSystem.instincts.push("")
    }
  }

  prepareDerivedData(context) {
    super.prepareDerivedData(context);
    this._prepareDerivedFateSystemData(context);
  }

  /**
   * Prepares fate system derived data for display on actor sheet. 
   * @param context 
   * @private
   */
  _prepareDerivedFateSystemData(context) {
    const maxCards = CONFIG.ambersteel.fateSystem.maxCards;
    const fateSystemData = context.data.data.fateSystem;

    fateSystemData.remainingSlots = maxCards - context.fateCards.length;
  }
}