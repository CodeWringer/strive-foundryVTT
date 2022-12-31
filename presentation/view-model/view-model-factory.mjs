import { validateOrThrow } from "../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../component/button-add/button-add-viewmodel.mjs"
import ButtonContextMenuViewModel from "../component/button-context-menu/button-context-menu-viewmodel.mjs"
import ButtonDeleteViewModel from "../component/button-delete/button-delete-viewmodel.mjs"
import ButtonOpenSheetViewModel from "../component/button-open-sheet/button-open-sheet-viewmodel.mjs"
import ButtonRollViewModel from "../component/button-roll/button-roll-viewmodel.mjs"
import ButtonSendToChatViewModel from "../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs"
import ButtonTakeItemViewModel from "../component/button-take-item/button-take-item-viewmodel.mjs"
import ButtonToggleVisibilityViewModel from "../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"
import ButtonToggleViewModel from "../component/button-toggle/button-toggle-viewmodel.mjs"
import InputDropDownViewModel from "../component/input-dropdown/input-dropdown-viewmodel.mjs"
import InputImageViewModel from "../component/input-image/input-image-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputRadioButtonGroupViewModel from "../component/input-radio-button-group/input-radio-button-group-viewmodel.mjs"
import InputRichTextViewModel from "../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTextareaViewModel from "../component/input-textarea/input-textarea-viewmodel.mjs"
import InputTextFieldViewModel from "../component/input-textfield/input-textfield-viewmodel.mjs"

/**
 * @summary
 * This view model factory is useful for instantiating view models, without the need to handle module imports 
 * and with less boilerplate-y code to write. 
 * 
 * @description
 * This factory is mostly useful for providing view model instances of commonly re-used components. 
 * 
 * Specialized view models are not offered for instantiation by this factory. While it would be 
 * technically correct to offer _all_ view model types here, this approach was deemed unnecessary. 
 * Those highly specialized view models are often only instantiated in one place, on their immediate 
 * parent view model. Examples would be all the actor sheet "parts", which are only ever needed as 
 * children of an actor sheet view model instance. 
 */
export default class ViewModelFactory {
  /**
   * Returns an arguments object based on the given arguments object. 
   * 
   * The given values are preferred over the given parent's values. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * * Default `false`. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * * Default `false`. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * 
   * @returns {Object}
   * 
   * @private
   */
  _getBaseArguments(args) {
    return {
      parent: args.parent,
      id: args.id,
      isEditable: args.isEditable ?? (args.parent === undefined ? false : args.parent.isEditable),
      isSendable: args.isSendable ?? (args.parent === undefined ? false : args.parent.isSendable),
      isOwner: args.isOwner ?? (args.parent === undefined ? false : args.parent.isOwner),
      isGM: args.isGM ?? (args.parent === undefined ? false : args.parent.isGM),
      contextTemplate: args.contextTemplate ?? (args.parent === undefined ? undefined : args.parent.contextTemplate),
    };
  }

  /**
   * Creates a text field view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String | undefined} args.placeholder
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {InputTextFieldViewModel}
   */
  createVmTextField(args = {}) {
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputTextFieldViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      placeholder: args.placeholder,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a drop down view model and returns it.
   *  
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Array<ChoiceOption>} args.options
   * @param {ChoiceAdapter} args.adapter
   * @param {Boolean | undefined} args.isEditable
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {InputDropDownViewModel}
   */
  createVmDropDown(args = {}) {
    validateOrThrow(args, ["propertyOwner", "propertyPath", "options"]);

    return new InputDropDownViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      options: args.options,
      adapter: args.adapter,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a number spinner view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Number | undefined} args.min
   * @param {Number | undefined} args.max
   * @param {Number | undefined} args.step
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {InputNumberSpinnerViewModel}
   */
  createVmNumberSpinner(args = {}) {
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputNumberSpinnerViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      min: args.min,
      max: args.max,
      step: args.step,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a radio button group view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Array<ChoiceOption>} args.options
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {InputRadioButtonGroupViewModel}
   */
  createVmRadioButtonGroup(args = {}) {
    validateOrThrow(args, ["propertyOwner", "propertyPath", "options"]);

    return new InputRadioButtonGroupViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      options: args.options,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a text area view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Boolean | undefined} args.spellcheck 
   * @param {String | undefined} args.placeholder 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {InputTextareaViewModel}
   */
  createVmTextArea(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputTextareaViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      spellcheck: args.spellcheck,
      placeholder: args.placeholder,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a button add view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target The target object to affect.  
   * @param {String} args.creationType = "skill"|"skill-ability"|"fate-card"|"item"|"injury"|"illness"
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   * @param {Object | String | undefined} args.creationData Data to pass to the item creation function. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @param {String | undefined} args.localizableLabel Optional. The localizable label. 
   * @param {String | undefined} args.localizableType Localization key of the type of thing to add. 
   * @param {String | undefined} args.localizableDialogTitle Localization key of the title of the dialog. 
   * 
   * @returns {ButtonAddViewModel}
   */
  createVmBtnAdd(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "creationType"]);

    return new ButtonAddViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      creationType: args.creationType,
      callback: args.callback,
      withDialog: args.withDialog,
      creationData: args.creationData,
      localizableTitle: args.localizableTitle,
      localizableLabel: args.localizableLabel,
      localizableType: args.localizableType,
      localizableDialogTitle: args.localizableDialogTitle,
    });
  }

  /**
   * Creates a button delete view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   * @param {String | undefined} args.propertyPath If not undefined, will try to delete by this property path. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonDeleteViewModel}
   */
  createVmBtnDelete(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target"]);

    return new ButtonDeleteViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      callback: args.callback,
      withDialog: args.withDialog,
      propertyPath: args.propertyPath,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a button open sheet view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonOpenSheetViewModel}
   */
  createVmBtnOpenSheet(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target"]);

    return new ButtonOpenSheetViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      callback: args.callback,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a button roll view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target The target object to affect.  
   * @param {String | undefined} args.propertyPath Optional. Property path identifying a property that contains a roll-formula. 
   * IMPORTANT: If this argument is left undefined, then the target object MUST define a method 'getRollData()', which returns a {SummedData} instance. 
   * @param {RollType} args.rollType Determines the kind of roll to try and make. 
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {String | undefined} args.primaryChatTitle Primary title to display above the roll result in the chat message. 
   * @param {String | undefined} args.primaryChatImage Primary image to display above the roll result in the chat message. 
   * @param {String | undefined} args.secondaryChatTitle Primary title to display above the roll result in the chat message. 
   * @param {String | undefined} args.secondaryChatImage Primary image to display above the roll result in the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the roll result. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonRollViewModel}
   */
  createVmBtnRoll(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "rollType"]);

    return new ButtonRollViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      propertyPath: args.propertyPath,
      rollType: args.rollType,
      callback: args.callback,
      primaryChatTitle: args.primaryChatTitle,
      primaryChatImage: args.primaryChatImage,
      secondaryChatTitle: args.secondaryChatTitle,
      secondaryChatImage: args.secondaryChatImage,
      actor: args.actor,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a button send to chat view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {String | undefined} args.propertyPath Property path identifying a property to send to chat. 
   * @param {String | undefined} args.chatTitle Title to display above the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the chat message. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonSendToChatViewModel}
   */
  createVmBtnSendToChat(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target"]);

    return new ButtonSendToChatViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      callback: args.callback,
      propertyPath: args.propertyPath,
      chatTitle: args.chatTitle,
      actor: args.actor,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a button send to chat view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {TAKE_ITEM_CONTEXT_TYPES} contextType
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonTakeItemViewModel}
   */
  createVmBtnTakeItem(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "contextType"]);

    return new ButtonTakeItemViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      callback: args.callback,
      contextType: args.contextType,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a button send to chat view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {String} args.visGroup Id or name to group the visiblity of elements by. 
   * @param {Object | undefined} args.target Optional. The target object to affect.  
   * @param {Function | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * Expects this id to be defined as a data-attribute. 
   * E. g. '\<div data-vis-group="1A2b3F4E"\>My content\</div\>'
   * @param {Boolean | undefined} args.toggleSelf Optional. If true, the button will also toggle visibility on itself. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonToggleVisibilityViewModel}
   */
  createVmBtnToggleVisibility(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["visGroup"]);

    return new ButtonToggleVisibilityViewModel({
      ...this._getBaseArguments(args),
      visGroup: args.visGroup,
      target: args.target,
      callback: args.callback,
      toggleSelf: args.toggleSelf,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a image input view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @param {Number | undefined} args.width Optional. Sets the width of the image DOM element. Default '26'. 
   * @param {Number | undefined} args.height Optional. Sets the height of the image DOM element. Default '26'. 
   * 
   * @returns {InputImageViewModel}
   */
  createVmImg(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputImageViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
      localizableTitle: args.localizableTitle,
      width: args.width,
      height: args.height,
    });
  }

  /**
   * Creates a toggle button view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.target
   * @param {String} args.propertyPath
   * @param {Boolean | undefined} args.isEditable
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * 
   * @returns {ButtonToggleViewModel}
   */
  createVmBtnToggle(args = {}) {
    const thiz = this;
    validateOrThrow(args, ["target", "propertyPath"]);

    return new ButtonToggleViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      propertyPath: args.propertyPath,
      localizableTitle: args.localizableTitle,
    });
  }

  /**
   * Creates a context menu button view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Boolean | undefined} args.isEditable
   * @param {Array<ContextMenuItem> | undefined} menuItems
   * 
   * @returns {ButtonContextMenuViewModel}
   */
  createVmBtnContextMenu(args = {}) {
    return new ButtonContextMenuViewModel({
      ...this._getBaseArguments(args),
      contextTemplate: args.contextTemplate ?? args.parent.contextTemplate,
      menuItems: args.menuItems,
    });
  }

  /**
   * Creates a rich text input view model and returns it. 
   * 
   * @param {ViewModel | undefined} args.parent Optional. A parent `ViewModel` instance. 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Boolean | undefined} args.isEditable
   * 
   * @returns {InputRichTextViewModel}
   */
  createVmRichText(args = {}) {
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    return new InputRichTextViewModel({
      ...this._getBaseArguments(args),
      propertyOwner: args.propertyOwner,
      propertyPath: args.propertyPath,
    });
  }
}
