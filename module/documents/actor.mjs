/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class AmbersteelActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.boilerplate || {};

    // Holds attribute group objects for easy access. 
    data.attributeGroups = {}

    // Initialize flag to indicate whether any magical attribute has a level > 0. 
    data.isMagical = false;

    for (let attGroup in data.attributes) {
      if (!data.attributes.hasOwnProperty(attGroup)) continue;
      
      // Initialize attribute group object with meta-data. 
      data.attributeGroups[attGroup] = {
        name: "ambersteel.attributeGroups." + attGroup,
        attributes: {}
      }

      let oAttGroup = data.attributes[attGroup]

      for (let att in oAttGroup) {
        if (!oAttGroup.hasOwnProperty(att)) continue;
        
        let oAtt = oAttGroup[att]

        let attValue = oAtt.value + 1
        oAtt.requiredSuccessses = attValue * attValue * 3
        oAtt.requiredFailures = attValue * attValue * 4

        oAtt.name = "ambersteel.attributes." + att
        oAtt.abbreviation = "ambersteel.attributeAbbreviations." + att

        // Add attribute object to attributeGroups for easy access.
        data.attributeGroups[attGroup].attributes[att] = oAtt

        // Characters with any magical ability are classified as magical.
        if (oAtt.value > 0 && (att == "arcana" || att == "magicSense")) {
          data.isMagical = true;
        }
      }
    }

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._preparePCData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _preparePCData(actorData) {
    if (actorData.type !== 'pc') return;

    // Make modifications to data here. For example:
    const data = actorData.data;

    // Ensure beliefs array has 3 items. 
    while (data.beliefSystem.beliefs.length < 3) {
      data.beliefSystem.beliefs.push("")
    }

    // Ensure instincts array has 3 items. 
    while (data.beliefSystem.instincts.length < 3) {
      data.beliefSystem.instincts.push("")
    }
  }

  // /**
  //  * Override getRollData() that's supplied to rolls.
  //  */
  // getRollData() {
  //   const data = super.getRollData();

  //   // Prepare character roll data.
  //   this._getCharacterRollData(data);

  //   return data;
  // }

  // /**
  //  * Prepare character roll data.
  //  */
  // _getCharacterRollData(data) {
  //   if (this.data.type !== 'character') return;

  //   // Copy the ability scores to the top level, so that rolls can use
  //   // formulas like `@str.mod + 4`.
  //   if (data.abilities) {
  //     for (let [k, v] of Object.entries(data.abilities)) {
  //       data[k] = foundry.utils.deepClone(v);
  //     }
  //   }

  //   // Add level for easier access, or fall back to 0.
  //   if (data.attributes.level) {
  //     data.lvl = data.attributes.level.value ?? 0;
  //   }
  // }
}