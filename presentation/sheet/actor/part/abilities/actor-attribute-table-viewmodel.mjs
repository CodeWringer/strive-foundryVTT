import CharacterAttribute from "../../../../../business/ruleset/attribute/character-attribute.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Array<CharacterAttribute>} attributes
 * @property {String} attributeGroupName
 * @property {String} localizableAttributeGroupName
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
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTE_TABLE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Array<CharacterAttribute>}
   */
  attributes = [];

  /**
   * @type {String}
   */
  attributeGroupName = undefined;

  /**
   * @type {String}
   */
  localizableAttributeGroupName = undefined;

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
  get isPC() { return this.document.type === TransientPc.TYPE; }

  /**
   * Returns `true`, if the actor is a non-player character. 
   * 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === TransientNpc.TYPE; }

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
   * @param {String} args.attributeGroupName
   * @param {String} args.localizableAttributeGroupName
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
    validateOrThrow(args, ["document", "attributes", "attributeGroupName", "localizableAttributeGroupName"]);

    this.document = args.document;
    this.attributes = args.attributes;
    this.attributeGroupName = args.attributeGroupName;
    this.localizableAttributeGroupName = args.localizableAttributeGroupName;
    this.contextType = args.contextType ?? "component-attribute-table";
    this.showChallengeRating = args.showChallengeRating ?? false;
    this.headerInteractible = args.headerInteractible ?? false;
    this.onHeaderClicked = args.onHeaderClicked ?? (() => {});
    this.iconClass = args.iconClass;
    
    const thiz = this;

    for (const attribute of this.attributes) {
      thiz.attributeViewModels.push({
        attributeName: attribute.name,
        localizableName: attribute.localizableName,
        localizableAbbreviation: attribute.localizableAbbreviation,
        requiredProgress: attribute.advancementRequirements,
        modifiedLevel: attribute.modifiedLevel,
        vmBtnRoll: new ButtonRollViewModel({
          parent: thiz,
          id: `vmBtnRoll-${attribute.name}`,
          target: attribute,
          propertyPath: undefined,
          primaryChatTitle: game.i18n.localize(attribute.localizableName),
          rollType: "dice-pool",
          actor: thiz.document,
        }),
        vmNsLevel: new InputNumberSpinnerViewModel({
          parent: thiz,
          id: `vmNsLevel-${attribute.name}`,
          value: attribute.level,
          onChange: (_, newValue) => {
            attribute.level = newValue;
          },
          min: 0,
        }),
        vmNsLevelModifier: new InputNumberSpinnerViewModel({
          parent: thiz,
          id: `vmNsLevelModifier-${attribute.name}`,
          value: attribute.levelModifier,
          onChange: (_, newValue) => {
            attribute.levelModifier = newValue;
          },
        }),
        vmNsProgress: this.showAdvancementProgression !== true ? undefined : new InputNumberSpinnerViewModel({
          parent: thiz,
          id: `vmNsProgress-${attribute.name}`,
          value: attribute.advancementProgress,
          onChange: (_, newValue) => {
            attribute.advancementProgress = newValue;
          },
          min: 0,
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
