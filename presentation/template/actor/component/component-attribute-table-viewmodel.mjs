import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class AttributeTableViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTE_TABLE; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /** @override */
  get entityId() { return this.actor.id; }

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
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Actor} args.actor
   * @param {Array<Object>} args.attributes
   * @param {String} args.attributeGroupName
   * @param {String} args.localizableAttributeGroupName
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor", "attributes", "attributeGroupName", "localizableAttributeGroupName"]);

    this.actor = args.actor;
    this.attributes = args.attributes;
    this.attributeGroupName = args.attributeGroupName;
    this.localizableAttributeGroupName = args.localizableAttributeGroupName;
    this.contextType = args.contextType ?? "component-attribute-table";
    
    const thiz = this;
    const factory = new ViewModelFactory();

    for (let i = 0; i < this.attributes.length; i++) {
      const attribute = this.attributes[i];

      thiz.attributeViewModels.push({
        attributeName: attribute.name,
        localizableName: attribute.localizableName,
        localizableAbbreviation: attribute.localizableAbbreviation,
        requiredSuccessses: attribute.requiredSuccessses,
        requiredFailures: attribute.requiredFailures,
        vmBtnRoll: factory.createVmBtnRoll({
          parent: thiz,
          id: `vmBtnRoll-${attribute.name}`,
          target: thiz.actor.data.data.attributes[thiz.attributeGroupName][attribute.name],
          propertyPath: undefined,
          primaryChatTitle: game.i18n.localize(attribute.localizableName),
          rollType: "dice-pool",
          callback: "advanceAttributeBasedOnRollResult",
          callbackData: attribute.name,
          actor: thiz.actor,
        }),
        vmNsLevel: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsLevel-${attribute.name}`,
          propertyOwner: thiz.actor,
          propertyPath: `data.data.attributes.${thiz.attributeGroupName}.${attribute.name}.value`,
          min: 0,
        }),
        vmNsSuccesses: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsSuccesses-${attribute.name}`,
          propertyOwner: thiz.actor,
          propertyPath: `data.data.attributes.${thiz.attributeGroupName}.${attribute.name}.successes`,
          min: 0,
        }),
        vmNsFailures: factory.createVmNumberSpinner({
          parent: thiz,
          id: `vmNsFailures-${attribute.name}`,
          propertyOwner: thiz.actor,
          propertyPath: `data.data.attributes.${thiz.attributeGroupName}.${attribute.name}.failures`,
          min: 0,
        }),
      });
    }
  }
}