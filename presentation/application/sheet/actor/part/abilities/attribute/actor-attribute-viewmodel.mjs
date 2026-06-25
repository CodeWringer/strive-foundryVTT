import ViewModel from "../../../../../view-model/view-model.mjs";
import { ExtenderUtil } from "../../../../../../common/util/extender-util.mjs";
import { StringUtil } from "../../../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../../common/util/validation-utility.mjs";
import { Attribute } from "../../../../../../business/model/const/attributes.mjs";
import InputNumberSpinnerViewModel from "../../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ButtonRollViewModel from "../../../../../component/button-roll/button-roll-viewmodel.mjs";
import Ruleset from "../../../../../../business/ruleset/ruleset.mjs";
import RulesetExplainer from "../../../../../../business/ruleset/ruleset-explainer.mjs";
import FoundryWrapper from "../../../../../../foundry-interop/foundry-wrapper.mjs";
import { ContextMenuItem } from "../../../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import DynamicInputDialog from "../../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import DynamicInputDefinition from "../../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import InputDropDownViewModel from "../../../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import TransientBaseCharacterActor from "../../../../../../business/model/document/actor/transient-base-character-actor.mjs";
import { CharacterAttribute } from "../../../../../../business/model/_module.mjs";
import { ATTRIBUTE_TYPES } from "../../../../../../../business/model/domain/const/attribute-types.mjs";

export default class ActorAttributeViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ATTRIBUTE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns true, if the Attribute type is any other than Secondary, in which case a buff or debuff icon 
   * is to be added to the main icon. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hasClassificationIcon() { return this.characterAttribute.type.name !== ATTRIBUTE_TYPES.secondary.name; }
  
  /**
   * Returns the current Attribute classification icon. 
   * 
   * @type {String}
   * @readonly
   */
  get classificationIcon() { return this.characterAttribute.type.icon; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * @param {Attribute} args.attribute
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document", "attribute"]);

    this.document = args.document;
    this.attribute = args.attribute;

    this.characterAttribute = new CharacterAttribute(this.document.document, this.attribute.name);

    this.vmRoll = new ButtonRollViewModel({
      id: "vmRoll",
      parent: this,
      target: this.characterAttribute,
      rollSchema: new Ruleset().getAttributeRollSchema(),
      primaryChatTitle: game.i18n.localize(this.attribute.localizableName),
      actor: this.document,
    });

    this.vmIcon = new ViewModel({
      id: "vmIcon",
      parent: this,
      localizedToolTip: `${game.i18n.localize(this.attribute.localizableName)} [${game.i18n.localize(this.attribute.localizableAbbreviation)}]`,
    });
    if (this.hasClassificationIcon) {
      this.vmSubIcon = new ViewModel({
        id: "vmSubIcon",
        parent: this,
        localizedToolTip: StringUtil.format2(game.i18n.localize("system.character.attribute.type.explanation"), {
          type: game.i18n.localize(this.characterAttribute.type.localizableName),
        }),
      });
    }

    const attributeAdvancementExplanation = new RulesetExplainer().getExplanationForAttributeAdvancement(this.characterAttribute);
    const attributeAdvancementTitle = game.i18n.localize("system.character.advancement.level");
    const attributeToolTip = (this.showReminders && this.document.advancement.advancementEnabled)
      ? `${attributeAdvancementTitle}<br>${attributeAdvancementExplanation}`
      : attributeAdvancementTitle;
    this.vmLevel = new InputNumberSpinnerViewModel({
      id: "vmLevel",
      parent: this,
      value: this.characterAttribute.level,
      min: 0,
      localizedToolTip: attributeToolTip,
      onChange: (_, newValue) => {
        this.characterAttribute.level = newValue;
      },
    });

    this.vmModified = new InputNumberSpinnerViewModel({
      id: "vmLevelModified",
      parent: this,
      value: this.characterAttribute.modifiedLevel,
      localizedToolTip: StringUtil.format2(game.i18n.localize("system.character.advancement.modifiedLevelWithPlaceholders"), {
        rawLevel: this.characterAttribute.level,
        operand: this.characterAttribute.levelModifier >= 0 ? "+" : "-",
        modifier: Math.abs(this.characterAttribute.levelModifier),
        modifiedLevel: this.characterAttribute.modifiedLevel,
      }),
      contentCssClass: "font-bold font-size-lg",
      onChange: (_, newValue) => {
        this.characterAttribute.levelModifier = newValue - this.characterAttribute.level;
      },
      displayValueMapper: (value) => {
        return this.characterAttribute.modifiedLevel;
      },
    });

    this.modifier = `(${this.characterAttribute.levelModifier >= 0 ? "+" : "-"}${Math.abs(this.characterAttribute.levelModifier)})`;
    this.icon = this.attribute.icon;
    this.contextMenuItems = [
      new ContextMenuItem({
        name: game.i18n.localize("system.character.attribute.type.setClassification"),
        callback: async () => {
          const attributeChoices = ATTRIBUTE_TYPES.asChoices();
          const dialog = await new DynamicInputDialog({
            id: "setClassification",
            localizedTitle: StringUtil.format2(game.i18n.localize("system.character.attribute.type.setClassificationOf"), {
              attribute: game.i18n.localize(this.attribute.localizableName),
            }),
            inputDefinitions: [
              new DynamicInputDefinition({
                name: "classification",
                template: InputDropDownViewModel.TEMPLATE,
                viewModelFactory: (id, parent, overrides) => new InputDropDownViewModel({
                  id: id,
                  parent: parent,
                  options: attributeChoices,
                  value: attributeChoices.find(it => it.value === this.characterAttribute.type.name),
                  ...overrides,
                }),
                localizedLabel: game.i18n.localize("system.character.attribute.type.classification"),
              })
            ],
          }).renderAndAwait(true);

          if (!dialog.confirmed) return;

          const classification = ATTRIBUTE_TYPES.asArray().find(it => it.name === dialog["classification"].value);
          this.characterAttribute.type = classification;
        },
      }),
    ];
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorAttributeViewModel));
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.html = html;
    this._contextMenu = new FoundryWrapper().createContextMenu(html, `#${this.id}`, this.contextMenuItems);
  }

}
