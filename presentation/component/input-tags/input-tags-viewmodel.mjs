import Tag from "../../../business/tags/tag.mjs";
import { setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { getNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import InputTagPillViewModel from "./input-tag-pill-viewmodel.mjs";

/**
 * Represents an input field for a dynamic number of tags. 
 * 
 * A user can select from a given list of tags, as well as define new tags, simply by typing them. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} propertyPath
 * * Read-only. 
 * @property {Object} propertyOwner
 * * Read-only. 
 * @property {Array<Tag>} systemTags An array 
 * of tags to offer the user for auto-completion. 
 * @property {Array<InputTagPillViewModel>} tagViewModels
 * * Read-only. 
 * @property {String} templatePill
 * * Read-only. 
 */
export default class InputTagsViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TAGS; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputTags', `{{> "${InputTagsViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {String}
   * @readonly
   */
  get templatePill() { return InputTagPillViewModel.TEMPLATE; }

  get newEntry() { return ""; }
  set newEntry(value) {
    // Try to find a matching tag by id. 
    // Search case-insensitively and replace spaces with underscores, so users needn't know the internal IDs and can 
    // instead simply type the exact text they may find on other documents and expect it to work. 
    let tag = this.systemTags.find(it => it.id.toLowerCase() === value.toLowerCase().replace(" ", "_"));
    if (tag === undefined) {
      tag = new Tag({
        id: value,
      });
    }

    const tags = getNestedPropertyValue(this.propertyOwner, this.propertyPath);
    // Prevent adding the same tag twice. 
    if (tags.find(it => it.id === tag.id) !== undefined) return;

    tags.push(tag);
    setNestedPropertyValue(this.propertyOwner, this.propertyPath, tags);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Array<Tag> | undefined} args.systemTags Optional. An array 
   * of tags to offer the user for auto-completion. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
    this.systemTags = args.systemTags ?? [];

    this.tagViewModels = [];
    this.tagViewModels = this._getTagViewModels();

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
   * @param {Array<Tag> | undefined} args.systemTags Optional. An array 
   * of tags to offer the user for auto-completion. 
   */
  update(args = {}) {
    this.systemTags = args.systemTags ?? this.systemTags;

    const newTags = this._getTagViewModels();
    this._cullObsolete(this.tagViewModels, newTags);
    this.tagViewModels = newTags;

    super.update(args);
  }

  /**
   * @returns {Array<InputTagPillViewModel>}
   * 
   * @private
   */
  _getTagViewModels() {
    return this._getViewModels(
      getNestedPropertyValue(this.propertyOwner, this.propertyPath), 
      this.tagViewModels,
      (args) => { return new InputTagPillViewModel({
        id: args.document.id,
        parent: this,
        propertyPath: this.propertyPath,
        propertyOwner: this.propertyOwner,
        tag: args.document,
        isEditable: args.isEditable,
      }); }
    );
  }
}
