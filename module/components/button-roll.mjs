import * as Dice from '../utils/dice-utility.mjs';
import * as ChatUtil from '../utils/chat-utility.mjs';
import * as ComponentUtil from './component-utility.mjs';
import { DICE_ROLL_SOUND } from '../utils/dice-utility.mjs';
import { getNestedPropertyValue } from '../utils/property-utility.mjs';
import { queryVisibilityMode } from '../utils/chat-utility.mjs';

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param owner {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, owner, isOwner, isEditable) {
  // -------------------------------------------------------------
  if (!isOwner) return;

  // Generic roll. 
  html.find(".ambersteel-generic-roll").click(_onGenericRoll.bind(owner));

  // Dice-pool roll.
  html.find(".ambersteel-dice-pool-roll").click(_onDicePoolRoll.bind(owner));

  // -------------------------------------------------------------
  if (!isEditable) return;
}

function getDataSet(event) {
  const dataset = ComponentUtil.getDataSet(event);
  const propertyValue = getNestedPropertyValue(dataset.owner, dataset.property);
  return {
    ...dataset,
    propertyValue: propertyValue,
  }
}

/**
 * @param {Event} event 
 * @private
 * @async
 */
async function _onGenericRoll(event) {
  event.preventDefault();

  const dataset = getDataSet(event);
  
  const dialogResult = await queryVisibilityMode();
  if (dialogResult.confirmed) {
    // Do roll. 
    const roll = new Roll(dataset.propertyValue);
    const rollResult = await roll.evaluate({ async: true });

    // Display roll result. 
    const renderedContent = await roll.render();
    await ChatUtil.sendToChat({
      renderedContent: renderedContent,
      flavor: dataset.chatTitle,
      actor: dataset.actor,
      sound: DICE_ROLL_SOUND,
      visibilityMode: dialogResult.visibilityMode
    });

    // Invoke callback. 
    if (dataset.callback) {
      dataset.owner[dataset.callback](rollResult, dataset.callbackData);
    }
  }
}

/**
 * @param {Event} event 
 * @private
 * @async
 */
async function _onDicePoolRoll(event) {
  event.preventDefault();

  const dataset = getDataSet(event);
  
  // Modal dialog to enter obstacle and bonus dice. 
  const dialogResult = await Dice.queryRollData();
  if (dialogResult.confirmed) {
    // Do roll. 
    const rollResult = await Dice.rollDicePool({
      numberOfDice: dataset.propertyValue, 
      obstacle: dialogResult.obstacle,
      bonusDice: dialogResult.bonusDice,
    });

    // Display roll result. 
    await Dice.sendDiceResultToChat({
      rollResult: rollResult, 
      flavor: dataset.chatTitle, 
      actor: dataset.actor,
      visibilityMode: dialogResult.visibilityMode
    });

    // Invoke callback. 
    if (dataset.callback) {
      dataset.owner[dataset.callback](rollResult, dataset.callbackData);
    }
  }
}