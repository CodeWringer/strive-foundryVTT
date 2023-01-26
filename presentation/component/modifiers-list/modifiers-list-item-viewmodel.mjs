import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import Modifier from "../../../business/document/modifier.mjs";

/**
 * Represents a modifer list item. 
 * 
 * @extends ViewModel
 */
export default class ModifiersListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_MODIFIERS_LIST_ITEM; }

  /**
   * @param {Object} args 
   * @param {Modifier} args.modifier
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["modifer", "propertyPath", "propertyOwner"]);

    this.modifier = args.modifier;
    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;

    this.vmPropertyPath = new InputTextFieldViewModel({
      id: "vmPropertyPath",
      parent: this,
      propertyOwner: this,
      propertyPath: "propertyPath"
    });
    this.vmFormula = new InputTextFieldViewModel({
      id: "vmFormula",
      parent: this,
      propertyOwner: this,
      propertyPath: "formula"
    });
    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: this,
      onClick: async () => {
        // TODO
      },
    });
  }
}

Handlebars.registerPartial('modifiersList', `{{> "${ModifiersListItemViewModel.TEMPLATE}"}}`);
