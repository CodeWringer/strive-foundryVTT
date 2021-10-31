import * as Dice from "../helpers/dice.mjs";
import * as NumberSpinner from "../components/number-spinner.mjs";

export class AmbersteelActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambersteel", "sheet", "actor"],
      template: "systems/ambersteel/templates/actor/actor-character-sheet.hbs",
      width: 600,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /* -------------------------------------------- */

  static get itemContextMenu() { 
    return [
      {
        name: game.i18n.localize("ambersteel.labels.delete"),
        icon: '<i class="fas fa-trash"></i>',
        callback: el => {
          const item = this.actor.items.get(el.data("item-id"));
          item.delete();
        }
      }
    ];
  }

  /** @override */
  getData() {
    // This is the data structure from the base sheet. It contains, among other 
    // properties, the actor object, data object, whether it's editable, 
    // the items array and the effects array. 
    const context = super.getData();

    context.isEditable = context.editable;

    // Use a safe clone of the actor data for further operations. 
    // It is "safe", because behind the scenes, a getter returns a clone. 
    const actorData = context.actor.data.data;

    // Make data available in context. 
    context.data.person = actorData.person;
    context.data.attributeGroups = this._getDerivedAttributeGroups(actorData.attributes);
    context.data.beliefSystem = actorData.beliefSystem;
    context.data.fateSystem = actorData.fateSystem;
    context.data.biography = actorData.biography;
    context.data.learningSkills = actorData.learningSkills;
    context.data.skills = actorData.skills;

    context.CONFIG = CONFIG.ambersteel;

    return context;
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

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Show item sheet.
    html.find(".ambersteel-item-show").click(this._onItemShow.bind(this));

    // -------------------------------------------------------------
    // Everything below here is only needed if the user is the owner or GM. 
    if (!this.actor.isOwner) return;
    
    // Drag events for macros.
    let handler = ev => this._onDragStart(ev);
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
    // Everything below here is only needed if the sheet is editable. 
    if (!this.isEditable) return;

    // Context menu.
    new ContextMenu(html, ".skill-item", this.itemContextMenu);
    
    // Add Item
    html.find('.ambersteel-item-create').click(this._onItemCreate.bind(this));

    // Edit item.
    html.find(".ambersteel-item-edit").change(this._onItemEdit.bind(this));

    // Delete item. 
    html.find(".ambersteel-item-delete").click(this._onItemDelete.bind(this));

    // Edit attribute.
    html.find(".ambersteel-attribute-edit").change(this._onAttributeEdit.bind(this));

    // Number-spinners.
    html.find(".button-spinner-up").click(NumberSpinner.onClickNumberSpinnerUp.bind(this));
    html.find(".button-spinner-down").click(NumberSpinner.onClickNumberSpinnerDown.bind(this));
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Initialize name in data, if possible. 
    if (data.name) {
      data.name = name;
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;
    let newValue = element.value;

    if (element.tagName.toLowerCase() == "select") {
      let optionValue = element.options[element.selectedIndex].value;
      newValue = optionValue;
    }

    return item.update({ [field]: newValue });
  }

  _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;

    const item = this.actor.items.get(itemId);
    return item.delete();
  }

  _onItemShow(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  _onAttributeEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let attGroupName = element.closest(".attribute-item").dataset.attGroupName;
    let attName = element.closest(".attribute-item").dataset.attName;
    let field = element.dataset.field;

    return this.actor.update({ data: { attributes: { [attGroupName]: { [attName]: { [field]: element.value }}}}})
  }

  /**
   * Skill roll handler. 
   * @param {Event} event 
   * @private
   */
  async _onSkillRoll(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let dataset = element.closest(".item").dataset;
    let itemId = dataset.itemId;
    let oSkill = this.actor.items.get(itemId);
    let localizedActionName = game.i18n.localize(event.currentTarget.dataset.actionName);

    // Modal dialog to enter obstacle and bonus dice. 
    let rollInputData = await Dice.queryRollData();

    if (!rollInputData.confirmed) return;

    // Determine number of dice to roll. 
    // If the skill is still being learned, use the related attribute value for the roll, instead. 
    // Any skill with a level of 0 is one being learned. 
    let numberOfDice = parseInt(event.currentTarget.dataset.actionValue);
    if (parseInt(oSkill.data.data.value) == 0) {
      let relatedAttName = oSkill.data.data.relatedAttribute;
      let oAtt = this.actor._getAttributeForName(relatedAttName);
      numberOfDice = oAtt.value;
    }
    
    // Do roll. 
    let result = await Dice.rollDice({
      actionName: localizedActionName,
      actionValue: numberOfDice, 
      obstacle: rollInputData.obstacle,
      bonusDice: rollInputData.bonusDice,
      actor: this.actor  
    });

    // Note result towards skill progress. 
    this.actor.addSkillProgress(itemId, result.rollResults.isSuccess, false);

    // Re-render the sheet to make the progress visible. 
    this.render();

    // Display roll result. 
    Dice.sendDiceResultToChat({ renderedContent: result.renderedContent, flavor: result.flavor, actor: result.actor });
  }

  /**
   * Attribute roll handler. 
   * @param {Event} event 
   * @private
   * @async
   */
  async _onAttributeRoll(event) {
    event.preventDefault();
    let attName = event.currentTarget.dataset.actionName;
    let oAtt = this.actor._getAttributeForName(attName);
    let localizedAttName = game.i18n.localize(oAtt.localizableName);

    // Modal dialog to enter obstacle and bonus dice. 
    let rollInputData = await Dice.queryRollData();

    if (!rollInputData.confirmed) return;

    // Do roll. 
    let result = await Dice.rollDice({
      actionName: localizedAttName,
      actionValue: event.currentTarget.dataset.actionValue, 
      obstacle: rollInputData.obstacle,
      bonusDice: rollInputData.bonusDice,
      actor: this.actor  
    });

    // Note result towards attribute progress. 
    await this.actor.addAttributeProgress(attName, result.rollResults.isSuccess);

    // Re-render the sheet to make the progress visible. 
    this.render();

    // Display roll result. 
    Dice.sendDiceResultToChat({ renderedContent: result.renderedContent, flavor: result.flavor, actor: result.actor });
  }

}
