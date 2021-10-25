export class AmbersteelActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "actor"],
      template: "systems/ambersteel/templates/actor/actor-character-sheet.hbs",
      width: 720,
      height: 900,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "basics" }]
    });
  }

  /** @override */
  get template() {
    return `systems/ambersteel/templates/actor/actor-character-sheet.hbs`;
  }

  /* -------------------------------------------- */

  itemContextMenu = [
    {
      name: game.i18n.localize("ambersteel.labels.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: el => {
        const item = this.actor.getOwnedItem(el.data("item-id"));
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

    actorData.data.skills = context.items.filter(function(item) { return item.type == "skill" && item.data.isLearning == "false" });
    actorData.data.learningSkills = context.items.filter(function(item) { return item.type == "skill" && item.data.isLearning == "true" });

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;
    
    // Derived skill data. 
    for (let skill of actorData.data.skills) {
      this._prepareDerivedSkillData(skill);
    }
    for (let skill of actorData.data.learningSkills) {
      this._prepareDerivedSkillData(skill);
    }

    // Derived attribute data. 
    this._prepareDerivedAttributeData(context);

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    context.config = CONFIG.ambersteel;

    return context;
  }

  _prepareDerivedSkillData(skill) {
    if (skill.data.value == 0) {
      skill.requiredSuccessses = 10
      skill.requiredFailures = 14
    } else {
      let skillValue = parseInt(skill.data.value)
      
      skill.requiredSuccessses = (skillValue + 1) * skillValue * 2
      skill.requiredFailures = (skillValue + 1) * skillValue * 3
    }
  }

  _prepareDerivedAttributeData(data) {
    // Holds attribute group objects for easy access. 
    data.attributeGroups = {}

    for (let attGroup in data.data.attributes) {
      if (!data.data.attributes.hasOwnProperty(attGroup)) continue;

      let oAttGroup = data.data.attributes[attGroup]
      
      // Initialize attribute group object with meta-data. 
      data.attributeGroups[attGroup] = {
        name: "ambersteel.attributeGroups." + attGroup,
        internalName: attGroup,
        attributes: {}
      }

      // Get derived attribute data. 
      for (let att in oAttGroup) {
        if (!oAttGroup.hasOwnProperty(att)) continue;
        
        let oAtt = oAttGroup[att]

        let attValue = parseInt(oAtt.value)
        oAtt.requiredSuccessses = (attValue + 1) * (attValue + 1) * 3
        oAtt.requiredFailures = (attValue + 1) * (attValue + 1) * 4

        oAtt.internalName = att
        oAtt.name = "ambersteel.attributes." + att
        oAtt.abbreviation = "ambersteel.attributeAbbreviations." + att

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
  _prepareItems(context) {
    // Initialize containers.
    const possessions = [];
    const skills = [];
    const learningSkills = [];
    const fateCards = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      // Possessions
      if (i.type === 'item') {
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
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    
    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

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
    let item = this.actor.getOwnedItem(itemId);
    let field = element.dataset.field;

    return item.update({ [field]: element.value });
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
    let item = this.actor.getOwnedItem(itemId);

    item.sheet.render(true);
  }

  _onAttributeEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let attGroupName = element.closest(".attribute-table").dataset.attGroupName;
    let attName = element.closest(".attribute-item").dataset.attName;
    let field = element.dataset.field;
    // this.actor.data.data.attriabutes[attGroupName][attName][field]

    return this.actor.update({ data: { attributes: { [attGroupName]: { [attName]: { [field]: element.value }}}}})
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData()).roll();
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
