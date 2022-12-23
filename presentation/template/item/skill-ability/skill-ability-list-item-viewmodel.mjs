import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { isNumber, validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { SOUNDS_CONSTANTS } from "../../../audio/sounds.mjs";
import * as ChatUtil from "../../../chat/chat-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import InfoBubble from "../../../component/info-bubble/info-bubble.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import VisibilitySingleChoiceDialog from "../../../dialog/visibility-single-choice-dialog/visibility-single-choice-dialog.mjs";

export default class SkillAbilityListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_LIST_ITEM; }

  /**
   * @type {SkillAbility}
   */
  skillAbility = undefined;

  /** @override */
  get entityId() { return this.skillAbility.id; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return ATTACK_TYPES.asChoices; }

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
   * @param {SkillAbility} args.skillAbility
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["skillAbility"]);

    this.contextTemplate = args.contextTemplate ?? "skill-ability-list-item";
    this.skillAbility = args.skillAbility;
    
    const thiz = this;
    const factory = new ViewModelFactory();
    
    const skillAbility = this.skillAbility;
    const owningDocument = skillAbility.owningDocument;
    const actor = ((thiz.skillAbility.owningDocument ?? {}).owningDocument ?? {}).document;

    this.vmBtnRoll = factory.createVmBtnRoll({
      parent: thiz,
      id: "vmBtnRoll",
      target: owningDocument,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(skillAbility.name),
      primaryChatImage: skillAbility.img,
      secondaryChatTitle: game.i18n.localize(owningDocument.name),
      secondaryChatImage: owningDocument.img,
      rollType: "dice-pool",
      callback: "advanceBasedOnRollResult",
      callbackData: skillAbility.owningDocumentId,
      actor: actor,
      isEditable: (thiz.isEditable || thiz.isGM) && actor !== undefined,
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: skillAbility,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: skillAbility,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: skillAbility,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: skillAbility,
      withDialog: true,
    });
    this.vmNsRequiredLevel = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsRequiredLevel",
      propertyOwner: skillAbility,
      propertyPath: "requiredLevel",
      min: 0,
    });
    this.vmTfObstacle = factory.createVmTextField({
      parent: thiz,
      id: "vmTfObstacle",
      propertyOwner: skillAbility,
      propertyPath: "obstacle",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.placeholder"),
    });
    this.vmTfOpposedBy = factory.createVmTextField({
      parent: thiz,
      id: "vmTfOpposedBy",
      propertyOwner: skillAbility,
      propertyPath: "opposedBy",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.placeholder"),
    });
    this.vmTfDistance = factory.createVmTextField({
      parent: thiz,
      id: "vmTfDistance",
      propertyOwner: skillAbility,
      propertyPath: "distance",
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.distance.placeholder"),
    });
    this.vmNsApCost = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsApCost",
      propertyOwner: skillAbility,
      propertyPath: "apCost",
      min: 0,
    });
    this.vmDdAttackType = factory.createVmDropDown({
      parent: thiz,
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
        new VisibilitySingleChoiceDialog({
          closeCallback: async (dialog) => {
            if (dialog.confirmed !== true) return;
            // This is the total across all damage definitions. 
            let damageTotal = 0;

            // Build roll array. 
            const rolls = [];
            for (const damageDefinition of thiz.skillAbility.damage) {
              // At this point, the string may contain `@`-references. These must be resolved. 
              let resolvedDamage = damageDefinition.damage;

              if (thiz.skillAbility.owningDocument !== undefined) {
                // Resolve references on owning document. 
                const resolvedReferences = thiz.skillAbility.owningDocument.resolveReferences(damageDefinition.damage);
                for (const [key, value] of resolvedReferences) {
                  // This replaces every reference of the current type, e. g. `"@strength"` with the 
                  // current level or value of the thing, if possible. 
                  // If a value cannot be determined, it will default to "0". 
                  const regExpReplace = new RegExp(key, "gi");
  
                  const replaceValue = (value.level ?? value.value) ?? (isNumber(value) === true ? value : "0");
  
                  resolvedDamage = resolvedDamage.replace(regExpReplace, replaceValue);
                }
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
              const localizedDamageType = game.i18n.localize(damageDefinition.damageType.localizableName);

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
              actor: owningDocument.parent,
              sound: SOUNDS_CONSTANTS.DICE_ROLL,
              visibilityMode: dialog.visibilityMode
            });
          },
        }).render(true);
      },
    });

    this.vmTaCondition = factory.createVmTextArea({
      parent: thiz,
      id: "vmTaCondition",
      propertyOwner: skillAbility,
      propertyPath: "condition",
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.condition.placeholder"),
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: skillAbility,
      propertyPath: "description",
    });
    this.vmBtnContextMenu = factory.createVmBtnContextMenu({
      parent: thiz,
      id: "vmBtnContextMenu",
      menuItems: [
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
              damageType: DAMAGE_TYPES.none.name,
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

/**
 * @extends ViewModel
 */
export class DamageAndTypeViewModel extends ViewModel {
  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices; }

  /**
   * @param {Object} args 
   * @param {SkillAbility} args.skillAbility 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["skillAbility", "index"]);

    this.skillAbility = args.skillAbility;
    this.index = args.index;

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmTfDamage = factory.createVmTextField({
      parent: thiz,
      id: "vmTfDamage",
      propertyOwner: this.skillAbility,
      propertyPath: `damage[${this.index}].damage`,
    });
    this.vmDdDamageType = factory.createVmDropDown({
      parent: thiz,
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
