import { GameSystemActor } from "../../business/document/actor/actor.mjs";
import TransientDocument from "../../business/document/transient-document.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { ChatUtil } from "../chat/chat-utility.mjs";
import { VISIBILITY_MODES } from "../chat/visibility-modes.mjs";
import InputDropDownViewModel from "../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import DynamicInputDefinition from "../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";

export default class SendToChatHandler {
  /**
   * Prompt the user to select a visibility and then sends the `target` to chat. 
   * 
   * @param {Object} args
   * @param {TransientDocument} args.target
   * @param {String | undefined} args.dialogTitle
   * @param {String | undefined} args.propertyPath A property path on the `target` that is to be sent 
   * to chat, instead of `target` itself. 
   * @param {GameSystemActor | undefined} args.actor An actor to associate with the chat message. 
   * 
   * @async
   * @override
   */
  async prompt(args = {}) {
    ValidationUtil.validateOrThrow(args, ["target"]);

    const nameInputVisibility = "nameInputVisibility";

    const dialog = await new DynamicInputDialog({
      localizedTitle: game.i18n.localize(args.dialogTitle),
      inputDefinitions: [
        new DynamicInputDefinition({
          name: nameInputVisibility,
          localizedLabel: game.i18n.localize("system.general.messageVisibility.label"),
          template: InputDropDownViewModel.TEMPLATE,
          viewModelFactory: (id, parent) => new InputDropDownViewModel({
            id: id,
            parent: parent,
            options: VISIBILITY_MODES.asChoices(),
            value: VISIBILITY_MODES.asChoices().find(it => it.value === VISIBILITY_MODES.public.name),
          }),
        }),
      ],
    }).renderAndAwait(true);
    
    if (dialog.confirmed !== true) return;

    const visibilityMode = VISIBILITY_MODES.asArray().find(it => it.name === dialog[nameInputVisibility].value);
    
    if (args.propertyPath !== undefined) {
      if (args.target.sendPropertyToChat !== undefined) {
        args.target.sendPropertyToChat(args.propertyPath, visibilityMode);
      } else {
        ChatUtil.sendPropertyToChat({
          obj: args.target,
          propertyPath: args.propertyPath,
          parent: args.target,
          actor: args.actor,
          visibilityMode: visibilityMode
        });
      }
    } else {
      if (args.target.sendToChat !== undefined) {
        args.target.sendToChat(visibilityMode);
      } else {
        ChatUtil.sendPropertyToChat({
          obj: args.target,
          propertyPath: args.propertyPath,
          parent: args.target,
          actor: args.actor,
          visibilityMode: visibilityMode
        });
      }
    }
  }
}