import * as Dice from "../helpers/dice.mjs";

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

  itemContextMenu = [
    {
      name: game.i18n.localize("ambersteel.labels.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: el => {
        const item = this.actor.items.get(el.data("item-id"));
        item.delete();
      }
    }
  ]

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.actor.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    this._prepareDerivedItemData(context);
    this._prepareDerivedAttributeData(context);

    context.config = CONFIG.ambersteel;

    return context;
  }

  _prepareDerivedAttributeData(data) {
    // Holds attribute group objects for easy access. 
    data.attributeGroups = {}

    for (let attGroup in data.data.attributes) {
      if (!data.data.attributes.hasOwnProperty(attGroup)) continue;

      let oAttGroup = data.data.attributes[attGroup]
      
      // Initialize attribute group object with meta-data. 
      data.attributeGroups[attGroup] = {
        localizableName: "ambersteel.attributeGroups." + attGroup,
        name: attGroup,
        attributes: {}
      }

      for (let att in oAttGroup) {
        if (!oAttGroup.hasOwnProperty(att)) continue;
        
        let oAtt = oAttGroup[att]

        // Add attribute object to attributeGroups for easy access.
        data.attributeGroups[attGroup].attributes[att] = oAtt
      }
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareDerivedItemData(context) {
    // Initialize containers.
    const possessions = [];
    const skills = [];
    const learningSkills = [];
    const fateCards = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      // Possessions
      if (i.type === 'possession') {
        possessions.push(i);
      }
      // Skills
      else if (i.type === 'skill') {
        if (i.isLearning) {
          learningSkills.push(i);
        } else {
          skills.push(i);
        }
      }
      // Fate Cards
      if (i.type === 'fateCard') {
        fateCards.push(i);
      }
    }

    // Assign and return
    context.skills = skills;
    context.learningSkills = learningSkills;
    context.possessions = possessions;
    context.fateCards = fateCards;
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
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

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
    let numberOfDice = parseInt(event.currentTarget.dataset.actionValue);
    if (oSkill.data.data.isLearning == "true") {
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
    this.actor.progressSkill({ skillObject: oSkill, success: result.rollResults.isSuccess });

    // TODO: Bug: updated actor.data is not updated on sheet

    // Display roll result. 
    Dice.sendDiceResultToChat({ renderedContent: result.renderedContent, flavor: result.flavor, actor: result.actor });
  }

  /**
   * Attribute roll handler. 
   * @param {Event} event 
   * @private
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
    this.actor.progressAttribute({ attObject: oAtt, success: result.rollResults.isSuccess });

    // TODO: Bug: updated actor.data is not updated on sheet

    // Display roll result. 
    Dice.sendDiceResultToChat({ renderedContent: result.renderedContent, flavor: result.flavor, actor: result.actor });
  }

}
