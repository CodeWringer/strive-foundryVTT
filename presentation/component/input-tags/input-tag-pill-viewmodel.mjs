import { isDefined } from "../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import * as StringUtil from "../../../business/util/string-utility.mjs";
import Tag from "../../../business/tags/tag.mjs";

/**
 * Represents a single `Tag`. 
 * 
 * @extends ViewModel
 * 
 * @property {Tag} tag The represented tag. 
 * * Read-only. 
 * @property {String} localizedName Returns the localized label of the tag. 
 * * Read-only. 
 * 
 * @method onDelete Callback that is invoked when the "delete" button 
 * is clicked. Receives the tag as its sole argument. 
 */
export default class InputTagPillViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_INPUT_TAG; }

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
   * @param {Tag} args.tag The tag to represent. 
   * @param {Function | undefined} args.onDelete Callback that is invoked 
   * when the "delete" button is clicked. Receives the tag as its sole argument. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["tag"]);

    this.tag = args.tag;
    this.onDelete = args.onDelete ?? ((tag) => {});

    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: this,
      iconHtml: '<i class="fas fa-times"></i>',
      isEditable: this.isEditable,
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.delete.deleteTypeOf"),
        game.i18n.localize("system.general.tag.singular"),
        game.i18n.localize(this.tag.localizableName)
      ),
      onClick: () => {
        this.onDelete(this.tag);
      }
    });
  }
}
