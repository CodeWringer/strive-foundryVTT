import * as Dice from "../helpers/dice.mjs";
import * as NumberSpinner from "../components/number-spinner.mjs";
import * as SkillUtil from '../utils/skill-utility.mjs';
import * as FateUtil from '../utils/fate-utility.mjs';

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
    context.CONFIG = CONFIG.ambersteel;

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

    FateUtil.prepareDerivedActorData(context);

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
    const isOwner = this.actor.isOwner;
    const isEditable = this.isEditable;

    // ItemUtil.activateListeners(html, this, isOwner, isEditable);
    // SkillUtil.activateListeners(html, this, isOwner, isEditable);
    NumberSpinner.activateListeners(html, this, isOwner, isEditable);
    
    // -------------------------------------------------------------
    // Everything below here is only needed if the user is the owner or GM. 
    if (!isOwner) return;
    
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
    // Everything below here is only needed if the sheet is editable. 
    if (!isEditable) return;

    // Context menu.
    new ContextMenu(html, ".skill-item", this.itemContextMenu);
    
    // Edit attribute.
    html.find(".ambersteel-attribute-edit").change(this._onAttributeEdit.bind(this));
  }

  _onAttributeEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const attGroupName = element.closest(".attribute-item").dataset.attGroupName;
    const attName = element.closest(".attribute-item").dataset.attName;
    const field = element.dataset.field;

    return this.actor.update({ data: { attributes: { [attGroupName]: { [attName]: { [field]: element.value }}}}})
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
    const oSkill = this.actor.items.get(itemId);
    const localizedActionName = game.i18n.localize(event.currentTarget.dataset.actionName);

    // Modal dialog to enter obstacle and bonus dice. 
    const rollInputData = await Dice.queryRollData();

    if (!rollInputData.confirmed) return;

    // Determine number of dice to roll. 
    // If the skill is still being learned, use the related attribute value for the roll, instead. 
    // Any skill with a level of 0 is one being learned. 
    let numberOfDice = parseInt(event.currentTarget.dataset.actionValue);
    if (parseInt(oSkill.data.data.value) == 0) {
      const relatedAttName = oSkill.data.data.relatedAttribute;
      const oAtt = this.actor._getAttributeForName(relatedAttName).object;
      numberOfDice = oAtt.value;
    }
    
    // Do roll. 
    const result = await Dice.rollDice({
      actionName: localizedActionName,
      actionValue: numberOfDice, 
      obstacle: rollInputData.obstacle,
      bonusDice: rollInputData.bonusDice,
      actor: this.actor  
    });

    // Note result towards skill progress. 
    SkillUtil.addProgress(oSkill, result.rollResults.isSuccess, false);

    // Re-render the sheet to make the progress visible. 
    this.parent.render();

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
    const attName = event.currentTarget.dataset.actionName;
    const oAtt = this.actor._getAttributeForName(attName).object;
    const localizedAttName = game.i18n.localize(oAtt.localizableName);

    // Modal dialog to enter obstacle and bonus dice. 
    const rollInputData = await Dice.queryRollData();

    if (!rollInputData.confirmed) return;

    // Do roll. 
    const result = await Dice.rollDice({
      actionName: localizedAttName,
      actionValue: event.currentTarget.dataset.actionValue, 
      obstacle: rollInputData.obstacle,
      bonusDice: rollInputData.bonusDice,
      actor: this.actor  
    });

    // Note result towards attribute progress. 
    await this.actor.addAttributeProgress(attName, result.rollResults.isSuccess);

    // Re-render the sheet to make the progress visible. 
    this.parent.render();

    // Display roll result. 
    Dice.sendDiceResultToChat({ renderedContent: result.renderedContent, flavor: result.flavor, actor: result.actor });
  }

}
