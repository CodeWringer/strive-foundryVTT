import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import InfoBubble from "../../../component/info-bubble/info-bubble.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";

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
    const factory = new ViewModelFactory();
    
    const skillAbility = this.skillAbility;
    const owningDocument = skillAbility.owningDocument;
    this._actor = ((thiz.skillAbility.owningDocument ?? {}).owningDocument ?? {}).document;
    const actor = this._actor;

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

    this.vmDamageDefinitionList = new DamageDefinitionListViewModel({
      id: `vmDamageDefinitionList`,
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      propertyOwner: thiz.skillAbility,
      propertyPath: "damage",
      hintId: thiz.id,
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
  async activateListeners(html, isOwner, isEditable) {
    await super.activateListeners(html, isOwner, isEditable);

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
