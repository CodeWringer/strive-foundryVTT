import ButtonViewModel from "../../../module/components/button/button-viewmodel.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import DamageAndType from "../../../module/dto/damage-and-type.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { getNestedPropertyValue } from "../../../module/utils/property-utility.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import * as ChatUtil from "../../../module/utils/chat-utility.mjs";
import { DICE_ROLL_SOUND } from "../../../module/utils/dice-utility.mjs";
import { DAMAGE_TYPES } from "../../../module/constants/damage-types.mjs";
import { ATTACK_TYPES } from "../../../module/constants/attack-types.mjs";

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
    
    this.vmBtnRoll = this.createVmBtnRoll({
      id: "vmBtnRoll",
      target: skillAbility.parent,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(skillAbility.name),
      primaryChatImage: skillAbility.img,
      secondaryChatTitle: game.i18n.localize(skillAbility.parent.name),
      secondaryChatImage: skillAbility.parent.img,
      rollType: "dice-pool",
      callback: "advanceSkillBasedOnRollResult",
      callbackData: skillAbility.parent.id,
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
      placeholder: "ambersteel.labels.name",
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
      placeholder: game.i18n.localize("ambersteel.placeholders.obstacle"),
    });
    this.vmTfOpposedBy = this.createVmTextField({
      id: "vmTfOpposedBy",
      propertyOwner: skillAbility,
      propertyPath: "opposedBy",
      placeholder: game.i18n.localize("ambersteel.placeholders.opposedBy"),
    });
    this.vmTfDistance = this.createVmTextField({
      id: "vmTfDistance",
      propertyOwner: skillAbility,
      propertyPath: "distance",
      placeholder: game.i18n.localize("ambersteel.placeholders.distance"),
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
      localizableTitle: "ambersteel.labels.roll",
    });
    this.vmBtnRollDamage.onClick = async (html, isOwner, isEditable) => {
      const dialogResult = await ChatUtil.queryVisibilityMode();
      if (!dialogResult.confirmed) return;

      // This is the total across all damage definitions. 
      let damageTotal = 0;

      // Build roll array. 
      const rolls = [];
      for (const damageDefinition of thiz.skillAbility.damage) {
        // Get evaluated roll of damage formula. 
        const rollResult = new Roll(damageDefinition.damage);
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
      const title = `${game.i18n.localize("ambersteel.labels.damage")} - ${thiz.skillAbility.name}`;

      // Render the results. 
      const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_DAMAGE_CHAT_MESSAGE, {
        damageTotal: damageTotal,
        rolls: rolls,
        title: title,
      });

      return ChatUtil.sendToChat({
        renderedContent: renderedContent,
        actor: this.skillAbility.parent.parent,
        sound: DICE_ROLL_SOUND,
        visibilityMode: dialogResult.visibilityMode
      });
    };

    this.vmTaCondition = this.createVmTextArea({
      id: "vmTaCondition",
      propertyOwner: skillAbility,
      propertyPath: "condition",
      placeholder: game.i18n.localize("ambersteel.placeholders.condition"),
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: skillAbility,
      propertyPath: "description",
    });
    this.vmBtnContextMenu = this.createVmBtnContextMenu({
      id: "vmBtnContextMenu",
      menuItems: [
        // Toggle obstacle
        {
          name: game.i18n.localize("ambersteel.roll.obstacle"),
          icon: '<i class="fas fa-check"></i>',
          condition: () => { return thiz.skillAbility.obstacle !== undefined; },
          callback: () => { thiz.skillAbility.updateProperty("obstacle", undefined); },
        },
        {
          name: game.i18n.localize("ambersteel.roll.obstacle"),
          icon: '',
          condition: () => { return thiz.skillAbility.obstacle === undefined; },
          callback: () => { thiz.skillAbility.updateProperty("obstacle", ""); },
        },
        // Toggle opposed by
        {
          name: game.i18n.localize("ambersteel.labels.opposedBy"),
          icon: '<i class="fas fa-check"></i>',
          condition: () => { return thiz.skillAbility.opposedBy !== undefined; },
          callback: () => { thiz.skillAbility.updateProperty("opposedBy", undefined); },
        },
        {
          name: game.i18n.localize("ambersteel.labels.opposedBy"),
          icon: '',
          condition: () => { return thiz.skillAbility.opposedBy === undefined; },
          callback: () => { thiz.skillAbility.updateProperty("opposedBy", ""); },
        },
        // Toggle distance
        {
          name: game.i18n.localize("ambersteel.labels.distance"),
          icon: '<i class="fas fa-check"></i>',
          condition: () => { return thiz.skillAbility.distance !== undefined; },
          callback: () => { thiz.skillAbility.updateProperty("distance", undefined); },
        },
        {
          name: game.i18n.localize("ambersteel.labels.distance"),
          icon: '',
          condition: () => { return thiz.skillAbility.distance === undefined; },
          callback: () => { thiz.skillAbility.updateProperty("distance", ""); },
        },
        // Toggle attack type
        {
          name: game.i18n.localize("ambersteel.labels.attackType"),
          icon: '<i class="fas fa-check"></i>',
          condition: () => { return thiz.skillAbility.attackType !== undefined; },
          callback: () => { thiz.skillAbility.updateProperty("attackType", undefined); },
        },
        {
          name: game.i18n.localize("ambersteel.labels.attackType"),
          icon: '',
          condition: () => { return thiz.skillAbility.attackType === undefined; },
          callback: () => { thiz.skillAbility.updateProperty("attackType", ATTACK_TYPES.none.name); },
        },
        // Toggle condition
        {
          name: game.i18n.localize("ambersteel.labels.skillAbilityCondition"),
          icon: '<i class="fas fa-check"></i>',
          condition: () => { return thiz.skillAbility.condition !== undefined; },
          callback: () => { thiz.skillAbility.updateProperty("condition", undefined); },
        },
        {
          name: game.i18n.localize("ambersteel.labels.skillAbilityCondition"),
          icon: '',
          condition: () => { return thiz.skillAbility.condition === undefined; },
          callback: () => { thiz.skillAbility.updateProperty("condition", ""); },
        },
        // Add damage
        {
          name: game.i18n.localize("ambersteel.labels.addSkillAbilityDamage"),
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
      ],
    });

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
      localizableTitle: "ambersteel.labels.delete",
    });
    this.vmBtnDelete.onClick = (html, isOwner, isEditable) => {
      const damage = thiz.skillAbility.damage;
      damage.splice(thiz.index, 1);
      thiz.skillAbility.updateProperty("damage", damage);
    };
  }
}
