import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";
import AttributeTableViewModel from "./actor-attribute-table-viewmodel.mjs";

export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTES; }

  /** @override */
  get entityId() { return this.document.id; }
  
  /**
   * @type {String}
   * @readonly
   */
  get attributeTableTemplate() { return TEMPLATES.ACTOR_ATTRIBUTE_TABLE; }

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
    validateOrThrow(args, ["document"]);
    
    // Own properties.
    this.document = args.document;

    // Child view models. 
    const thiz = this;

    const physicalAttributes = this.document.attributeGroups.find(it => it.name === "physical");
    this.attributesPhysicalViewModel = new AttributeTableViewModel({
      ...args, 
      id: "attributes-physical",
      attributes: physicalAttributes.attributes,
      attributeGroupName: physicalAttributes.name,
      localizableAttributeGroupName: physicalAttributes.localizableName,
      parent: thiz,
    });

    const mentalAttributes = this.document.attributeGroups.find(it => it.name === "mental");
    this.attributesMentalViewModel = new AttributeTableViewModel({
      ...args, 
      id: "attributes-mental",
      attributes: mentalAttributes.attributes,
      attributeGroupName: mentalAttributes.name,
      localizableAttributeGroupName: mentalAttributes.localizableName,
      parent: thiz,
    });

    const socialAttributes = this.document.attributeGroups.find(it => it.name === "social");
    this.attributesSocialViewModel = new AttributeTableViewModel({
      ...args, 
      id: "attributes-social",
      attributes: socialAttributes.attributes,
      attributeGroupName: socialAttributes.name,
      localizableAttributeGroupName: socialAttributes.localizableName,
      parent: thiz,
    });
  }
}
