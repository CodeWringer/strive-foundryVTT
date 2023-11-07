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
 * 
 * @method onDelete Callback that is invoked when the "delete" button 
 * is clicked. Receives the tag as its sole argument. 
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
      isEditable: this.isEditable,
      localizedTooltip: game.i18n.localize("ambersteel.general.delete.label"),
      onClick: () => {
        this.onDelete(this.tag);
      }
    });
  }
}
