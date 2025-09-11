import ViewModel from "../../../../view-model/view-model.mjs";
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs";
import { ExtenderUtil } from "../../../../../common/extender-util.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import { ATTRIBUTES } from "../../../../../business/ruleset/attribute/attributes.mjs";
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import CharacterAttribute from "../../../../../business/ruleset/attribute/character-attribute.mjs";
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs";
import Ruleset from "../../../../../business/ruleset/ruleset.mjs";
import { StringUtil } from "../../../../../business/util/string-utility.mjs";
import RulesetExplainer from "../../../../../business/ruleset/ruleset-explainer.mjs";

/**
 * @property {String} childTemplate
 * @property {ViewModel} vmChild
 */
export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ATTRIBUTES; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get isNPC() { return this.document.type === ACTOR_TYPES.NPC; }

  /**
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
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.attributes = ATTRIBUTES.asArray().map(it => {
      const name = it.name.capitalize();

      const characterAttribute = new CharacterAttribute(this.document.document, it.name);

      const nameVmRoll = `vm${name}Roll`;
      const vmRoll = new ButtonRollViewModel({
        id: nameVmRoll,
        parent: this,
        target: characterAttribute,
        rollSchema: new Ruleset().getAttributeRollSchema(),
        primaryChatTitle: game.i18n.localize(it.localizableName),
        actor: this.document,
      });
      this[nameVmRoll] = vmRoll;

      const nameVmIcon = `vm${name}Icon`;
      const vmIcon = new ViewModel({
        id: nameVmIcon,
        parent: this,
        localizedToolTip: `${game.i18n.localize(it.localizableName)} [${game.i18n.localize(it.localizableAbbreviation)}]`,
      });
      this[nameVmIcon] = vmIcon;
      
      const attributeAdvancementExplanation = new RulesetExplainer().getExplanationForAttributeAdvancement(characterAttribute);
      const attributeAdvancementTitle = game.i18n.localize("system.character.advancement.level");
      const attributeToolTip = (this.showReminders && this.document.advancementEnabled) 
        ? `${attributeAdvancementTitle}<br>${attributeAdvancementExplanation}`
        : attributeAdvancementTitle;
      const nameVmAttribute = `vm${name}Attribute`;
      const vmAttribute = new InputNumberSpinnerViewModel({
        id: nameVmAttribute,
        parent: this,
        value: characterAttribute.level,
        min: 0,
        localizedToolTip: attributeToolTip,
        onChange: (_, newValue) => {
          characterAttribute.level = newValue;
        },
      });
      this[nameVmAttribute] = vmAttribute;
      
      const nameVmModified = `vm${name}Modified`;
      const vmModified = new InputNumberSpinnerViewModel({
        id: nameVmModified,
        parent: this,
        value: characterAttribute.modifiedLevel,
        localizedToolTip: StringUtil.format2(game.i18n.localize("system.character.advancement.modifiedLevelWithPlaceholders"), {
          rawLevel: characterAttribute.level,
          operand: characterAttribute.levelModifier >= 0 ? "+" : "-",
          modifier: Math.abs(characterAttribute.levelModifier),
          modifiedLevel: characterAttribute.modifiedLevel,
        }),
        contentCssClass: "font-bold font-size-lg",
        onChange: (_, newValue) => {
          characterAttribute.levelModifier = newValue - characterAttribute.level;
        },
        displayValueMapper: (value) => {
          return characterAttribute.modifiedLevel;
        },
      });
      this[nameVmModified] = vmAttribute;

      const modifier = `(${characterAttribute.levelModifier >= 0 ? "+" : "-"}${Math.abs(characterAttribute.levelModifier)})`;

      return {
        vmRoll: vmRoll,
        vmIcon: vmIcon,
        icon: it.icon,
        vmAttribute: vmAttribute,
        vmModified: vmModified,
        modifier: modifier,
      };
    });
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorAttributesViewModel));
  }

}
