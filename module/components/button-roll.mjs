import * as Dice from '../utils/dice-utility.mjs';
import * as ChatUtil from '../utils/chat-utility.mjs';
import { DICE_ROLL_SOUND } from '../utils/dice-utility.mjs';
import { queryVisibilityMode } from '../utils/chat-utility.mjs';

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

  // Generic roll. 
  html.find(".ambersteel-generic-roll").click(_onGenericRoll.bind(ownerSheet));

  // Dice-pool roll.
  html.find(".ambersteel-dice-pool-roll").click(_onDicePoolRoll.bind(ownerSheet));

  // -------------------------------------------------------------
  if (!isEditable) return;
}

/**
 * @param {Event} event 
 * @private
 * @async
 */
async function _onGenericRoll(event) {
  event.preventDefault();

  const dialogResult = await queryVisibilityMode();
  if (!dialogResult.confirmed) return;
  
  const dataset = event.currentTarget.element.dataset;
  const propertyValue = this.getNestedPropertyValue(dataset.propertyPath);

  // Do roll. 
  const roll = new Roll(propertyValue);
  const rollResult = await roll.evaluate({ async: true });

  // Display roll result. 
  const renderedContent = await roll.render();
  await ChatUtil.sendToChat({
    renderedContent: renderedContent,
    flavor: dataset.chatTitle,
    actor: this.getActor(),
    sound: DICE_ROLL_SOUND,
    visibilityMode: dialogResult.visibilityMode
  });

  // Invoke callback. 
  if (dataset.callback) {
    this[dataset.callback](rollResult, dataset.callbackData);
  }
}

/**
 * @param {Event} event 
 * @private
 * @async
 */
async function _onDicePoolRoll(event) {
  event.preventDefault();

  const dialogResult = await Dice.queryRollData();
  if (!dialogResult.confirmed) return;
  
  const dataset = event.currentTarget.element.dataset;
  const propertyValue = this.getNestedPropertyValue(dataset.propertyPath);

  // Do roll. 
  const rollResult = await Dice.rollDicePool({
    numberOfDice: propertyValue, 
    obstacle: dialogResult.obstacle,
    bonusDice: dialogResult.bonusDice,
  });

  // Display roll result. 
  await Dice.sendDiceResultToChat({
    rollResult: rollResult, 
    flavor: dataset.chatTitle, 
    actor: this.getActor(),
    visibilityMode: dialogResult.visibilityMode
  });

  // Invoke callback. 
  if (dataset.callback) {
    this[dataset.callback](rollResult, dataset.callbackData);
  }
}