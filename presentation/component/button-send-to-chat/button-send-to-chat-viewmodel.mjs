import { TEMPLATES } from "../../template/templatePreloader.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
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
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * 
   * @param {String | undefined} args.propertyPath Optional. Property path identifying a property to send to chat. 
   * @param {String | undefined} args.chatTitle Optional. Title to display above the chat message. 
   * @param {Actor | undefined} args.actor Optional. Actor associated with the chat message. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target"]);

    this._propertyPath = args.propertyPath;
    this._chatTitle = args.chatTitle ?? "";
    this._actor = args.actor;
    this.localizableTitle = args.localizableTitle ?? "ambersteel.general.sendToChat";
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    const dialogResult = await ChatUtil.queryVisibilityMode();
    if (!dialogResult.confirmed) return;
    
    if (this.propertyPath !== undefined) {
      if (this.target.sendPropertyToChat !== undefined) {
        this.target.sendPropertyToChat(this.propertyPath, dialogResult.visibilityMode);
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

Handlebars.registerPartial('buttonSendToChat', `{{> "${ButtonSendToChatViewModel.TEMPLATE}"}}`);
