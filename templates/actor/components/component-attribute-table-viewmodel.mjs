import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class AttributeTableViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTE_TABLE; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Array<Object>}
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
   * @param {Array<Object>} attributes
   * @param {String} attributeGroupName
   * @param {String} localizableAttributeGroupName
   */
  constructor(args = {}) {
    super(args);

    // Own properties.
    this.actor = args.actor;
    this.attributes = args.attributes;
    this.attributeGroupName = args.attributeGroupName;
    this.localizableAttributeGroupName = args.localizableAttributeGroupName;
    
    // Child view models. 
    const thiz = this;
  }
}
