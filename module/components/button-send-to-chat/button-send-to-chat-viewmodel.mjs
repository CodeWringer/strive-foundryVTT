import { TEMPLATES } from "../../templatePreloader.mjs";
import * as ChatUtil from "../../utils/chat-utility.mjs";
import * as PropUtil from "../../utils/property-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from ButtonViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
 * 
 * --- Own properties
 * 
 * @property {String | undefined} propertyPath Property path identifying a property to send to chat. 
 * @property {String} chatTitle Title to display above the chat message. 
 * @property {Actor | undefined} actor Actor associated with the chat message. 
 */
export default class ButtonSendToChatViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_SEND_TO_CHAT; }

  /**
   * @type {String | undefined}
   * @private
   */
  _propertyPath = undefined;
  /**
   * @type {String | undefined}
   * @readonly
   */
  get propertyPath() { return this._propertyPath; }

  /**
   * @type {String}
   * @private
   */
  _chatTitle = undefined;
  /**
   * @type {String}
   * @readonly
   */
  get chatTitle() { return this._chatTitle; }

  /**
   * @type {Actor | undefined}
   * @private
   */
  _actor = undefined;
  /**
   * @type {Actor | undefined}
   * @readonly
   */
  get actor() { return this._actor; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any} args.callbackData Defines any data to pass to the completion callback. 
   * 
   * @param {String | undefined} args.propertyPath Property path identifying a property to send to chat. 
   * @param {String | undefined} args.chatTitle Title to display above the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the chat message. 
   */
  constructor(args = {}) {
    super(args);
    this._propertyPath = args.propertyPath;
    this._chatTitle = args.chatTitle ?? "";
    this._actor = args.actor;
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick() {
    const dialogResult = await ChatUtil.queryVisibilityMode();
    if (!dialogResult.confirmed) return;
    
    if (this.propertyPath !== undefined) {
      if (this.target.sendPropertyToChat !== undefined) {
        this.target.sendPropertyToChat(dataset.propertyPath, dialogResult.visibilityMode);
      } else {
        ChatUtil.sendPropertyToChat({
          obj: this.target,
          propertyPath: this.propertyPath,
          parent: this.target,
          actor: this.actor,
          visibilityMode: dialogResult.visibilityMode
        });
      }
    } else {
      if (this.target.sendToChat !== undefined) {
        this.target.sendToChat(dialogResult.visibilityMode);
      } else {
        ChatUtil.sendPropertyToChat({
          obj: this.target,
          propertyPath: this.propertyPath,
          parent: this.target,
          actor: this.actor,
          visibilityMode: dialogResult.visibilityMode
        });
      }
    }
  }
}

Handlebars.registerHelper('createButtonSendToChatViewModel', function(isEditable, target, propertyPath, chatTitle, actor, callback, callbackData) {
  const vm = new ButtonSendToChatViewModel({
    isEditable: isEditable,
    target: target,
    propertyPath: propertyPath,
    chatTitle: chatTitle,
    actor: actor,
    callback: callback,
    callbackData: callbackData,
  });
  
  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);
  
  return vm;
});
Handlebars.registerPartial('_buttonSendToChat', `{{#> "${ButtonSendToChatViewModel.TEMPLATE}"}}{{/"${ButtonSendToChatViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('buttonSendToChat', `{{> _buttonSendToChat vm=(createButtonSendToChatViewModel isEditable target propertyPath chatTitle actor callback callbackData) cssClass=(isDefined cssClass "") }}`);
