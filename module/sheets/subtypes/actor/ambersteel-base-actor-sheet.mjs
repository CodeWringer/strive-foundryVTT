import * as Dice from "../../../helpers/dice.mjs";
import * as SheetUtil from '../../../utils/sheet-utility.mjs';
import { queryVisibilityMode } from "../../../utils/chat-utility.mjs";

export default class AmbersteelBaseActorSheet {
  /**
   * The owning ActorSheet object. 
   * @type {ActorSheet}
   */
  parent = undefined;

  /**
   * @param parent {ActorSheet} The owning ActorSheet. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;
  }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   */
  get template() { 
    return "systems/ambersteel/templates/actor/actor-character-sheet.hbs"; 
  }

  static get itemContextMenu() { 
    return [
      {
        name: game.i18n.localize("ambersteel.labels.delete"),
        icon: '<i class="fas fa-trash"></i>',
        callback: el => {
          const item = this.getItem(el.data("item-id"));
          item.delete();
        }
      }
    ];
  }

  /**
   * Returns the actor object of the parent sheet. 
   * @returns {Actor} The actor object of the parent sheet. 
   */
  getActor() {
    return this.parent.actor;
  }

  /**
   * Returns the item object with the given id of the parent sheet. 
   * @param {String} itemId The id of the item to fetch. 
   * @returns {Item} The item object of the parent sheet. 
   */
  getItem(itemId) {
    return this.getActor().items.get(itemId);
  }

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
    // Use a safe clone of the actor data for further operations. 
    // It is "safe", because behind the scenes, a getter returns a clone. 
    const actorData = context.actor.data.data;

    // General derived data. 
    context.data.person = actorData.person;
    context.data.attributeGroups = this._getDerivedAttributeGroups(actorData.attributes);
    context.data.beliefSystem = actorData.beliefSystem;
    context.data.fateSystem = actorData.fateSystem;
    context.data.biography = actorData.biography;
    context.data.learningSkills = actorData.learningSkills;
    context.data.skills = actorData.skills;
  }

  /**
   * 
   * @param attributes {Object} The root attributes object. 
   */
  _getDerivedAttributeGroups(attributes) {
    // Holds attribute group objects for easy access. 
    const attributeGroups = {};

    for (const attGroupName in attributes) {
      if (!attributes.hasOwnProperty(attGroupName)) continue;

      const oAttGroup = attributes[attGroupName];
      
      // Initialize attribute group object with meta-data. 
      attributeGroups[attGroupName] = {
        localizableName: "ambersteel.attributeGroups." + attGroupName,
        name: attGroupName,
        attributes: {}
      };

      for (const attName in oAttGroup) {
        if (!oAttGroup.hasOwnProperty(attName)) continue;
        
        attributeGroups[attGroupName].attributes[attName] = oAttGroup[attName];
      }
    }
    return attributeGroups;
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param html {Object} DOM of the sheet for which to register listeners. 
   * @param isOwner {Boolean} If true, registers events that require owner permission. 
   * @param isEditable {Boolean} If true, registers events that require editing permission. 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) {
    // Show item sheet.
    html.find(".ambersteel-item-show").click(this._onItemShow.bind(this));

    // Show skill abilities. 
    html.find(".ambersteel-expand-skill-ability-list").click(this._onExpandSkillAbilityList.bind(this));

    // -------------------------------------------------------------
    if (!isOwner) return;

    // Send item to chat. 
    html.find(".ambersteel-item-to-chat").click(this._onItemSendToChat.bind(this));

    // Send actor to chat. 
    html.find(".ambersteel-actor-to-chat").click(this._onActorSendToChat.bind(this));

    // Drag events for macros.
    const handler = ev => this._onDragStart(ev);
    html.find('li.item').each((i, li) => {
      if (li.classList.contains("inventory-header")) return;
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });

    // Roll skill. 
    html.find(".ambersteel-skill-roll").click(this._onSkillRoll.bind(this));

    // Roll attribute. 
    html.find(".ambersteel-attribute-roll").click(this._onAttributeRoll.bind(this));

    // -------------------------------------------------------------
    if (!isEditable) return;

    // Add Item
    html.find('.ambersteel-item-create').click(this._onItemCreate.bind(this));

    // Edit item. 
    html.find(".ambersteel-item-edit").change(this._onItemEdit.bind(this));

    // Delete item. 
    html.find(".ambersteel-item-delete").click(this._onItemDelete.bind(this));

    // Edit attribute. 
    html.find(".ambersteel-actor-edit").change(this._onActorEdit.bind(this));

    // Context menu.
    // TODO: Refactor -> item type specific?
    new ContextMenu(html, ".skill-item", AmbersteelBaseActorSheet.itemContextMenu);

    // Add skill ability. 
    html.find(".ambersteel-skill-ability-create").click(this._onCreateSkillAbility.bind(this));

    // Delete skill ability.
    html.find(".ambersteel-skill-ability-delete").click(this._onDeleteSkillAbility.bind(this));
  }

  /**
   * 
   * @param event 
   * @private
   * @async
   */
  async _onItemEdit(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.getItem(itemId);
    const propertyPath = element.dataset.field;
    const newValue = SheetUtil.getElementValue(element);

    await item.updateProperty(propertyPath, newValue);

    this.parent.render();
  }

  /**
   * 
   * @param event 
   * @private
   * @async
   */
  async _onItemDelete(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.getItem(itemId);

    await item.delete();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   * @async
   */
  async _onItemCreate(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);

    let imgPath = "icons/svg/item-bag.svg";
    if (type === "skill") {
      imgPath = "icons/svg/book.svg";
    } else if (type === "fate-card") {
      imgPath = "icons/svg/wing.svg";
    }

    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      data: data,
      img: imgPath
    };

    // Remove the type from the dataset since it's already in the 'itemData.type' property.
    delete itemData.data["type"];

    return await Item.create(itemData, { parent: this.getActor() });
  }

  /**
   * @param event 
   * @private
   * @async
   */
  _onItemShow(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.getItem(itemId);

    item.sheet.render(true);
  }

  /**
   * @param event 
   * @private
   */
  async _onItemSendToChat(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.getItem(itemId);

    if (keyboard.isDown("Shift")) {
      await item.sendToChat(CONFIG.ambersteel.visibilityModes.public);
    } else {
      const dialogResult = await queryVisibilityMode();
      if (dialogResult.confirmed) {
        await item.sendToChat(dialogResult.visibilityMode);
      }
    }
  }

  /**
   * @param event 
   * @private
   */
  async _onActorSendToChat(event) {
    event.preventDefault();

    if (keyboard.isDown("Shift")) {
      await this.getActor().sendToChat(CONFIG.ambersteel.visibilityModes.public);
    } else {
      const dialogResult = await queryVisibilityMode();
      if (dialogResult.confirmed) {
        await this.getActor().sendToChat(dialogResult.visibilityMode);
      }
    }
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onActorEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const field = element.dataset.field;

    await this.getActor().updateProperty(field, element.value);
  }

  /**
   * Skill roll handler. 
   * @param {Event} event 
   * @private
   */
  async _onSkillRoll(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.closest(".item").dataset;
    const itemId = dataset.itemId;
    const oSkill = this.getItem(itemId);
    let localizedSkillName = game.i18n.localize(event.currentTarget.dataset.actionName);
    if (localizedSkillName.length == 0) localizedSkillName = oSkill.name;

    // Modal dialog to enter obstacle and bonus dice. 
    const rollInputData = await Dice.queryRollData();

    if (!rollInputData.confirmed) return;

    // Determine number of dice to roll. 
    // If the skill is still being learned, use the related attribute value for the roll, instead. 
    // Any skill with a level of 0 is one being learned. 
    let numberOfDice = parseInt(event.currentTarget.dataset.actionValue);
    if (parseInt(oSkill.data.data.value) == 0) {
      const relatedAttName = oSkill.data.data.relatedAttribute;
      const oAtt = this.getActor().getAttributeForName(relatedAttName).object;
      numberOfDice = oAtt.value;
    }

    const localizedActionName = `${game.i18n.localize("ambersteel.labels.skill")}: ${localizedSkillName}`;
    
    // Do roll. 
    const result = await Dice.rollDice({
      actionName: localizedActionName,
      actionValue: numberOfDice, 
      obstacle: rollInputData.obstacle,
      bonusDice: rollInputData.bonusDice,
      actor: this.getActor()  
    });

    // Note result towards skill progress. 
    oSkill.addProgress(result.rollResults.isSuccess, false);

    // Re-render the sheet to make the progress visible. 
    this.parent.render();

    // Display roll result. 
    Dice.sendDiceResultToChat({ 
      renderedContent: result.renderedContent, 
      flavor: result.flavor, 
      actor: result.actor,
      visibilityMode: CONFIG.ambersteel.visibilityModes[rollInputData.visibilityMode]
    });
  }

  /**
   * Attribute roll handler. 
   * @param {Event} event 
   * @private
   * @async
   */
  async _onAttributeRoll(event) {
    event.preventDefault();

    const attName = event.currentTarget.dataset.actionName;
    const oAtt = this.getActor().getAttributeForName(attName).object;
    const localizedAttName = game.i18n.localize(oAtt.localizableName);

    // Modal dialog to enter obstacle and bonus dice. 
    const rollInputData = await Dice.queryRollData();

    if (!rollInputData.confirmed) return;

    const localizedActionName = `${game.i18n.localize("ambersteel.labels.attribute")}: ${localizedAttName}`;

    // Do roll. 
    const result = await Dice.rollDice({
      actionName: localizedActionName,
      actionValue: event.currentTarget.dataset.actionValue, 
      obstacle: rollInputData.obstacle,
      bonusDice: rollInputData.bonusDice,
      actor: this.getActor()  
    });

    // Note result towards attribute progress. 
    await this.getActor().addAttributeProgress(attName, result.rollResults.isSuccess);

    // Re-render the sheet to make the progress visible. 
    this.parent.render();

    // Display roll result. 
    Dice.sendDiceResultToChat({
      renderedContent: result.renderedContent, 
      flavor: result.flavor, 
      actor: result.actor,
      visibilityMode: CONFIG.ambersteel.visibilityModes[rollInputData.visibilityMode]
    });
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onExpandSkillAbilityList(event) {
    event.preventDefault();

    const itemId = event.currentTarget.dataset.itemId;
    const skillItem = this.getItem(itemId);
    await skillItem.toggleSkillAbilityListVisible();

    this.parent.render();
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onCreateSkillAbility(event) {
    event.preventDefault();
    
    const itemId = event.currentTarget.dataset.itemId;
    const skillItem = this.getItem(itemId);
    await skillItem.createSkillAbility();

    this.parent.render();
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onDeleteSkillAbility(event) {
    event.preventDefault();

    const dataset = event.currentTarget.dataset;

    const itemId = dataset.itemId;
    const skillItem = this.getItem(itemId);

    const index = parseInt(dataset.index);
    await skillItem.deleteSkillAbilityAt(index);

    this.parent.render();
  }
}