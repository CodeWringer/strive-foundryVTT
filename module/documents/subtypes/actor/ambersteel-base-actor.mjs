import PreparedChatData from '../../../dto/prepared-chat-data.mjs';
import * as UpdateUtil from "../../../utils/document-update-utility.mjs";
import * as ChatUtil from "../../../utils/chat-utility.mjs";
import InventoryIndex from '../../../dto/inventory-index.mjs';

const ITEM_GRID_COLUMN_COUNT = 4;

export default class AmbersteelBaseActor {
  /**
   * The owning Actor object. 
   * @type {Actor}
   */
  parent = undefined;

  /**
   * Two-dimensional array, which represents the item grid. 
   * @type {Array<Array<InventoryIndex | null>>}
   */
  get itemGrid() { return this.parent.itemGrid; }

  /**
   * @param parent {Actor} The owning Actor. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;

    this.parent.getChatData = this.getChatData.bind(this);
    this.parent.sendToChat = this.sendToChat.bind(this);
    this.parent.sendPropertyToChat = this.sendPropertyToChat.bind(this);
    this.parent.updateProperty = this.updateProperty.bind(this);
    this.parent.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(this);
    this.parent.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(this);
    this.parent.canItemFitOnGrid = this.canItemFitOnGrid.bind(this);
    this.parent.getItemsOnGridWithin = this.getItemsOnGridWithin.bind(this);
  }

  /**
   * Returns the icon image path for this type of Actor. 
   * @returns {String} The icon image path. 
   * @virtual
   */
  get img() { return "icons/svg/mystery-man.svg"; }

  /**
   * Prepare base data for the Actor. 
   * 
   * This should be non-derivable data, meaning it should only prepare the data object to ensure 
   * certain properties exist and aren't undefined. 
   * This should also set primitive data, even if it is technically derived, shouldn't be any 
   * data set based on extensive calculations. Setting the 'img'-property's path, based on the object 
   * type should be the most complex a 'calculation' as it gets. 
   * 
   * Base data *is* persisted!
   * @param {Actor} context
   * @virtual
   */
  prepareData(context) {
    const itemGrid = context.data.data.assets.grid;
    const maxBulk = context.data.data.assets.maxBulk;

    // Initialize item grid. 
    if (itemGrid.length === 0) {
      const newGrid = this._getNewItemGrid(ITEM_GRID_COLUMN_COUNT, maxBulk);
      context.data.data.assets.grid = newGrid;

      context.data.data.assets.gridIndices = [];
    }
  }

  /**
   * Prepare derived data for the Actor. 
   * 
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @virtual
   */
  prepareDerivedData(context) {
    context.data.data.assets.maxBulk = game.ambersteel.getCharacterMaximumInventory(this.parent);
    
    this._prepareDerivedAttributesData(context);
    this._prepareDerivedSkillsData(context);
    this._prepareDerivedHealthData(context);
  }

  /**
   * Prepares derived data for all attributes. 
   * @param context 
   * @private
   */
  _prepareDerivedAttributesData(context) {
    const actorData = context.data;
    for (const attGroupName in actorData.data.attributes) {
      const oAttGroup = actorData.data.attributes[attGroupName];

      for (const attName in oAttGroup) {
        const oAtt = oAttGroup[attName];
        this._prepareDerivedAttributeData(oAtt, attName);
      }
    }
  }

  /**
   * Prepares derived data for a given attribute. 
   * @param oAtt {Object} The attribute object. 
   * @param attName {String} Internal name of the attribute, e.g. 'magicSense'. 
   * @private
   */
  _prepareDerivedAttributeData(oAtt, attName) {
    const attValue = parseInt(oAtt.value);
    const req = game.ambersteel.getAttributeAdvancementRequirements(attValue);

    // Calculate advancement requirements. 
    oAtt.requiredSuccessses = req.requiredSuccessses;
    oAtt.requiredFailures = req.requiredFailures;

    // Add internal name. 
    oAtt.name = attName;

    // Add localizable string. 
    oAtt.localizableName = "ambersteel.attributes." + attName;
    oAtt.localizableAbbreviation = "ambersteel.attributeAbbreviations." + attName;
  }

  /**
 * Updates the given actorData with derived skill data. 
 * Assigns items of type skill to the derived lists 'actorData.skills' and 'actorData.learningSkills'. 
 * @param context 
 * @private
 */
  _prepareDerivedSkillsData(context) {
    const actorData = context.data.data;

    actorData.skills = (this.parent.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) > 0
    })).map(it => it.data);
    for (const oSkill of actorData.skills) {
      this._prepareDerivedSkillData(oSkill._id);
    };

    actorData.learningSkills = (this.parent.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) == 0
    })).map(it => it.data);
    for (const oSkill of actorData.learningSkills) {
      this._prepareDerivedSkillData(oSkill._id);
    };
  }

  /**
   * 
   * @param skillId {String} Id of a skill. 
   * @private
   */
  _prepareDerivedSkillData(skillId) {
    const oSkill = this.parent.items.get(skillId);
    const skillData = oSkill.data.data;

    skillData.id = oSkill.id;
    skillData.entityName = skillData.entityName ? skillData.entityName : oSkill.name;
    skillData.value = parseInt(skillData.value ? skillData.value : 0);
    skillData.successes = parseInt(skillData.successes ? skillData.successes : 0);
    skillData.failures = parseInt(skillData.failures ? skillData.failures : 0);
    skillData.relatedAttribute = skillData.relatedAttribute ? skillData.relatedAttribute : "agility";

    const req = game.ambersteel.getSkillAdvancementRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  _prepareDerivedHealthData(context) {
    const businessData = context.data.data;
    businessData.health.maxHP = game.ambersteel.getCharacterMaximumHp(context);
    businessData.health.maxInjuries = game.ambersteel.getCharacterMaximumInjuries(context);
    businessData.health.maxExhaustion = game.ambersteel.getCharacterMaximumExhaustion(context);
  }

  /**
   * Base implementation of returning data for a chat message, based on this Actor. 
   * @returns {PreparedChatData}
   * @virtual
   */
  getChatData() {
    const actor = this.parent;
    return new PreparedChatData({
      actor: actor,
      sound: "../sounds/notify.wav"
    });
  }

  /**
   * Base implementation of sending this Actor to the chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }

  /**
   * Sends a property of this item to chat, based on the given property path. 
   * @param {String} propertyPath 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode 
   * @async
   */
  async sendPropertyToChat(propertyPath, visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    await ChatUtil.sendPropertyToChat({
      obj: this.parent,
      propertyPath: propertyPath,
      parent: this.parent,
      actor: this.parent.actor,
      visibilityMode: visibilityMode
    });
  }

  /**
   * Updates a property on the parent Actor, identified via the given path. 
   * @param {String} propertyPath Path leading to the property to update, on the parent Actor. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue) {
    await UpdateUtil.updateProperty(this.parent, propertyPath, newValue);
  }

  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @param {String} itemId The id of the skill item to advance. 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, itemId) {
    const oSkill = this.parent.items.get(itemId);
    oSkill.addProgress(rollResult.isSuccess, false);
  }

  /**
   * Attribute roll handler. 
   * @param {DicePoolResult} rollResult 
   * @param {String} attributeName The name of the attribute. 
   * @async
   */
  async advanceAttributeBasedOnRollResult(rollResult, attributeName) {
    await this.parent.addAttributeProgress(attributeName, rollResult.isSuccess);
  }

  /**
   * Returns a new, blank item grid with the given number of columns. 
   * @param {Number} columnCount Number of columns the grid will have. 
   * @param {Number} capacity Number of slots (tiles) the item grid will have. 
   * @returns {Array<Array<InventoryIndex | null>>}
   * @private
   */
  _getNewItemGrid(columnCount, capacity) {
    // This function builds a two-dimensional array sequentially, 
    // row by row. 

    let x = 0; // Current column

    const result = [];
  
    for (let i = 0; i < capacity; i++) {
      while (result.length <= x) {
        result.push([]);
      }
      result[x].push(null);
  
      x++;
      if (x == columnCount) {
        x = 0;
      }
    }

    return result;
  }

  /**
   * Tests if the given item could fit on the item grid and returns the result, 
   * also contains the grid coordinates and orientation of where it would fit. 
   * @param {AmbersteelItemItem} item 
   * @returns {GridCapacityTestResult}
   */
  canItemFitOnGrid(item) {
    const itemGrid = this.itemGrid;
    const columnCount = itemGrid.length;

    const shape = item.data.data.shape;

    for (let x = 0; x < columnCount; x++) {
      const rowCount = itemGrid[x].length;
      for (let y = 0; y < rowCount; y++) {
        // Test default (vertical) orientation. 
        // Test for bounds of grid. 
        if (x + shape.width - 1 >= columnCount) continue;
        if (y + shape.height - 1 >= rowCount) continue;
        
        let overlappedItems = this.getItemsOnGridWithin(x, y, shape.width, shape.height);
        
        if (overlappedItems.length === 0) {
          return new GridCapacityTestResult(true, x, y, game.ambersteel.config.itemOrientations.vertical);
        }
        
        // Test rotated (horizontal) orientation. 
        // Test for bounds of grid. 
        if (x + shape.height - 1 >= columnCount) continue;
        if (y + shape.width - 1 >= rowCount) continue;
        
        overlappedItems = this.getItemsOnGridWithin(x, y, shape.height, shape.width);
        if (overlappedItems.length === 0) {
          return new GridCapacityTestResult(true, x, y, game.ambersteel.config.itemOrientations.horizontal);
        }
      }
    }

    return new GridCapacityTestResult(false, undefined, undefined, undefined);
  }

  /**
   * Returns all items on grid that can be at least partially contained by a 
   * rectangle spanning the given dimensions, at the given position. 
   * @param {Number} gridX In grid coordinates. 
   * @param {Number} gridY In grid coordinates. 
   * @param {Number} gridWidth In grid coordinates. 
   * @param {Number} gridHeight In grid coordinates. 
   * @returns {Array<GridOverlapTestResult>}
   */
  getItemsOnGridWithin(gridX, gridY, gridWidth, gridHeight) {
    const result = [];

    const right = gridX + gridWidth - 1;
    const bottom = gridY + gridHeight - 1;

    for (let x = gridX; x <= right; x++) {
      for (let y = gridY; y <= bottom; y++) {
        const itemOnGrid = this.itemGrid[x][y];
        if (itemOnGrid !== null) {
          const itemRight = itemOnGrid.x + itemOnGrid.w - 1;
          const itemBottom = itemOnGrid.y + itemOnGrid.h - 1;

          // Ensure no duplicate entries. 
          const duplicate = result.find((element) => { return element.id === itemOnGrid.id; });
          if (duplicate !== undefined) continue;

          const isPartial = ((itemOnGrid.x < gridX) || (itemRight > right) 
            || itemOnGrid.y < gridY || itemBottom > bottom);

          result.push(new GridOverlapTestResult(itemOnGrid, isPartial));
        }
      }
    }

    return result;
  }
}

/**
 * Represents the result of a test whether an item can fit on the item grid. 
 */
export class GridCapacityTestResult {
  /**
   * @param {Boolean} result True, if the item can fit. 
   * @param {Number} x Column on grid where the item can fit. 
   * @param {Number} y Row on grid where the itme can fit. 
   * @param {CONFIG.itemOrientations} orientation Which orientation the item must be in to be able to fit. 
   */
  constructor(result, x, y, orientation) {
    this.result = result;
    this.x = x;
    this.y = y;
    this.orientation = orientation;
  }
}

/**
 * Represents the result of a test which items on the grid overlap a given region on the grid. 
 */
export class GridOverlapTestResult {
  /**
   * @param {InventoryIndex} item The item overlapped by the region on grid. 
   * @param {Boolean} isPartial If true, the item in question is only partially contained. 
   */
  constructor(item, isPartial) {
    this.item = item;
    this.isPartial = isPartial;
  }
}