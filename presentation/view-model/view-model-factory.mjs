import { validateOrThrow } from "../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../component/button-add/button-add-viewmodel.mjs"
import ButtonContextMenuViewModel from "../component/button-context-menu/button-context-menu-viewmodel.mjs"
import ButtonDeleteViewModel from "../component/button-delete/button-delete-viewmodel.mjs"
import ButtonOpenSheetViewModel from "../component/button-open-sheet/button-open-sheet-viewmodel.mjs"
import ButtonRollViewModel from "../component/button-roll/button-roll-viewmodel.mjs"
import ButtonSendToChatViewModel from "../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs"
import ButtonTakeItemViewModel from "../component/button-take-item/button-take-item-viewmodel.mjs"
import ButtonToggleVisibilityViewModel from "../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"

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
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * @param {String | undefined} args.localizedLabel 
   * @param {String | undefined} args.localizedType Localized name of the type of thing to add. 
   * 
   * @returns {ButtonAddViewModel}
   */
  createVmBtnAdd(args = {}) {
    validateOrThrow(args, ["target", "creationType"]);

    return new ButtonAddViewModel({
      ...this._getBaseArguments(args),
      target: args.target,
      creationType: args.creationType,
      callback: args.callback,
      withDialog: args.withDialog,
      creationData: args.creationData,
      localizedTooltip: args.localizedTooltip,
      localizedText: args.localizedLabel,
      localizedType: args.localizedType,
    });
  }
}
