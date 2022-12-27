import { TEMPLATES } from "../../template/templatePreloader.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import VisibilitySingleChoiceDialog from "../../dialog/visibility-single-choice-dialog/visibility-single-choice-dialog.mjs";

/**
 * A button that allows sending a document or one of its properties to the chat. 
 * 
 * @extends ButtonViewModel
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
   * @param {TransientDocument | Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
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

    const thiz = this;

    await new VisibilitySingleChoiceDialog({
      closeCallback: (dialog) => {
        if (dialog.confirmed !== true) return;
        const visibilityMode = dialog.visibilityMode;
        
        if (thiz.propertyPath !== undefined) {
          if (thiz.target.sendPropertyToChat !== undefined) {
            thiz.target.sendPropertyToChat(thiz.propertyPath, visibilityMode);
          } else {
            ChatUtil.sendPropertyToChat({
              obj: thiz.target,
              propertyPath: thiz.propertyPath,
              parent: thiz.target,
              actor: thiz.actor,
              visibilityMode: visibilityMode
            });
          }
        } else {
          if (thiz.target.sendToChat !== undefined) {
            thiz.target.sendToChat(visibilityMode);
          } else {
            ChatUtil.sendPropertyToChat({
              obj: thiz.target,
              propertyPath: thiz.propertyPath,
              parent: thiz.target,
              actor: thiz.actor,
              visibilityMode: visibilityMode
            });
          }
        }
      },
    }).renderAndAwait(true);
  }
}

Handlebars.registerPartial('buttonSendToChat', `{{> "${ButtonSendToChatViewModel.TEMPLATE}"}}`);
