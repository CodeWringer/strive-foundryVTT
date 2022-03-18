import AttributeTableViewModel from "../components/component-attribute-table-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";

export default class ActorAttributesViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTES; }

  /**
   * @type {Actor}
   */
  actor = undefined;
  
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
   * @param {Actor} args.actor
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);
    
    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    this.attributesPhysicalViewModel = new AttributeTableViewModel({
      ...args, 
      id: thiz.attributesPhysicalViewModelId,
      attributes: thiz.actor.data.data.attributes.physical.attributes,
      attributeGroupName: thiz.actor.data.data.attributes.physical.name,
      localizableAttributeGroupName: thiz.actor.data.data.attributes.physical.localizableName,
      parent: thiz,
    });
    this.attributesMentalViewModel = new AttributeTableViewModel({
      ...args, 
      id: thiz.attributesMentalViewModelId,
      attributes: thiz.actor.data.data.attributes.mental.attributes,
      attributeGroupName: thiz.actor.data.data.attributes.mental.name,
      localizableAttributeGroupName: thiz.actor.data.data.attributes.mental.localizableName,
      parent: thiz,
    });
    this.attributesSocialViewModel = new AttributeTableViewModel({
      ...args, 
      id: thiz.attributesSocialViewModelId,
      attributes: thiz.actor.data.data.attributes.social.attributes,
      attributeGroupName: thiz.actor.data.data.attributes.social.name,
      localizableAttributeGroupName: thiz.actor.data.data.attributes.social.localizableName,
      parent: thiz,
    });
  }
}
