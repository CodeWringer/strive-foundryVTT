import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../component/info-bubble/info-bubble.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextareaViewModel from "../../../component/input-textarea/input-textarea-viewmodel.mjs";
import SkillAbility from "../../../../business/document/item/skill/skill-ability.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ButtonRollViewModel from "../../../component/button-roll/button-roll-viewmodel.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs";

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
  get attackTypeOptions() { return ATTACK_TYPES.asChoices(); }

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
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {SkillAbility} args.skillAbility 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["skillAbility"]);

    this.contextTemplate = args.contextTemplate ?? "skill-ability-list-item";
    this.skillAbility = args.skillAbility;
    
    const thiz = this;
    
    const skillAbility = this.skillAbility;
    const owningDocument = skillAbility.owningDocument;
    this._actor = ((thiz.skillAbility.owningDocument ?? {}).owningDocument ?? {}).document;
    const actor = this._actor;

    this.vmBtnRoll = new ButtonRollViewModel({
      parent: thiz,
      id: "vmBtnRoll",
      target: owningDocument,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(skillAbility.name),
      primaryChatImage: skillAbility.img,
      secondaryChatTitle: game.i18n.localize(owningDocument.name),
      secondaryChatImage: owningDocument.img,
      rollType: "dice-pool",
      onClick: async (callback) => {
        const r = await callback();
        await owningDocument.advanceByRollResult(r);
      },
      actor: actor,
      isEditable: (thiz.isEditable || thiz.isGM) && actor !== undefined,
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: skillAbility,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: skillAbility.img,
      onChange: (_, newValue) => {
        skillAbility.img = newValue;
      },
    });
    this.vmTfName = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfName",
      value: skillAbility.name,
      onChange: (_, newValue) => {
        skillAbility.name = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.general.name"),
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      parent: thiz,
      id: "vmBtnDelete",
      target: skillAbility,
      withDialog: true,
    });
    this.vmNsRequiredLevel = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsRequiredLevel",
      value: skillAbility.requiredLevel,
      onChange: (_, newValue) => {
        skillAbility.requiredLevel = newValue;
      },
      min: 0,
    });
    this.vmTfObstacle = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfObstacle",
      value: skillAbility.obstacle,
      onChange: (_, newValue) => {
        skillAbility.obstacle = newValue;
      },
      propertyPath: "obstacle",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.placeholder"),
    });
    this.vmTfOpposedBy = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfOpposedBy",
      value: skillAbility.opposedBy,
      onChange: (_, newValue) => {
        skillAbility.opposedBy = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.placeholder"),
    });
    this.vmTfDistance = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfDistance",
      value: skillAbility.distance,
      onChange: (_, newValue) => {
        skillAbility.distance = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.distance.placeholder"),
    });
    this.vmNsApCost = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsApCost",
      value: skillAbility.apCost,
      onChange: (_, newValue) => {
        skillAbility.apCost = newValue;
      },
      min: 0,
    });
    this.vmDdAttackType = new InputDropDownViewModel({
      id: "vmDdAttackType",
      parent: this,
      options: this.attackTypeOptions,
      value: this.skillAbility.attackType === null ? undefined : this.attackTypeOptions.find(it => it.value === this.skillAbility.attackType.name),
      onChange: (_, newValue) => {
        this.skillAbility.attackType = newValue;
      },
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          if (isDefined(obj) === true) {
            return ATTACK_TYPES.asChoices().find(it => it.value === obj.name);
          } else {
            return ATTACK_TYPES.asChoices().find(it => it.value === "none");
          }
        },
        fromChoiceOption(option) {
          return ATTACK_TYPES[option.value];
        }
      }),
    });

    this.vmTaCondition = new InputTextareaViewModel({
      parent: thiz,
      id: "vmTaCondition",
      value: skillAbility.condition,
      onChange: (_, newValue) => {
        skillAbility.condition = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.condition.placeholder"),
    });
    this.vmRtDescription = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtDescription",
      value: skillAbility.description,
      onChange: (_, newValue) => {
        skillAbility.description = newValue;
      },
    });
    this.vmBtnContextMenu = new ButtonContextMenuViewModel({
      parent: thiz,
      id: "vmBtnContextMenu",
      menuItems: [
        // Add damage
        {
          name: game.i18n.localize("ambersteel.damageDefinition.add"),
          icon: '<i class="fas fa-plus"></i>',
          condition: () => { return true; }, // TODO #388 superfluous?
          callback: () => {
            const damage = thiz.skillAbility.damage.concat([]);
            damage.push(new DamageAndType({
              damage: "",
              damageType: DAMAGE_TYPES.none.name,
            }));
            thiz.skillAbility.damage = damage;
          },
        },
      ]
      // Toggle obstacle
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.label", thiz.skillAbility, "obstacle", ""))
      // Toggle opposed by
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.opposedBy.label", thiz.skillAbility, "opposedBy", ""))
      // Toggle distance
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.distance.label", thiz.skillAbility, "distance", ""))
      // Toggle attack type
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.attackType.label", thiz.skillAbility, "attackType", ATTACK_TYPES.none))
      // Toggle condition
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.condition.label", thiz.skillAbility, "condition", "")),
    });

    this.vmDamageDefinitionList = new DamageDefinitionListViewModel({
      id: `vmDamageDefinitionList`,
      parent: this,
      value: this.skillAbility.damage,
      onChange: (_, newValue) => {
        this.skillAbility.damage = newValue;
      },
      resolveFormulaContext: this._getRootOwningDocument(this.skillAbility),
      chatTitle: `${game.i18n.localize("ambersteel.damageDefinition.label")} - ${this.skillAbility.name}`,
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });
    updates.set(this.vmBtnRoll, {
      ...updates.get(this.vmBtnRoll),
      isEditable: (this.isEditable || this.isGM) && this._actor !== undefined,
    });

    return updates;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.damageInfoBubble = new InfoBubble({
      html: html,
      text: game.i18n.localize("ambersteel.damageDefinition.infoFormulae"),
      parent: html.find(`#${this.id}-damage-info`),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
  }

  /** @override */
  dispose() {
    super.dispose();

    this.damageInfoBubble.remove();
  }

  /**
   * Returns the root owning document of the skill ability, if it has one. 
   * Otherwise, returns the skill ability itself.  
   * 
   * @returns {TransientDocument | SkillAbility}
   * 
   * @private
   */
  _getRootOwningDocument() {
    if (this.skillAbility.owningDocument !== undefined) {
      return this.skillAbility.owningDocument;
    } else {
      return this.skillAbility;
    }
  }
}
