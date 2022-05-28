import { getElementValue } from "./sheet-utility.mjs";
import * as ChatUtil from "./chat-utility.mjs";
import { showDialog } from './dialog-utility.mjs';
import { validateOrThrow } from "./validation-utility.mjs";
import DicePoolResult from "../dto/dice-pool-result.mjs";
import RollDataQueryDialogResult from "../dto/roll-query-dialog-result.mjs";
import { TEMPLATES } from "../templatePreloader.mjs";
import { DiceOutcomeTypes } from "../dto/dice-outcome-types.mjs";

export const DICE_ROLL_SOUND = "../sounds/dice.wav";

export const LOCALIZABLE_OBSTACLE_ABBREVIATION = "ambersteel.roll.obstacleAbbreviation";

/**
 * Rolls the given number of dice and returns the results of the roll. 
 * @param {Number} ops.numberOfDice The number of dice to roll. 
 * @param {Number} ops.obstacle The obstacle to roll against. 
 * @param {Number} ops.bonusDice An additional number of dice to roll. 
 * @returns {DicePoolResult} The results of the roll
 */
export function rollDicePool(ops = {}) {
  ops = {
    numberOfDice: 0,
    obstacle: 0,
    bonusDice: 0,
    ...ops
  };
  validateOrThrow(ops, ["numberOfDice", "obstacle", "bonusDice"]);

  // Get number of dice to roll. 
  const numberOfDice = ops.numberOfDice + ops.bonusDice;

  // Early exit if no dice to roll. 
  if (numberOfDice <= 0) {
    return new DicePoolResult({
      numberOfDice: numberOfDice,
      obstacle: ops.obstacle,
      bonusDice: ops.bonusDice,
    });
  }

  // Make the roll. 
  const results = new Die({ faces: 6, number: numberOfDice }).evaluate().results;

  // Analyze results. 
  const positives = [];
  const negatives = [];
  for (const result of results) {
    const face = result.result;
    if (game.ambersteel.isPositive(face)) {
      positives.push(face);
    } else {
      negatives.push(face);
    }
  }
  
  // Determine outcome type and degree of success/failure. 
  let outcomeType = undefined;
  let degree = 0;
  if (ops.obstacle <= 0) { // Ob 0 test?
    outcomeType = DiceOutcomeTypes.NONE;
  } else if (positives.length >= ops.obstacle) { // Complete success
    outcomeType = DiceOutcomeTypes.SUCCESS;
    degree = positives.length - ops.obstacle;
  } else if (positives.length >= 0) { // Partial failure
    outcomeType = DiceOutcomeTypes.PARTIAL;
    degree = negatives.length - ops.obstacle;
  } else {
    outcomeType = DiceOutcomeTypes.FAILURE;
  }

  return new DicePoolResult({
    numberOfDice: numberOfDice,
    obstacle: ops.obstacle,
    positives: positives,
    negatives: negatives,
    outcomeType: outcomeType,
    degree: degree,
    bonusDice: ops.bonusDice,
  });
}

/**
 * Creates a new ChatMessage to display dice roll results. 
 * @param {DicePoolResult} args.rollResult The results of a dice pool roll. 
 * @param {String | undefined} args.flavor Optional. The flavor text / subtitle of the message. 
 * @param {String | undefined} args.actor Optional. The actor to associate with the message. 
 * @param {String | undefined} args.title Optional. A title for the message. 
 * @param {CONFIG.ambersteel.visibilityModes | undefined} args.visibilityMode Optional. Sets the visibility of the chat message. Default public. 
 * @param {String | undefined} args.diceComposition Optional. A localized string showing the composition of dice. 
 * @returns {Promise<any>}
 * @async
 */
export async function sendDiceResultToChat(args = {}) {
  args = {
    rollResult: undefined,
    flavor: undefined,
    actor: undefined,
    visibilityMode: CONFIG.ambersteel.visibilityModes.public,
    diceComposition: undefined,
    title: undefined,
    ...args
  };
  validateOrThrow(args, ["rollResult"]);

  // Convenience variable. 
  const rollResult = args.rollResult;

  const combinedResults = rollResult.positives.concat(rollResult.negatives);
  // This holds the results to display in the rendered template, including the obstacle value. 
  const resultsForDisplay = [];
  for (const face of combinedResults) {
    if (game.ambersteel.isPositive(face)) {
      resultsForDisplay.push({ cssClass: "roll-success", content: face });
    } else {
      resultsForDisplay.push({ cssClass: "roll-failure", content: face });
    }
  }
  // Insert obstacle threshold. 
  const obstacleForDisplay = { cssClass: "roll-obstacle", content: `${game.i18n.localize(LOCALIZABLE_OBSTACLE_ABBREVIATION)} ${rollResult.obstacle}` }
  if (rollResult.obstacle >= resultsForDisplay.length) { // Obstacle greater than number of dice rolled. 
    resultsForDisplay.push(obstacleForDisplay);
  } else { // Obstacle less than or equal to number of dice rolled. 
    resultsForDisplay.splice(rollResult.obstacle, 0, obstacleForDisplay);
  }

  // Render the results. 
  const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_CHAT_MESSAGE, {
    ...rollResult,
    resultsForDisplay: resultsForDisplay,
    diceComposition: args.diceComposition,
    title: args.title,
  });

  return ChatUtil.sendToChat({
    renderedContent: renderedContent,
    flavor: args.flavor,
    actor: args.actor,
    sound: DICE_ROLL_SOUND,
    visibilityMode: args.visibilityMode
  });
}

/**
 * Shows a dialog to the user to enter an obstacle and bonus dice number. 
 * @returns {Promise<any>} Resolves, when the dialog is closed. 
 * @async
 */
export async function queryRollData() {
  const visibilityModes = ChatUtil.getVisibilityModes(CONFIG);

  const dialogData = {
    obstacle: 0,
    bonusDice: 0,
    visibilityMode: visibilityModes[0],
    visibilityModes: visibilityModes,
  };

  return new Promise(async (resolve, reject) => {
    const result = await showDialog({ dialogTemplate: TEMPLATES.DIALOG_ROLL, localizableTitle: "ambersteel.dialog.titleRollQuery" }, dialogData);
    
    const obstacle = parseInt(getElementValue(result.html.find(".obstacle")[0]));
    const bonusDice = parseInt(getElementValue(result.html.find(".bonus-dice")[0]));

    const visibilityModeKey = parseInt(getElementValue(result.html.find(".visibilityMode")[0]));
    const visibilityMode = visibilityModes[visibilityModeKey];

    resolve(new RollDataQueryDialogResult({
      obstacle: obstacle,
      bonusDice: bonusDice,
      visibilityMode: visibilityMode,
      confirmed: result.confirmed
    }));
  });
}