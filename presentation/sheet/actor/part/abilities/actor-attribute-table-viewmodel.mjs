import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
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
   * @param {TransientBaseActor} args.document
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

    for (const attribute of this.attributes) {
      thiz.attributeViewModels.push({
        attributeName: attribute.name,
        localizableName: attribute.localizableName,
        localizableAbbreviation: attribute.localizableAbbreviation,
        requiredSuccesses: attribute.advancementRequirements.successes,
        requiredFailures: attribute.advancementRequirements.failures,
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
        vmNsModdedLevel: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsModdedLevel-${attribute.name}`,
          propertyOwner: attribute,
          propertyPath: "moddedLevel",
          min: 0,
        }),
        vmNsSuccesses: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsSuccesses-${attribute.name}`,
          propertyOwner: attribute,
          propertyPath: "advancementProgress.successes",
          min: 0,
        }),
        vmNsFailures: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsFailures-${attribute.name}`,
          propertyOwner: attribute,
          propertyPath: "advancementProgress.failures",
          min: 0,
        }),
      });
    }
  }
}
