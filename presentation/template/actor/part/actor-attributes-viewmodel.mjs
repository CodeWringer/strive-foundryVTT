import { TEMPLATES } from "../../templatePreloader.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import AttributeTableViewModel from "../component/component-attribute-table-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTES; }

  /** @override */
  get entityId() { return this.document.id; }
  
  attributesPhysicalViewModel = undefined;
  get attributesPhysicalViewModelId() { return "child-attributes-physical-viewmodel"; }

  attributesMentalViewModel = undefined;
  get attributesMentalViewModelId() { return "child-attributes-mental-viewmodel"; }

  attributesSocialViewModel = undefined;
  get attributesSocialViewModelId() { return "child-attributes-social-viewmodel"; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);
    
    // Own properties.
    this.document = args.document;

    // Child view models. 
    const thiz = this;

    const physicalAttributes = this.document.attributeGroups.find(it => it.name === "physical");
    this.attributesPhysicalViewModel = new AttributeTableViewModel({
      ...args, 
      id: thiz.attributesPhysicalViewModelId,
      attributes: physicalAttributes.attributes,
      attributeGroupName: physicalAttributes.name,
      localizableAttributeGroupName: physicalAttributes.localizableName,
      parent: thiz,
    });

    const mentalAttributes = this.document.attributeGroups.find(it => it.name === "mental");
    this.attributesMentalViewModel = new AttributeTableViewModel({
      ...args, 
      id: thiz.attributesMentalViewModelId,
      attributes: mentalAttributes.attributes,
      attributeGroupName: mentalAttributes.name,
      localizableAttributeGroupName: mentalAttributes.localizableName,
      parent: thiz,
    });

    const socialAttributes = this.document.attributeGroups.find(it => it.name === "social");
    this.attributesSocialViewModel = new AttributeTableViewModel({
      ...args, 
      id: thiz.attributesSocialViewModelId,
      attributes: socialAttributes.attributes,
      attributeGroupName: socialAttributes.name,
      localizableAttributeGroupName: socialAttributes.localizableName,
      parent: thiz,
    });
  }
}
