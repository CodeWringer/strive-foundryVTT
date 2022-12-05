import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../viewmodel.mjs";
import ViewModelTypeDefinition from "../../view-model/view-model-type-definition.mjs";
import { VIEW_MODEL_TYPE } from "../../view-model/view-model-type.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Own properties
 * 
 */
export default class LabelViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_LABEL; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   */
  constructor(args = {}) {
    super(args);
  }
}

Handlebars.registerPartial('inputLabel', `{{> "${LabelViewModel.TEMPLATE}"}}`);

VIEW_MODEL_TYPE.set(
  "LabelViewModel", 
  new ViewModelTypeDefinition(
    (args) => { return new LabelViewModel(args); },
    []
  )
);
