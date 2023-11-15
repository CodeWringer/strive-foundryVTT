import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs";
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { createUUID } from "../../../../business/util/uuid-utility.mjs";
import { isDefined, validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../component/info-bubble/info-bubble.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextareaViewModel from "../../../component/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class SkillViewModel extends ViewModel {
  /**
   * @type {String}
   * @readonly
   */
  visGroupId = undefined;

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * 
   * @param {TransientSkill} args.document
   * @param {Actor | undefined} args.actor If not undefined, this is the actor that owns the item. 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;
    this.actor = args.actor;
    this.visGroupId = args.visGroupId ?? createUUID();
    
    const thiz = this;
    this.vmBtnContextMenu = new ButtonContextMenuViewModel({
      id: "vmBtnContextMenu",
      parent: this,
      menuItems: [
        // Add damage
        {
          name: game.i18n.localize("ambersteel.damageDefinition.add"),
          icon: '<i class="fas fa-plus"></i>',
          condition: () => { return true; }, // TODO #388 superfluous?
          callback: () => {
            const damage = thiz.document.damage.concat([]);
            damage.push(new DamageAndType({
              damage: "",
              damageType: DAMAGE_TYPES.none.name,
            }));
            thiz.document.damage = damage;
          },
        },
      ]
      // Toggle ap cost
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.apCost", this.document, "apCost", 0))
      // Toggle obstacle
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.label", this.document, "obstacle", ""))
      // Toggle opposed by
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.opposedBy.label", this.document, "opposedBy", ""))
      // Toggle distance
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.distance.label", this.document, "distance", ""))
      // Toggle attack type
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.attackType.label", this.document, "attackType", ATTACK_TYPES.none))
      // Toggle condition
      .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.condition.label", this.document, "condition", "")),
    });
    this.hideObstacle = !isDefined(this.document.obstacle);
    this.vmTfObstacle = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfObstacle",
      value: this.document.obstacle,
      onChange: (_, newValue) => {
        this.document.obstacle = newValue;
      },
      propertyPath: "obstacle",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.placeholder"),
    });
    this.hideOpposedBy = !isDefined(this.document.opposedBy);
    this.vmTfOpposedBy = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfOpposedBy",
      value: this.document.opposedBy,
      onChange: (_, newValue) => {
        this.document.opposedBy = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.placeholder"),
    });
    this.hideDistance = !isDefined(this.document.distance);
    this.vmTfDistance = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfDistance",
      value: this.document.distance,
      onChange: (_, newValue) => {
        this.document.distance = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.distance.placeholder"),
    });
    this.hideApCost = !isDefined(this.document.apCost);
    this.vmNsApCost = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsApCost",
      value: this.document.apCost,
      onChange: (_, newValue) => {
        this.document.apCost = newValue;
      },
      min: 0,
    });
    this.hideAttackType = !isDefined(this.document.attackType);
    this.vmDdAttackType = new InputDropDownViewModel({
      id: "vmDdAttackType",
      parent: this,
      options: ATTACK_TYPES.asChoices(),
      value: isDefined(this.document.attackType) ? ATTACK_TYPES.asChoices().find(it => it.value === this.document.attackType.name) : undefined,
      onChange: (_, newValue) => {
        this.document.attackType = ATTACK_TYPES[newValue];
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
    this.hideCondition = !isDefined(this.document.condition);
    this.vmTaCondition = new InputTextareaViewModel({
      parent: thiz,
      id: "vmTaCondition",
      value: this.document.condition,
      onChange: (_, newValue) => {
        this.document.condition = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.condition.placeholder"),
    });
    this.hideDamage = this.document.damage.length === 0;
    this.vmDamageDefinitionList = new DamageDefinitionListViewModel({
      id: `vmDamageDefinitionList`,
      parent: this,
      value: this.document.damage,
      onChange: (_, newValue) => {
        this.document.damage = newValue;
      },
      resolveFormulaContext: this._getRootOwningDocument(this.document),
      chatTitle: `${game.i18n.localize("ambersteel.damageDefinition.label")} - ${this.document.name}`,
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.damageInfoBubble = new InfoBubble({
      html: html,
      map: [
        { element: html.find(`#${this.id}-damage-info`), text: game.i18n.localize("ambersteel.damageDefinition.infoFormulae") },
      ],
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
  }

  /**
   * Returns the root owning document of the skill, if it has one. 
   * Otherwise, returns the skill itself.  
   * 
   * @returns {TransientDocument | TransientSkill}
   * 
   * @private
   */
  _getRootOwningDocument() {
    if (this.document.owningDocument !== undefined) {
      return this.document.owningDocument;
    } else {
      return this.document;
    }
  }
}
