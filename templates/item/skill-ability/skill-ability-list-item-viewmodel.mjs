import ButtonViewModel from "../../../module/components/button/button-viewmodel.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import DamageAndType from "../../../module/dto/damage-and-type.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { getNestedPropertyValue } from "../../../module/utils/property-utility.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import * as ChatUtil from "../../../module/utils/chat-utility.mjs";
import { DAMAGE_TYPES } from "../../../module/constants/damage-types.mjs";
import { ATTACK_TYPES } from "../../../module/constants/attack-types.mjs";
import { SOUNDS_CONSTANTS } from "../../../module/constants/sounds.mjs";
import InfoBubble from "../../../module/components/info-bubble/info-bubble.mjs";
import { isNumber } from "../../../module/utils/validation-utility.mjs";

export default class SkillAbilityListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_LIST_ITEM; }

  /**
   * @type {Item}
   * @readonly
   */
  item = undefined;

  /**
   * @type {SkillAbility}
   * @readonly
   */
  get skillAbility() { return this.item.data.data.abilities[this.index] }

  /** @override */
  get entityId() { return this.skillAbility.id; }

  /**
   * @type {Actor | undefined}
   * @readonly
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  index = -1;

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return game.ambersteel.getAttackTypeOptions(); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return this.skillAbility.obstacle === undefined; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return this.skillAbility.opposedBy === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return this.skillAbility.condition === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return this.skillAbility.distance === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return this.skillAbility.attackType === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.skillAbility.damage.length <= 0; }

  /**
   * @type {Array<DamageAndTypeViewModel>}
   */
  damageViewModels = [];

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Item} args.item
   * @param {Actor | undefined} args.actor
   * @param {Number} args.index
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item", "index"]);

    this.item = args.item;
    this.actor = args.actor;
    this.index = args.index;
    this.contextTemplate = args.contextTemplate ?? "skill-ability-list-item";

    const thiz = this;
    const pathSkillAbility = `data.data.abilities[${thiz.index}]`;
    const skillAbility = getNestedPropertyValue(this.item, pathSkillAbility);
    
    const skillAbilityParent = skillAbility.getOwningDocument();
    this.vmBtnRoll = this.createVmBtnRoll({
      id: "vmBtnRoll",
      target: skillAbilityParent,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(skillAbility.name),
      primaryChatImage: skillAbility.img,
      secondaryChatTitle: game.i18n.localize(skillAbilityParent.name),
      secondaryChatImage: skillAbilityParent.img,
      rollType: "dice-pool",
      callback: "advanceSkillBasedOnRollResult",
      callbackData: skillAbility.ownerId,
      actor: thiz.actor,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "vmBtnSendToChat",
      target: skillAbility,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmImg = this.createVmImg({
      id: "vmImg",
      propertyOwner: skillAbility,
      propertyPath: "img",
    });
    this.vmTfName = this.createVmTextField({
      id: "vmTfName",
      propertyOwner: skillAbility,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "vmBtnDelete",
      target: skillAbility,
      withDialog: true,
    });
    this.vmNsRequiredLevel = this.createVmNumberSpinner({
      id: "vmNsRequiredLevel",
      propertyOwner: skillAbility,
      propertyPath: "requiredLevel",
      min: 0,
    });
    this.vmTfObstacle = this.createVmTextField({
      id: "vmTfObstacle",
      propertyOwner: skillAbility,
      propertyPath: "obstacle",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.placeholder"),
    });
    this.vmTfOpposedBy = this.createVmTextField({
      id: "vmTfOpposedBy",
      propertyOwner: skillAbility,
      propertyPath: "opposedBy",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.placeholder"),
    });
    this.vmTfDistance = this.createVmTextField({
      id: "vmTfDistance",
      propertyOwner: skillAbility,
      propertyPath: "distance",
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.distance.placeholder"),
    });
    this.vmNsApCost = this.createVmNumberSpinner({
      id: "vmNsApCost",
      propertyOwner: skillAbility,
      propertyPath: "apCost",
      min: 0,
    });
    this.vmDdAttackType = this.createVmDropDown({
      id: "vmDdAttackType",
      propertyOwner: skillAbility,
      propertyPath: "attackType",
      options: thiz.attackTypeOptions,
    });

    this.vmBtnRollDamage = new ButtonViewModel({
      id: "vmBtnRollDamage",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizableTitle: "ambersteel.roll.doRoll",
      onClick: async (html, isOwner, isEditable) => {
        const dialogResult = await ChatUtil.queryVisibilityMode();
        if (!dialogResult.confirmed) return;
  
        // This is the total across all damage definitions. 
        let damageTotal = 0;
  
        // Build roll array. 
        const rolls = [];
        for (const damageDefinition of thiz.skillAbility.damage) {
          // At this point, the string may contain `@`-references. These must be resolved. 
          let resolvedDamage = damageDefinition.damage;
          // Resolve references on actor document. 
          const resolvedReferences = thiz.actor.resolveReferences(damageDefinition.damage);
          for (const [key, value] of resolvedReferences) {
            // This replaces every reference of the current type, e. g. `"@strength"` with the 
            // current level or value of the thing, if possible. 
            // If a value cannot be determined, it will default to "0". 
            const regExpReplace = new RegExp(key, "gi");
            
            let replaceValue = value.level;
            if (replaceValue === undefined || replaceValue === null) {
              replaceValue = value.value;
              
              if (replaceValue === undefined || replaceValue === null) {
                replaceValue = isNumber(value) === true ? value : "0";
              }
            }
            
            resolvedDamage = resolvedDamage.replace(regExpReplace, replaceValue);
          }
          
          // Get evaluated roll of damage formula. 
          const rollResult = new Roll(resolvedDamage);
          await rollResult.evaluate({ async: true });
  
          damageTotal += parseFloat(rollResult.total);
  
          // Get an array of each dice term. 
          const diceResults = [];
          for (const term of rollResult.terms) {
            if (term.values !== undefined) {
              for (const value of term.values) {
                diceResults.push({
                  value: value,
                  isDiceResult: true,
                });
              }
            } else {
              diceResults.push({
                value: term.total,
                isDiceResult: false,
              });
            }
          }
  
          // Get localized damage type. 
          const damageType = game.ambersteel.getConfigItem(DAMAGE_TYPES, damageDefinition.damageType);
          const localizedDamageType = game.i18n.localize(damageType.localizableName);
  
          rolls.push({
            damage: rollResult.total,
            localizedDamageType: localizedDamageType,
            diceResults: diceResults,
          });
        }
  
        // Determine title
        const title = `${game.i18n.localize("ambersteel.character.skill.ability.damage.label")} - ${thiz.skillAbility.name}`;
  
        // Render the results. 
        const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_DAMAGE_CHAT_MESSAGE, {
          damageTotal: damageTotal,
          rolls: rolls,
          title: title,
        });
  
        return ChatUtil.sendToChat({
          renderedContent: renderedContent,
          actor: skillAbilityParent.parent,
          sound: SOUNDS_CONSTANTS.DICE_ROLL,
          visibilityMode: dialogResult.visibilityMode
        });
      },
    });

    this.vmTaCondition = this.createVmTextArea({
      id: "vmTaCondition",
      propertyOwner: skillAbility,
      propertyPath: "condition",
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.condition.placeholder"),
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: skillAbility,
      propertyPath: "description",
    });

    this.contextMenuItems = [
      // Toggle obstacle
      {
        name: game.i18n.localize("ambersteel.roll.obstacle.label"),
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return thiz.skillAbility.obstacle !== undefined; },
        callback: () => { thiz.skillAbility.updateProperty("obstacle", undefined); },
      },
      {
        name: game.i18n.localize("ambersteel.roll.obstacle.label"),
        icon: '',
        condition: () => { return thiz.skillAbility.obstacle === undefined; },
        callback: () => { thiz.skillAbility.updateProperty("obstacle", ""); },
      },
      // Toggle opposed by
      {
        name: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.label"),
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return thiz.skillAbility.opposedBy !== undefined; },
        callback: () => { thiz.skillAbility.updateProperty("opposedBy", undefined); },
      },
      {
        name: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.label"),
        icon: '',
        condition: () => { return thiz.skillAbility.opposedBy === undefined; },
        callback: () => { thiz.skillAbility.updateProperty("opposedBy", ""); },
      },
      // Toggle distance
      {
        name: game.i18n.localize("ambersteel.character.skill.ability.distance.label"),
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return thiz.skillAbility.distance !== undefined; },
        callback: () => { thiz.skillAbility.updateProperty("distance", undefined); },
      },
      {
        name: game.i18n.localize("ambersteel.character.skill.ability.distance.label"),
        icon: '',
        condition: () => { return thiz.skillAbility.distance === undefined; },
        callback: () => { thiz.skillAbility.updateProperty("distance", ""); },
      },
      // Toggle attack type
      {
        name: game.i18n.localize("ambersteel.attackType.label"),
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return thiz.skillAbility.attackType !== undefined; },
        callback: () => { thiz.skillAbility.updateProperty("attackType", undefined); },
      },
      {
        name: game.i18n.localize("ambersteel.attackType.label"),
        icon: '',
        condition: () => { return thiz.skillAbility.attackType === undefined; },
        callback: () => { thiz.skillAbility.updateProperty("attackType", ATTACK_TYPES.none.name); },
      },
      // Toggle condition
      {
        name: game.i18n.localize("ambersteel.character.skill.ability.condition.label"),
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return thiz.skillAbility.condition !== undefined; },
        callback: () => { thiz.skillAbility.updateProperty("condition", undefined); },
      },
      {
        name: game.i18n.localize("ambersteel.character.skill.ability.condition.label"),
        icon: '',
        condition: () => { return thiz.skillAbility.condition === undefined; },
        callback: () => { thiz.skillAbility.updateProperty("condition", ""); },
      },
      // Add damage
      {
        name: game.i18n.localize("ambersteel.character.skill.ability.damage.add"),
        icon: '<i class="fas fa-plus"></i>',
        condition: () => { return true; },
        callback: () => {
          const damage = thiz.skillAbility.damage ?? [];
          damage.push(new DamageAndType({
            damage: "",
            damageType: CONFIG.ambersteel.damageTypes.none.name,
          }));
          thiz.skillAbility.updateProperty("damage", damage);
        },
      },
    ];

    for (let i = 0; i < skillAbility.damage.length; i++) {
      const vm = new DamageAndTypeViewModel({
        id: `vmDamageAndType-${i}`, 
        parent: thiz,
        isEditable: thiz.isEditable,
        isSendable: thiz.isSendable,
        isOwner: thiz.isOwner,
        isGM: thiz.isGM,
        skillAbility: skillAbility,
        contextTemplate: this.contextTemplate,
        index: i,
      });
      this.damageViewModels.push(vm);
    }
  }

  /** @override */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    this.damageInfoBubble = new InfoBubble({
      html: html,
      text: game.i18n.localize("ambersteel.character.skill.ability.damage.infoFormulae"),
    });
    const thiz = this;
    $.each(html.find(".damage-info"), (name, value) => {
      const jElement = $(value);

      if (jElement.attr('id') !== thiz.id) return;

      jElement.on("mouseenter", (e) => {
        thiz.damageInfoBubble.show(jElement);
      }); 
      jElement.on("mouseleave", (e) => {
        thiz.damageInfoBubble.hide();
      }); 
    });
  }

  /** @override */
  dispose() {
    super.dispose();

    this.damageInfoBubble.remove();
  }
}

class DamageAndTypeViewModel extends SheetViewModel {
  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return game.ambersteel.getDamageTypeOptions(); }

  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["skillAbility", "index"]);

    this.skillAbility = args.skillAbility;
    this.index = args.index;

    const thiz = this;

    this.vmTfDamage = this.createVmTextField({
      id: "vmTfDamage",
      propertyOwner: this.skillAbility,
      propertyPath: `damage[${this.index}].damage`,
    });
    this.vmDdDamageType = this.createVmDropDown({
      id: "vmDdDamageType",
      propertyOwner: this.skillAbility,
      propertyPath: `damage[${this.index}].damageType`,
      options: thiz.damageTypeOptions,
    });

    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizableTitle: "ambersteel.character.skill.ability.damage.delete",
    });
    this.vmBtnDelete.onClick = (html, isOwner, isEditable) => {
      const damage = thiz.skillAbility.damage;
      damage.splice(thiz.index, 1);
      thiz.skillAbility.updateProperty("damage", damage);
    };
  }
}
