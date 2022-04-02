import { validateOrThrow } from "../utils/validation-utility.mjs";
import ButtonAddViewModel from "./button-add/button-add-viewmodel.mjs";
import ButtonDeleteViewModel from "./button-delete/button-delete-viewmodel.mjs";
import ButtonOpenSheetViewModel from "./button-open-sheet/button-open-sheet-viewmodel.mjs";
import ButtonToggleViewModel from "./button-toggle/button-toggle-viewmodel.mjs";
import ButtonRollViewModel from "./button-roll/button-roll-viewmodel.mjs";
import ButtonSendToChatViewModel from "./button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonTakeItemViewModel from "./button-take-item/button-take-item-viewmodel.mjs";
import ButtonToggleVisibilityViewModel from "./button-toggle-visibility/button-toggle-visibility-viewmodel.mjs";
import InputDropDownViewModel from "./input-dropdown/input-dropdown-viewmodel.mjs";
import InputImageViewModel from "./input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "./input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "./input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import InputTextareaViewModel from "./input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "./input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "./viewmodel.mjs";

/**
 * This view model sub-type is intended for use with sheets that expect the common flags, 
 * like 'isEditable' or 'isSendable'. 
 * @extends ViewModel
 */
export default class SheetViewModel extends ViewModel {
  /**
   * @type {Boolean}
   * @private
   */
  _isEditable = false;
  /**
   * If true, the sheet is editable. 
   * @type {Boolean}
   * @readonly
   */
  get isEditable() { return this._isEditable; }
  
  /**
   * @type {Boolean}
   * @private
   */
  _isSendable = false;
  /**
   * If true, the document represented by the sheet can be sent to chat. 
   * @type {Boolean}
   * @readonly
   */
  get isSendable() { return this._isSendable; }

  /**
   * @type {Boolean}
   * @private
   */
  _isOwner = false;
  /**
   * If true, the current user is the owner of the represented document. 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return this._isOwner; }
  
  /**
   * @type {Boolean}
   * @private
   */
  _isGM = false;
  /**
   * If true, the current user is a GM. 
   * @type {Boolean}
   * @readonly
   */
  get isGM() { return this._isGM; }

  /**
   * Name or path of a contextual template, which will be displayed in exception log entries, to aid debugging. 
   * @type {String | undefined}
   * @readonly
   */
  contextTemplate = undefined;

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   */
  constructor(args = {}) {
    super(args);

    this._isEditable = args.isEditable ?? false;
    this._isSendable = args.isSendable ?? false;
    this._isOwner = args.isOwner ?? false;
    this._isGM = args.isGM ?? false;
    this._contextTemplate = args.contextTemplate;
  }

  /**
   * Creates a child text field view model and returns it. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String | undefined} args.id
   * @param {Boolean | undefined} args.isEditable
   * @param {String | undefined} args.placeholder
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {InputTextFieldViewModel}
   */
  createVmTextField(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputTextFieldViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      id: args.id,
      placeholder: args.placeholder,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child drop down view model and returns it. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Array<ChoiceOption>} args.options
   * @param {String | undefined} args.id
   * @param {Boolean | undefined} args.isEditable
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {InputDropDownViewModel}
   */
  createVmDropDown(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath", "options"]);

    return new InputDropDownViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      options: args.options,
      id: args.id,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child number spinner view model and returns it. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String | undefined} args.id
   * @param {Boolean | undefined} args.isEditable
   * @param {Number | undefined} args.min
   * @param {Number | undefined} args.max
   * @param {Number | undefined} args.step
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {InputNumberSpinnerViewModel}
   */
  createVmNumberSpinner(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputNumberSpinnerViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      id: args.id,
      min: args.min,
      max: args.max,
      step: args.step,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child radio button group view model and returns it. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Array<ChoiceOption>} args.options
   * @param {String | undefined} args.id
   * @param {Boolean | undefined} args.isEditable
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {InputRadioButtonGroupViewModel}
   */
  createVmRadioButtonGroup(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath", "options"]);

    return new InputRadioButtonGroupViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      options: args.options,
      id: args.id,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child text area view model and returns it. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String | undefined} args.id
   * @param {Boolean | undefined} args.isEditable
   * @param {Boolean | undefined} args.allowResize 
   * @param {Boolean | undefined} args.spellcheck 
   * @param {String | undefined} args.placeholder 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {InputTextareaViewModel}
   */
  createVmTextArea(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputTextareaViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      id: args.id,
      allowResize: args.allowResize,
      spellcheck: args.spellcheck,
      placeholder: args.placeholder,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button add view model and returns it. 
   * @param {Object} args.target The target object to affect.  
   * @param {String} args.creationType = "skill"|"skill-ability"|"fate-card"|"item"|"injury"|"illness"
   * @param {String | undefined} args.id
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   * @param {Object | String | undefined} args.creationData Data to pass to the item creation function. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonAddViewModel}
   */
  createVmBtnAdd(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "creationType"]);

    return new ButtonAddViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      target: args.target,
      creationType: args.creationType,
      id: args.id,
      callback: args.callback,
      callbackData: args.callbackData,
      withDialog: args.withDialog,
      creationData: args.creationData,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button delete view model and returns it. 
   * @param {Object} args.target The target object to affect.  
   * @param {String | undefined} args.id
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   * @param {String | undefined} args.propertyPath If not undefined, will try to delete by this property path. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonDeleteViewModel}
   */
  createVmBtnDelete(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target"]);

    return new ButtonDeleteViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      target: args.target,
      id: args.id,
      callback: args.callback,
      callbackData: args.callbackData,
      withDialog: args.withDialog,
      propertyPath: args.propertyPath,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button open sheet view model and returns it. 
   * @param {Object} args.target The target object to affect.  
   * @param {String | undefined} args.id
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Defines any data to pass to the completion callback. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonOpenSheetViewModel}
   */
  createVmBtnOpenSheet(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target"]);

    return new ButtonOpenSheetViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      target: args.target,
      id: args.id,
      callback: args.callback,
      callbackData: args.callbackData,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button roll view model and returns it. 
   * @param {Object} args.target The target object to affect.  
   * @param {String | undefined} args.propertyPath Optional. Property path identifying a property that contains a roll-formula. 
   * IMPORTANT: If this argument is left undefined, then the target object MUST define a method 'getRollData()', which returns a {SummedData} instance. 
   * @param {CONFIG.rollTypes} args.rollType Determines the kind of roll to try and make. 
   * @param {String | undefined} args.id
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Defines any data to pass to the completion callback. 
   * @param {String | undefined} args.chatTitle Title to display above the roll result in the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the roll result. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonRollViewModel}
   */
  createVmBtnRoll(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "rollType"]);

    return new ButtonRollViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      target: args.target,
      propertyPath: args.propertyPath,
      rollType: args.rollType,
      id: args.id,
      callback: args.callback,
      callbackData: args.callbackData,
      chatTitle: args.chatTitle,
      actor: args.actor,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button send to chat view model and returns it. 
   * @param {Object} args.target The target object to affect.  
   * @param {String | undefined} args.id
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Defines any data to pass to the completion callback. 
   * @param {String | undefined} args.propertyPath Property path identifying a property to send to chat. 
   * @param {String | undefined} args.chatTitle Title to display above the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the chat message. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonSendToChatViewModel}
   */
  createVmBtnSendToChat(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target"]);

    return new ButtonSendToChatViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      target: args.target,
      id: args.id,
      callback: args.callback,
      callbackData: args.callbackData,
      propertyPath: args.propertyPath,
      chatTitle: args.chatTitle,
      actor: args.actor,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button send to chat view model and returns it. 
   * @param {Object} args.target The target object to affect.  
   * @param {String | undefined} args.id
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Defines any data to pass to the completion callback. 
   * @param {contextTypes} contextType
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonTakeItemViewModel}
   */
  createVmBtnTakeItem(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "contextType"]);

    return new ButtonTakeItemViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      target: args.target,
      id: args.id,
      callback: args.callback,
      callbackData: args.callbackData,
      contextType: args.contextType,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child button send to chat view model and returns it. 
   * @param {String} args.visGroup Id or name to group the visiblity of elements by. 
   * @param {String | undefined} args.id
   * @param {Object | undefined} args.target Optional. The target object to affect.  
   * @param {Function | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * Expects this id to be defined as a data-attribute. 
   * E. g. '\<div data-vis-group="1A2b3F4E"\>My content\</div\>'
   * @param {Boolean | undefined} args.toggleSelf Optional. If true, the button will also toggle visibility on itself. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonToggleVisibilityViewModel}
   */
  createVmBtnToggleVisibility(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["visGroup"]);

    return new ButtonToggleVisibilityViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      visGroup: args.visGroup,
      id: args.id,
      target: args.target,
      callback: args.callback,
      callbackData: args.callbackData,
      toggleSelf: args.toggleSelf,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a child image input view model and returns it. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String | undefined} args.id
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @param {Number | undefined} args.width Optional. Sets the width of the image DOM element. Default '26'. 
   * @param {Number | undefined} args.height Optional. Sets the height of the image DOM element. Default '26'. 
   * @returns {InputImageViewModel}
   */
  createVmImg(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputImageViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      id: args.id,
      localizableTitle: args.localizableTitle,
      width: args.width,
      height: args.height,
    });
  }

  /**
   * Creates a child toggle button view model and returns it. 
   * @param {Object} args.target
   * @param {String} args.propertyPath
   * @param {String | undefined} args.id
   * @param {Boolean | undefined} args.isEditable
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @returns {ButtonToggleViewModel}
   */
  createVmBtnToggle(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "propertyPath"]);

    return new ButtonToggleViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
      target: args.target,
      propertyPath: args.propertyPath,
      id: args.id,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Disposes of any working data. 
   * 
   * This is a clean-up operation that should only be called when the instance of this class is no longer needed!
   * @override
   */
  dispose() {
    this.createVmTextField = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmDropDown = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmNumberSpinner = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmRadioButtonGroup = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmTextArea = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnAdd = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnDelete = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnOpenSheet = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnRoll = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnSendToChat = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnTakeItem = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnToggleVisibility = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmImg = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };
    this.createVmBtnToggle = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION };

    super.dispose();
  }
}
