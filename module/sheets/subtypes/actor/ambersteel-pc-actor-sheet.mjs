import AmbersteelBaseActorSheet from "./ambersteel-base-actor-sheet.mjs";

export default class AmbersteelPcActorSheet extends AmbersteelBaseActorSheet {
  /**
   * Extends the given context object with derived data. 
   * 
   * This is where any data should be added, which is only required to 
   * display the data via the parent sheet. 
   * @param context {Object} A context data object. Some noteworthy properties are 
   * 'actor', 'CONFIG', 'isSendable' and 'isEditable'. 
   * @virtual
   */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    this._prepareFateSystemDerivedData(context);
  }

  /**
   * Prepares fate system derived data for display on actor sheet. 
   * @param context 
   */
  _prepareFateSystemDerivedData(context) {
    const maxCards = CONFIG.ambersteel.fateSystem.maxCards;
    const fateSystemData = context.data.data.fateSystem;

    fateSystemData.cards = (this.getActor().items.filter(item => {
      return item.data.type === "fate-card"
    })).map(it => it.data);
    fateSystemData.remainingSlots = maxCards - fateSystemData.cards.length;
  }
}