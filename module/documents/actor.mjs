import AmbersteelPcActor from './subtypes/actor/ambersteel-pc-actor.mjs';
import AmbersteelNpcActor from './subtypes/actor/ambersteel-npc-actor.mjs';
import { deleteByPropertyPath } from '../utils/document-update-utility.mjs';

/**
 * @extends {Actor}
 * @property person {Object}
 * @property attributeGroups: {Object}
 * @property learningSkills: {[Object]}
 * @property skills: {[Object]}
 * @property beliefSystem: {Object}
 * @property fateSystem: {Object}
 * @property biography: {Object}
 */
export class AmbersteelActor extends Actor {
  /**
   * @private
   */
  _subType = undefined;
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   */
  get subType() {
    if (!this._subType) {
      const type = this.type;

      if (type === "pc") {
        this._subType = new AmbersteelPcActor(this);
      } else if (type === "npc") {
        this._subType = new AmbersteelNpcActor(this);
      } else {
        throw `Actor subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /** @override */
  prepareData() {
    super.prepareData();
    this.subType.prepareData(this);
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.subType.prepareDerivedData(this);
  }

  /**
   * Returns items of this actor, filtered by the given type. 
   * @param {String} type The exact type to filter by. 
   * @returns {Array<Item>} Items of the given type, of this actor. 
   */
  getItemsByType(type) {
    const items = Array.from(this.items);
    const result = [];
    for (const item of items) {
      if (item.type === type) result.push(item);
    }
    return result;
  }

  /**
   * @returns {Array<Item>} A list of "injury" type items that represent injuries of 
   * this character. 
   * @readonly
   */
  get injuries() { return this.getItemsByType("injury"); }
  
  /**
   * @returns {Array<Item>} A list of "illness" type items that represent illnesses of 
   * this character. 
   * @readonly
   */
  get illnesses() { return this.getItemsByType("illness"); }
  
  /**
   * @type {Array<AmbersteelItemItem>} A list of "item" type items that represent things owned 
   * by this character, and currently on their person. 
   * @readonly
   */
  get possessions() {
    const items = Array.from(this.items);
    return items.filter((item) => { return item.type === "item" && item.data.data.isOnPerson; });
  }

  /**
   * @returns {Array<Item>} A list of "item" type items that represent things owned 
   * by this character, but not on their person. 
   */
  get propertyItems() { 
    const items = Array.from(this.items);
    return items.filter((item) => { return item.type === "item" && !item.data.data.isOnPerson; });
  }

  /**
   * 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @returns {Object} With properties 'object', 'name', 'groupName'
   * @private
   */
  getAttributeForName(attName) {
    const data = this.data.data;

    for (let attGroupName in data.attributes) {
      let oAtt = data.attributes[attGroupName][attName];
      if (oAtt) {
        return {
          object: oAtt,
          name: attName,
          groupName: attGroupName
        };
      }
    }
  }

  /**
   * Sets the level of the attribute with the given name. 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param newValue {Number} Value to set the attribute to, e.g. 0. Default 0
   * @async
   */
  async setAttributeLevel(attName = undefined, newValue = 0) {
    const oAttName = this.getAttributeForName(attName);
    const req = game.ambersteel.getAttributeAdvancementRequirements(newValue);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    await this.update({
      [`${propertyPath}.value`]: newValue,
      [`${propertyPath}.requiredSuccessses`]: req.requiredSuccessses,
      [`${propertyPath}.requiredFailures`]: req.requiredFailures,
      [`${propertyPath}.successes`]: 0,
      [`${propertyPath}.failures`]: 0
    });
  }

  /**
   * Adds success/failure progress to an attribute. 
   * 
   * Also auto-levels up the attribute, if 'autoLevel' is set to true. 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
   * @param autoLevel {Boolean} If true, will auto-level up. Default false
   * @async
   */
  async addAttributeProgress(attName = undefined, success = false, autoLevel = false) {
    const oAttName = this.getAttributeForName(attName);
    const oAtt = oAttName.object;

    const successes = parseInt(oAtt.successes);
    const failures = parseInt(oAtt.failures);
    const requiredSuccessses = parseInt(oAtt.requiredSuccessses);
    const requiredFailures = parseInt(oAtt.requiredFailures);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    if (success) {
      await this.update({ [`${propertyPath}.successes`]: successes + 1 });
    } else {
      await this.update({ [`${propertyPath}.failures`]: failures + 1 });
    }

    if (autoLevel) {
      if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
        const newLevel = parseInt(oAtt.value) + 1;
        await this.setAttributeLevel(attName, newLevel);
      }
    }
  }

  async deleteByPropertyPath(propertyPath) {
    await deleteByPropertyPath(this, propertyPath);
  }
}