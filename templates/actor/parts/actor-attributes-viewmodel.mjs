import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../module/components/viewmodel.mjs";
import SheetViewModel from "../sheet-viewmodel.mjs";

export default class ActorAttributesViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTES; }

  /**
   * @type {Actor}
   */
  actor = undefined;
  
  attributesPhysicalViewModel = undefined;

  attributesMentalViewModel = undefined;

  attributesSocialViewModel = undefined;

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean} isEditable If true, the sheet is editable. 
   * @param {Boolean} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean} isGM If true, the current user is a GM. 
   * 
   * @param {Actor} actor
   */
  constructor(args = {}) {
    super(args);

    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    this.attributesPhysicalViewModel = new AttributeTableViewModel({ ...args, id: "attributes-physical", attributes: actor.data.data.attributes.physical, parent: thiz });
    this.children.push(this.attributesPhysicalViewModel);

    this.attributesMentalViewModel = new AttributeTableViewModel({ ...args, id: "attributes-mental", attributes: actor.data.data.attributes.mental, parent: thiz });
    this.children.push(this.attributesMentalViewModel);

    this.attributesSocialViewModel = new AttributeTableViewModel({ ...args, id: "attributes-social", attributes: actor.data.data.attributes.social, parent: thiz });
    this.children.push(this.attributesSocialViewModel);
  }
}
