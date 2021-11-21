import * as Dice from '../utils/dice-utility.mjs';
import * as ChatUtil from '../utils/chat-utility.mjs';
import { DICE_ROLL_SOUND } from '../utils/dice-utility.mjs';
import { queryRollData } from '../utils/dice-utility.mjs';

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  // -------------------------------------------------------------
  if (!isOwner) return;

  html.find(".ambersteel-roll").click(_onRoll.bind(ownerSheet));

  // -------------------------------------------------------------
  if (!isEditable) return;
}

/**
 * @param {Event} event 
 * @private
 * @async
 */
async function _onRoll(event) {
  event.preventDefault();

  const dialogResult = await queryRollData();
  if (!dialogResult.confirmed) return;
  
  const dataset = event.currentTarget.element.dataset;

  const who = dataset.itemId ? this.getItem(dataset.itemId) : this.getContextEntity();
  const propertyValue = who.getNestedPropertyValue(dataset.propertyPath);
  
  const actor = this.getActor();

  let rollResult = undefined;
  if (dataset.type === 'generic') {
    // Do roll. 
    const roll = new Roll(propertyValue);
    rollResult = await roll.evaluate({ async: true });
  
    // Display roll result. 
    const renderedContent = await roll.render();
    await ChatUtil.sendToChat({
      renderedContent: renderedContent,
      flavor: dataset.chatTitle,
      actor: actor,
      sound: DICE_ROLL_SOUND,
      visibilityMode: dialogResult.visibilityMode
    });
  } else if (dataset.type === 'dice-pool') {
    // Do roll. 
    rollResult = await Dice.rollDicePool({
      numberOfDice: parseInt(propertyValue), 
      obstacle: dialogResult.obstacle,
      bonusDice: dialogResult.bonusDice,
    });

    // Display roll result. 
    await Dice.sendDiceResultToChat({
      rollResult: rollResult,
      flavor: dataset.chatTitle,
      actor: actor,
      visibilityMode: dialogResult.visibilityMode
    });
  } else {
    throw `Unrecognized roll type '${dataset.type}'`;
  }

  // Invoke callback. 
  if (dataset.callback) {
    this[dataset.callback](rollResult, dataset.callbackData);
  }
}
