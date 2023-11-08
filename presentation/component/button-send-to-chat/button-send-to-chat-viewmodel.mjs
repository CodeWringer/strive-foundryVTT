import { TEMPLATES } from "../../templatePreloader.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import VisibilitySingleChoiceDialog from "../../dialog/visibility-single-choice-dialog/visibility-single-choice-dialog.mjs";
import { VISIBILITY_MODES } from "../../chat/visibility-modes.mjs";

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
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonSendToChat', `{{> "${ButtonSendToChatViewModel.TEMPLATE}"}}`);
  }

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
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {TransientDocument | Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * 
   * @param {String | undefined} args.propertyPath Optional. Property path identifying a property to send to chat. 
   * @param {String | undefined} args.chatTitle Optional. Title to display above the chat message. 
   * @param {Actor | undefined} args.actor Optional. Actor associated with the chat message. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-comments"></i>',
    });
    validateOrThrow(args, ["target"]);

    this.target = args.target;
    this._propertyPath = args.propertyPath;
    this._chatTitle = args.chatTitle ?? "";
    this._actor = args.actor;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("ambersteel.general.sendToChat");
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick() {
    if (this.isEditable !== true) return;

    const thiz = this;

    await new VisibilitySingleChoiceDialog({
      closeCallback: (dialog) => {
        if (dialog.confirmed !== true) return;
        const visibilityModeChoice = dialog.visibilityMode;
        const visibilityMode = VISIBILITY_MODES.asArray().find(it => it.name === visibilityModeChoice.value);
        
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
