import AmbersteelBaseActor from "./ambersteel-base-actor.mjs";

export default class AmbersteelPcActor extends AmbersteelBaseActor {
  /**
   * Prepare PC type specific data. 
   * @param actorData 'this.data'
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
}