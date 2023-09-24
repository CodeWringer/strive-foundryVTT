import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonCheckBoxViewModel from "../../../../component/button-checkbox/button-checkbox-viewmodel.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModelFactory from "../../../../view-model/view-model-factory.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

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
   * @type {Array<Object>}
   */
  attributeViewModels = [];

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
   * @param {Array<CharacterAttribute>} args.attributes
   * @param {String} args.attributeGroupName
   * @param {String} args.localizableAttributeGroupName
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
    
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmBtnResetExercised = new ButtonViewModel({
      id: "vmBtnResetExercised",
      parent: this,
      isEditable: this.isEditable,
      localizableTitle: "ambersteel.character.advancement.exercised.reset",
      onClick: () => {
        thiz.attributes.forEach(attribute => {
          attribute.exercised = false;
        });
      }
    });

    for (const attribute of this.attributes) {
      thiz.attributeViewModels.push({
        attributeName: attribute.name,
        localizableName: attribute.localizableName,
        localizableAbbreviation: attribute.localizableAbbreviation,
        requiredProgress: attribute.advancementRequirements,
        modifiedLevel: attribute.modifiedLevel,
        vmBtnRoll: factory.createVmBtnRoll({
          parent: thiz,
          id: `vmBtnRoll-${attribute.name}`,
          target: attribute,
          propertyPath: undefined,
          primaryChatTitle: game.i18n.localize(attribute.localizableName),
          rollType: "dice-pool",
          callback: "advanceByRollResult",
          document: thiz.document,
        }),
        vmNsLevel: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsLevel-${attribute.name}`,
          propertyOwner: attribute,
          propertyPath: "level",
          min: 0,
        }),
        vmNsLevelModifier: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsLevelModifier-${attribute.name}`,
          propertyOwner: attribute,
          propertyPath: "levelModifier",
        }),
        vmNsProgress: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsProgress-${attribute.name}`,
          propertyOwner: attribute,
          propertyPath: "advancementProgress",
          min: 0,
        }),
        vmExercised: new ButtonCheckBoxViewModel({
          id: `vmExercised-${attribute.name}`,
          parent: this,
          isEditable: this.isEditable,
          target: attribute,
          propertyPath: "exercised",
        }),
      });
    }
  }
}
