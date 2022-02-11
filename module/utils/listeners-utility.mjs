import * as ButtonAdd from '../components/button-add.mjs';
import * as buttonDelete from '../components/button-delete.mjs';
import * as ButtonOpenSheet from '../components/button-open-sheet.mjs';
import * as ButtonRoll from '../components/button-roll.mjs';
import * as ButtonSendToChat from '../components/button-send-to-chat.mjs';
import * as ButtonTakeItem from '../components/button-take-item.mjs';
import * as ButtonToggleVisibility from '../components/button-toggle-visibility.mjs';
import * as ComponentInput from '../components/input.mjs';
import * as ComponentNumberSpinner from '../components/number-spinner.mjs';
import * as InputComponent from "../components/input-viewmodel.mjs";

/**
 * The global singleton that holds all the DOM event register functions. 
 * @private
 * @protected
 */
const listeners = [
  ButtonAdd.activateListeners,
  buttonDelete.activateListeners,
  ButtonOpenSheet.activateListeners,
  ButtonRoll.activateListeners,
  ButtonSendToChat.activateListeners,
  ButtonTakeItem.activateListeners,
  ButtonToggleVisibility.activateListeners,
  ComponentInput.activateListeners,
  ComponentNumberSpinner.activateListeners,
  InputComponent.activateListeners
];

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  for (const listener of listeners) {
    listener(html, ownerSheet, isOwner, isEditable);
  }
}