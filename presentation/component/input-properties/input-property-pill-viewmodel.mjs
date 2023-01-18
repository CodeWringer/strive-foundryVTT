import { setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { getNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents an input field for a dynamic number of properties. 
 * 
 * A user can select from a given list of properties, as well as define new properties, simply by typing them. 
 * 
 * @extends ViewModel
 * 
 * @property {DocumentProperty} documentProperty
 * * Read-only. 
 * @property {String} localizedName
 * * Read-only. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 */
export default class InputPropertyPillViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_PROPERTY_PILL; }

  get localizedName() {
    if (isDefined(this.documentProperty.localizableName) === true) {
      return game.i18n.localize(this.documentProperty.localizableName);
    } else {
      return this.documentProperty.id;
    }
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {DocumentProperty} args.documentProperty
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner", "documentProperty"]);

    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
    this.documentProperty = args.documentProperty;

    const thiz = this;
    
    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: this,
      isEditable: this.isEditable,
      localizableTitle: "ambersteel.general.delete.label",
      onClick: () => {
        const properties = getNestedPropertyValue(this.propertyOwner, this.propertyPath);
        let index = -1;
        for (let i = 0; i < properties.length; i++) {
          const property = properties[i];
          if (property.id === thiz.documentProperty.id) {
            index = i;
            break;
          }
        }
        if (index < 0) {
          game.ambersteel.logger.logWarn(`Attempting to delete document property '${thiz.documentProperty.id}' failed! Document property not on 'propertyOwner'`);
        } else {
          properties.splice(index, 1);
          setNestedPropertyValue(thiz.propertyOwner, thiz.propertyPath, properties);
        }
      }
    });
  }
}
