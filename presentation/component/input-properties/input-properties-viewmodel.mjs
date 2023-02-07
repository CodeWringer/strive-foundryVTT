import DocumentProperty from "../../../business/document/document-property.mjs";
import { setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { getNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import InputPropertyPillViewModel from "./input-property-pill-viewmodel.mjs";

/**
 * Represents an input field for a dynamic number of properties. 
 * 
 * A user can select from a given list of properties, as well as define new properties, simply by typing them. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} propertyPath
 * * Read-only. 
 * @property {Object} propertyOwner
 * * Read-only. 
 * @property {Array<DocumentProperty>} systemProperties An array 
 * of document properties to offer the user for auto-completion. 
 * @property {Array<InputPropertyPillViewModel>} propertyViewModels
 * * Read-only. 
 * @property {String} templatePill
 * * Read-only. 
 */
export default class InputPropertiesViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_PROPERTIES; }

  /**
   * @type {String}
   * @readonly
   */
  get templatePill() { return InputPropertyPillViewModel.TEMPLATE; }

  get newEntry() { return ""; }
  set newEntry(value) {
    // Try to find a matching property by id. 
    // Search case-insensitively and replace spaces with underscores, so users needn't know the internal IDs and can 
    // instead simply type the exact text they may find on other documents and expect it to work. 
    let documentProperty = this.systemProperties.find(it => it.id.toLowerCase() === value.toLowerCase().replace(" ", "_"));
    if (documentProperty === undefined) {
      documentProperty = new DocumentProperty({
        id: value,
      });
    }

    const properties = getNestedPropertyValue(this.propertyOwner, this.propertyPath);
    // Prevent adding the same document property twice. 
    if (properties.find(it => it.id === documentProperty.id) !== undefined) return;

    properties.push(documentProperty);
    setNestedPropertyValue(this.propertyOwner, this.propertyPath, properties);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Array<DocumentProperty> | undefined} args.systemProperties Optional. An array 
   * of document properties to offer the user for auto-completion. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
    this.systemProperties = args.systemProperties ?? [];

    this.propertyViewModels = [];
    this.propertyViewModels = this._getPropertyViewModels();

    this.vmAddNew = new InputTextFieldViewModel({
      id: "vmAddNew",
      parent: this,
      propertyPath: "newEntry",
      propertyOwner: this,
      isEditable: this.isEditable,
      requireConfirmation: true,
    });
  }

  /**
   * @param 
   * 
   * @param {Object} args
   * @param {Array<DocumentProperty> | undefined} args.systemProperties Optional. An array 
   * of document properties to offer the user for auto-completion. 
   */
  update(args = {}) {
    this.systemProperties = args.systemProperties ?? this.systemProperties;

    const newProperties = this._getPropertyViewModels();
    this._cullObsolete(this.propertyViewModels, newProperties);
    this.propertyViewModels = newProperties;

    super.update(args);
  }

  /**
   * @returns {Array<InputPropertyPillViewModel>}
   * 
   * @private
   */
  _getPropertyViewModels() {
    return this._getViewModels(
      getNestedPropertyValue(this.propertyOwner, this.propertyPath), 
      this.propertyViewModels,
      (args) => { return new InputPropertyPillViewModel({
        id: args.document.id,
        parent: this,
        propertyPath: this.propertyPath,
        propertyOwner: this.propertyOwner,
        documentProperty: args.document,
        isEditable: args.isEditable,
      }); }
    );
  }
}

Handlebars.registerPartial('inputProperties', `{{> "${InputPropertiesViewModel.TEMPLATE}"}}`);
