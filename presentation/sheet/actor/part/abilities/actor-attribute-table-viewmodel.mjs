import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs";
import CharacterAttribute from "../../../../../business/ruleset/attribute/character-attribute.mjs";
import Ruleset from "../../../../../business/ruleset/ruleset.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import ButtonCheckBoxViewModel from "../../../../component/button-checkbox/button-checkbox-viewmodel.mjs";
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Array<CharacterAttribute>} attributes
 * @property {Boolean} isNPC
 * * Read-only
 * @property {Boolean} showChallengeRating
 * @property {Boolean} headerInteractible
 * @property {String | undefined} iconClass CSS class of the icon to display. 
 * E. g. `"ico-strongarm-solid"` or `"fas fa-brain"`
 * 
 * @method onHeaderClicked Callback that is invoked when the header is clicked. 
 */
export default class AttributeTableViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ATTRIBUTE_TABLE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Array<CharacterAttribute>}
   */
  attributes = [];

  /**
   * A list of attribute describing objects. Contains the view model instances 
   * to use to render each attribute. These objects have the following properties: 
   * * `{ButtonRollViewModel} vmBtnRoll`
   * * `{InputNumberSpinnerViewModel} vmNsLevel`
   * * `{InputNumberSpinnerViewModel} vmNsLevelModifier`
   * * `{InputNumberSpinnerViewModel | undefined} vmNsProgress`
   * 
   * @type {Array<Object>}
   */
  attributeViewModels = [];

  /**
   * Returns `true`, if the actor is a player character. 
   * 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }

  /**
   * Returns `true`, if the actor is a non-player character. 
   * 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === ACTOR_TYPES.NPC; }

  /**
   * Returns `true`, if the advancement progress is to be hidden. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showAdvancementProgression() { return (this.isPC === true) || (this.isNPC && this.document.progressionVisible === true); }

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
   * @param {Array<CharacterAttribute>} args.attributes
   * @param {Boolean | undefined} args.showChallengeRating
   * * default `false`
   * @param {Boolean | undefined} args.headerInteractible
   * * default `false`
   * @param {Function | undefined} args.onHeaderClicked Callback that is invoked when 
   * the header is clicked. 
   * @param {String | undefined} args.iconClass CSS class of the icon to display. 
   * E. g. `"ico-strongarm-solid"` or `"fas fa-brain"`
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document", "attributes"]);

    this.document = args.document;
    this.attributes = args.attributes;
    this.contextType = args.contextType ?? "component-attribute-table";
    this.showChallengeRating = args.showChallengeRating ?? false;
    this.headerInteractible = args.headerInteractible ?? false;
    this.onHeaderClicked = args.onHeaderClicked ?? (() => {});
    this.iconClass = args.iconClass;
    
    for (const attribute of this.attributes) {
      this.attributeViewModels.push({
        attributeName: attribute.name,
        localizableName: attribute.localizableName,
        localizableAbbreviation: attribute.localizableAbbreviation,
        modifiedLevel: attribute.modifiedLevel,
        vmRequiredProgress: new InputNumberSpinnerViewModel({
          parent: this,
          id: `vmRequiredProgress-${attribute.name}`,
          value: attribute.advancementRequirements,
          isEditable: false,
          localizedToolTip: `DEBUG`,
        }),
        vmBtnRoll: new ButtonRollViewModel({
          parent: this,
          id: `vmBtnRoll-${attribute.name}`,
          target: attribute,
          rollSchema: new Ruleset().getAttributeRollSchema(),
          primaryChatTitle: game.i18n.localize(attribute.localizableName),
          actor: this.document,
        }),
        vmNsLevel: new InputNumberSpinnerViewModel({
          parent: this,
          id: `vmNsLevel-${attribute.name}`,
          value: attribute.level,
          onChange: (_, newValue) => {
            attribute.level = newValue;
          },
          min: 0,
        }),
        vmNsLevelModifier: new InputNumberSpinnerViewModel({
          parent: this,
          id: `vmNsLevelModifier-${attribute.name}`,
          value: attribute.levelModifier,
          onChange: (_, newValue) => {
            attribute.levelModifier = newValue;
          },
        }),
        vmNsProgress: this.showAdvancementProgression !== true ? undefined : new InputNumberSpinnerViewModel({
          parent: this,
          id: `vmNsProgress-${attribute.name}`,
          value: attribute.advancementProgress,
          onChange: (_, newValue) => {
            attribute.advancementProgress = newValue;
          },
          min: 0,
        }),
        vmAdvanced: this.showAdvancementProgression !== true ? undefined : new ButtonCheckBoxViewModel({
          parent: this,
          id: `vmAdvanced-${attribute.name}`,
          value: attribute.advanced,
          onChange: (_, newValue) => {
            attribute.advanced = newValue;
          },
        }),
      });
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.headerInteractible === true) {
      html.find(`#${this.id}-header`).click(() => {
        this.onHeaderClicked();
      });
    }
  }
}
