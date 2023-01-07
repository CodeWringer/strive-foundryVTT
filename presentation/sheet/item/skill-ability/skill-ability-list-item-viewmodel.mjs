import * as ChatUtil from "../../../chat/chat-utility.mjs";
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { isNumber } from "../../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import { SOUNDS_CONSTANTS } from "../../../audio/sounds.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import InfoBubble from "../../../component/info-bubble/info-bubble.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import VisibilitySingleChoiceDialog from "../../../dialog/visibility-single-choice-dialog/visibility-single-choice-dialog.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import DamageAndTypeViewModel from "./damage-and-type-viewmodel.mjs";

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
  get hideObstacle() { return isDefined(this.skillAbility.obstacle) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return isDefined(this.skillAbility.opposedBy) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return isDefined(this.skillAbility.condition) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return isDefined(this.skillAbility.distance) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return isDefined(this.skillAbility.attackType) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.skillAbility.damage.length < 1; }

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
   * @param {SkillAbility} args.skillAbility 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
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
      callback: "advanceByRollResult",
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
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          if (isDefined(obj) === true) {
            return ATTACK_TYPES.asChoices.find(it => it.value === obj.name);
          } else {
            return ATTACK_TYPES.asChoices.find(it => it.value === "none");
          }
        },
        fromChoiceOption(option) {
          return ATTACK_TYPES[option.value];
        }
      }),
    });

    this.vmBtnRollDamage = new ButtonViewModel({
      id: "vmBtnRollDamage",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizableTitle: "ambersteel.roll.doRoll",
      onClick: async (html, isOwner, isEditable) => {
        await new VisibilitySingleChoiceDialog({
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
                // Resolve references. 
                // If the skill (which is the ability's owning document) has a parent (= an actor document), 
                // resolve references on that document, instead of the skill document. 
                let resolvedReferences;
                if (thiz.skillAbility.owningDocument.owningDocument !== undefined) {
                  resolvedReferences = thiz.skillAbility.owningDocument.owningDocument.resolveReferences(damageDefinition.damage)
                } else {
                  resolvedReferences = thiz.skillAbility.owningDocument.resolveReferences(damageDefinition.damage)
                }

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
            const title = `${game.i18n.localize("ambersteel.damageDefinition.label")} - ${thiz.skillAbility.name}`;

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
        }).renderAndAwait(true);
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
        // Add damage
        {
          name: game.i18n.localize("ambersteel.damageDefinition.add"),
          icon: '<i class="fas fa-plus"></i>',
          condition: () => { return true; },
          callback: () => {
            const damage = thiz.skillAbility.damage ?? [];
            damage.push(new DamageAndType({
              damage: "",
              damageType: DAMAGE_TYPES.none.name,
            }));
            thiz.skillAbility.damage = damage;
          },
        },
      ]
      // Toggle obstacle
      .concat(this._createContextMenuToggleButtons("ambersteel.roll.obstacle.label", thiz.skillAbility, "obstacle", ""))
      // Toggle opposed by
      .concat(this._createContextMenuToggleButtons("ambersteel.roll.obstacle.opposedBy.label", thiz.skillAbility, "opposedBy", ""))
      // Toggle distance
      .concat(this._createContextMenuToggleButtons("ambersteel.character.skill.ability.distance.label", thiz.skillAbility, "distance", ""))
      // Toggle attack type
      .concat(this._createContextMenuToggleButtons("ambersteel.attackType.label", thiz.skillAbility, "attackType", ATTACK_TYPES.none.name))
      // Toggle condition
      .concat(this._createContextMenuToggleButtons("ambersteel.character.skill.ability.condition.label", thiz.skillAbility, "condition", "")),
    });

    for (let i = 0; i < skillAbility.damage.length; i++) {
      const vm = new DamageAndTypeViewModel({
        id: `vmDamageAndType-${i}`,
        parent: thiz,
        isEditable: thiz.isEditable,
        isSendable: thiz.isSendable,
        isOwner: thiz.isOwner,
        isGM: thiz.isGM,
        propertyOwner: skillAbility,
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
      text: game.i18n.localize("ambersteel.damageDefinition.infoFormulae"),
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

  /**
   * Returns two button definitions for a button to "toggle" a property value to be 
   * null or non-null. 
   * 
   * @param {String} label The button's localizable label. 
   * @param {Object} propertyOwner Parent object of the property. 
   * @param {String} propertyName Name of the property. 
   * @param {Any} nonNullValue Value to set on the property that is non-null. 
   * 
   * @returns {Array<Object>} Two button definitions. One for each state of the toggle button. 
   * 
   * @private
   */
  _createContextMenuToggleButtons(label, propertyOwner, propertyName, nonNullValue) {
    const localizedLabel = game.i18n.localize(label);
    return [
      {
        name: localizedLabel,
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return isDefined(propertyOwner[propertyName]) === true; },
        callback: () => { propertyOwner[propertyName] = null; },
      },
      {
        name: localizedLabel,
        icon: '',
        condition: () => { return isDefined(propertyOwner[propertyName]) !== true; },
        callback: () => { propertyOwner[propertyName] = nonNullValue; },
      }
    ];
  }
}
