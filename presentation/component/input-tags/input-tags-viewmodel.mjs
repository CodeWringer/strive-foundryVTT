import Tag from "../../../business/tags/tag.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import InputTagPillViewModel from "./input-tag-pill-viewmodel.mjs";

/**
 * Represents an input field for a dynamic number of tags. 
 * 
 * A user can select from a given list of tags, as well as define new tags, simply by typing them. 
 * 
 * @extends ViewModel
 * 
 * @property {Array<Tag>} value The current value. 
 * @property {Array<Tag>} systemTags An array 
 * of tags to offer the user for auto-completion. 
 * @property {Array<InputTagPillViewModel>} tagViewModels
 * * Read-only. 
 * @property {String} templatePill
 * * Read-only. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Array<Tag>}`
 * * `newValue: {Array<Tag>}`
 */
export default class InputTagsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_INPUT_TAGS; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputTags', `{{> "${InputTagsViewModel.TEMPLATE}"}}`);
  }

  /**
   * Returns the current value. 
   * 
   * @type {Array<Tag>}
   */
  get value() { return this._value; }
  /**
   * Sets the current value. 
   * 
   * @param {Array<Tag>} newValue
   */
  set value(newValue) {
    const oldValue = this._value;
    this._value = newValue;
    this.onChange(oldValue, newValue);
  }

  /**
   * @type {String}
   * @readonly
   */
  get templatePill() { return InputTagPillViewModel.TEMPLATE; }

  /**
   * @param {Object} args
   * @param {Array<Tag> | undefined} args.value 
   * @param {Array<Tag> | undefined} args.systemTags Optional. An array 
   * of tags to offer the user for auto-completion. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Array<Tag>}`
   * * `newValue: {Array<Tag>}`
   */
  constructor(args = {}) {
    super(args);

    this.systemTags = args.systemTags ?? [];

    this._value = args.value ?? [];
    this.tagViewModels = [];
    this.tagViewModels = this._getTagViewModels();
    this.onChange = args.onChange ?? (() => {});

    this.vmAddNew = new InputTextFieldViewModel({
      id: "vmAddNew",
      parent: this,
      requireConfirmation: true,
      onChange: (oldValue, newValue) => {
        // Do nothing on empty value. This is the case when the user cancels. 
        if (newValue.trim().length === 0) return;

        // Try to find a matching tag by id. 
        // Search case-insensitively and replace spaces with underscores, so users needn't know the internal IDs and can 
        // instead simply type the exact text they may find on other documents and expect it to work. 
        let tag = this.systemTags.find(it => it.id.toLowerCase() === newValue.toLowerCase().replace(" ", "_"));
        if (tag === undefined) {
          // Not a system tag - so a new one. 
          tag = new Tag({
            id: newValue,
            localizableName: newValue,
          });
        }

        const tags = this.value.concat([]); // safe copy
        // Prevent adding the same tag twice. 
        if (tags.find(it => it.id === tag.id) !== undefined) return;

        tags.push(tag);

        this.value = tags;
      },
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

    const newTagViewModels = this._getTagViewModels();
    this._cullObsolete(this.tagViewModels, newTagViewModels);
    this.tagViewModels = newTagViewModels;

    super.update(args);
  }

  /**
   * Creates and returns the child view models of the contained tags. 
   * 
   * @returns {Array<InputTagPillViewModel>}
   * 
   * @private
   */
  _getTagViewModels() {
    return this._getViewModels(
      this.value, 
      this.tagViewModels,
      (args) => {
        return new InputTagPillViewModel({
          id: args.document.id,
          parent: this,
          tag: args.document,
          isEditable: args.isEditable,
          onDelete: (tag) => {
            this._deleteTag(tag);
          }
        }); 
      }
    );
  }
  
  /**
   * Deletes the given tag. 
   * 
   * @param {Tag} tag The tag to delete. 
   * 
   * @private
   */
  _deleteTag(tag) {
    const tags = this.value.concat([]); // safe copy
    const index = tags.findIndex(it => it.id === tag.id);
    if (index < 0) {
      game.strive.logger.logWarn(`Attempting to delete tag '${tag.id}' failed!`);
    } else {
      tags.splice(index, 1);
      this.value = tags;
    }
  }
}
