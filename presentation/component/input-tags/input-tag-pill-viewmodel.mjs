import { setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { getNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a single `Tag`. 
 * 
 * @extends ViewModel
 * 
 * @property {Tag} tag The represented tag. 
 * * Read-only. 
 * @property {String} localizedName Returns the localized label of the tag. 
 * * Read-only. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 */
export default class InputTagPillViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TAG; }

  get localizedName() {
    if (isDefined(this.tag.localizableName) === true) {
      return game.i18n.localize(this.tag.localizableName);
    } else {
      return this.tag.id;
    }
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Tag} args.tag The tag to represent. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner", "tag"]);

    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
    this.tag = args.tag;

    const thiz = this;
    
    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: this,
      isEditable: this.isEditable,
      localizableTitle: "ambersteel.general.delete.label",
      onClick: () => {
        const tags = getNestedPropertyValue(this.propertyOwner, this.propertyPath);
        let index = -1;
        for (let i = 0; i < tags.length; i++) {
          const tag = tags[i];
          if (tag.id === thiz.tag.id) {
            index = i;
            break;
          }
        }
        if (index < 0) {
          game.ambersteel.logger.logWarn(`Attempting to delete tag '${thiz.tag.id}' failed! Tag not on 'propertyOwner'`);
        } else {
          tags.splice(index, 1);
          setNestedPropertyValue(thiz.propertyOwner, thiz.propertyPath, tags);
        }
      }
    });
  }
}
