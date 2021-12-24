import AmbersteelPcActor from './subtypes/actor/ambersteel-pc-actor.mjs';
import AmbersteelNpcActor from './subtypes/actor/ambersteel-npc-actor.mjs';
import { deleteByPropertyPath } from '../utils/document-update-utility.mjs';
import InventoryIndex from '../dto/inventory-index.mjs';
import { EventEmitter } from '../utils/event-emitter.mjs';

export const ActorEvents = {
  possessionAdded: "possession-added",
  possessionRemoved: "possession-removed",
  possessionUpdated: "possession-updated"
}

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

  /**
   * Central event aggregator. 
   * @see {ActorEvents} for a list of emitted events. 
   */
  _eventEmitter = new EventEmitter();

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
   */
  get injuries() { return this.getItemsByType("injury"); }
  get injuryCount() { return this.injuries.length; }
  
  /**
   * @returns {Array<Item>} A list of "illness" type items that represent illnesses of 
   * this character. 
   */
  get illnesses() { return this.getItemsByType("illness"); }
  get illnessCount() { return this.illnesses.length; }
  
  /**
   * @returns {Array<Item>} A list of "item" type items that represent things owned 
   * by this character, and currently on their person. 
   */
  get possessions() { 
    const items = Array.from(this.items);
    const result = [];
    for (const item of items) {
      if (item.type === "item" && item.data.data.isOnPerson) result.push(item);
    }
    return result;
  }
  get possessionsCount() { return this.possessions.length; }

  /**
   * Returns the metadata of possessions on the item grid. 
   * @returns {Array<InventoryIndex>} A list of item metadata. 
   */
  get possessionsIndices() {
    return this.data.data.assets.inventory;
  }

  /**
   * Returns the total bulk (= carrying capacity) of this character. 
   * @returns {Number} The total bulk (= carrying capacity) of this character. 
   */
  get maxBulk() {
    return game.ambersteel.getCharacterMaximumInventory(this);
  }

  /**
   * Returns the total used bulk (= used carrying capacity) of this character. 
   * @returns {Number} The total used bulk (= used carrying capacity) of this character. 
   */
  get totalBulk() {
    let total = 0;
    for (const possession of this.possessions) {
      total += possession.data.data.bulk;
    }
    return total;
  }

  /**
   * @returns {Array<Item>} A list of "item" type items that represent things owned 
   * by this character, but not on their person. 
   */
  get propertyItems() { 
    const items = Array.from(this.items);
    const result = [];
    for (const item of items) {
      if (item.type === "item" && !item.data.data.isOnPerson) result.push(item);
    }
    return result;
  }
  get propertyItemCount() { return this.propertyItems.length; }

  // TODO: Move to ambersteel-base-actor.mjs
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

  // TODO: Move to ambersteel-base-actor.mjs
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

  // TODO: Move to ambersteel-base-actor.mjs
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

  /**
   * Registers an event listener for the given event, which will fire every time the event is emitted. 
   * @param {ActorEvents} event The type of event to register. 
   * @param {Function} callback Gets called whenever the event is emitted. 
   * @returns {Any} An identifier that can be used to unregister the just registered 
   * event listener, with the 'off'-method. 
   */
  on(event, callback) {
    return this._eventEmitter.on(event, callback);
  }
  
  /**
   * Registers an event listener for the given event, which will fire only once. 
   * @param {ActorEvents} event The type of event to register. 
   * @param {Function} callback Gets called whenever the event is emitted. 
   * @returns {Any} An identifier that can be used to unregister the just registered 
   * event listener, with the 'off'-method. 
   */
  once(event, callback) {
    return this._eventEmitter.once(event, callback);
  }

  /**
   * Unregisters an event listener, based on the given identifier. 
   * @param eventIdentifier An event identifier. 
   */
  off(eventIdentifier) {
    this._eventEmitter.off(eventIdentifier)
  }

  /** 
   * @override 
   */
  _preCreateEmbeddedDocuments(embeddedName, result, options, userId) {
    const items = result.filter(it => it.type === "item");
    const ailments = result.filter(it => it.type === "injury" || it.type === "illness");

    for (const item of items) {
      if (item.data.isOnPerson) {
        this._eventEmitter.emit(ActorEvents.possessionAdded, item);
      }
    }
    
    return super._preCreateEmbeddedDocuments(embeddedName, result, options, userId);
  }
  
  /** 
   * @override 
   */
  async _preUpdateEmbeddedDocuments(embeddedName, result, options, userId) {
    for (const dataDelta of result) {
      const id = dataDelta._id;
      const updatedItem = this.items.get(id);
  
      if (updatedItem.type === "item") {
        if (updatedItem.data.data.isOnPerson) {
          const existing = this.possessions.find((element) => { return element.id === updatedItem.id; });

          if (existing !== undefined) {
            // Possession is not yet in the possessions list -> is about 
            // to be added. 
            this._eventEmitter.emit(ActorEvents.possessionAdded, updatedItem);
          } else {
            this._eventEmitter.emit(ActorEvents.possessionUpdated, updatedItem);
          }
        }
      } else if (updatedItem.type === "injury" || updatedItem.type === "illness") {
        // TODO
      }
    }
    
    return super._preUpdateEmbeddedDocuments(embeddedName, result, options, userId);
  }
  
  /** 
   * @override 
   */
  _preDeleteEmbeddedDocuments(embeddedName, result, options, userId) {
    for (const id of result) {
      const itemToDelete = this.items.get(id);

      if (itemToDelete.type === "item") {
        if (itemToDelete.data.data.isOnPerson) {
          this._eventEmitter.emit(ActorEvents.possessionRemoved, itemToDelete);
        }
      } else if (itemToDelete.type === "injury" || itemToDelete.type === "illness") {
        // TODO
      }
    }

    return super._preDeleteEmbeddedDocuments(embeddedName, result, options, userId);
  }
}