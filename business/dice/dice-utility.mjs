import { SOUNDS_CONSTANTS } from "../../presentation/audio/sounds.mjs";
import * as ChatUtil from "../../presentation/chat/chat-utility.mjs";
import { VISIBILITY_MODES } from "../../presentation/chat/visibility-modes.mjs";
import { TEMPLATES } from "../../presentation/templatePreloader.mjs";
import Ruleset from "../ruleset/ruleset.mjs";
import * as ValidationUtil from "../util/validation-utility.mjs";
import { DiceOutcomeTypes } from "./dice-outcome-types.mjs";
import DicePoolResult from "./dice-pool-result.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";

/**
 * Localization key of the obstacle abbreviation. 
 * 
 * @type {String}
 * @constant
 */
const LOCALIZABLE_OBSTACLE_ABBREVIATION = "ambersteel.roll.obstacle.abbreviation";

/**
 * CSS class of a positive die result. 
 * 
 * @type {String}
 * @constant
 */
const CSS_CLASS_POSITIVE = "roll-success";

/**
 * CSS class of a negative die result. 
 * 
 * @type {String}
 * @constant
 */
const CSS_CLASS_NEGATIVE = "roll-failure";

/**
 * CSS class of the obstacle value. 
 * 
 * @type {String}
 * @constant
 */
const CSS_CLASS_OBSTACLE = "roll-obstacle";

/**
 * Rolls the given number of dice and returns the results of the roll. 
 * 
 * @param {Object | undefined} ops Options argument.
 * @param {Number | undefined} ops.numberOfDice The number of dice to roll. 
 * * Default `0`
 * @param {Number | undefined} ops.obstacle The obstacle to roll against. 
 * * Default `0`
 * @param {Number | undefined} ops.bonusDice An additional number of dice to roll. 
 * * Default `0`
 * @param {RollDiceModifierType | undefined} ops.diceModifier A dice number modifier. 
 * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
 * 
 * @returns {DicePoolResult} The results of the roll
 */
export function rollDicePool(ops = {}) {
  let numberOfDice = ops.numberOfDice ?? 0;
  const obstacle = ops.obstacle ?? 0;
  const bonusDice = ops.bonusDice ?? 0;
  const diceModifier = ops.diceModifier ?? ROLL_DICE_MODIFIER_TYPES.NONE;

  // Get modified number of dice to roll. 

  if (diceModifier.name === ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_DOWN.name) {
    numberOfDice = parseInt(Math.floor(numberOfDice / 2.0));
  } else if (diceModifier.name === ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_UP.name) {
    numberOfDice = parseInt(Math.ceil(numberOfDice / 2.0));
  }

  numberOfDice += bonusDice;

  // Early exit if no dice to roll. 
  if (numberOfDice <= 0) {
    return new DicePoolResult({
      numberOfDice: numberOfDice,
      obstacle: obstacle,
      bonusDice: bonusDice,
    });
  }

  // Make the roll. 
  const results = new Die({ faces: 6, number: numberOfDice }).evaluate().results;

  // Analyze results. 
  const ruleset = new Ruleset();

  const positives = [];
  const negatives = [];

  for (const result of results) {
    const face = result.result;
    if (ruleset.isPositive(face)) {
      positives.push(face);
    } else {
      negatives.push(face);
    }
  }
  
  // Determine outcome type and degree of success/failure. 
  let outcomeType = undefined;
  let degree = 0;
  if (obstacle <= 0) { // Ob 0 test?
    outcomeType = DiceOutcomeTypes.NONE;
  } else if (positives.length >= obstacle) { // Complete success
    outcomeType = DiceOutcomeTypes.SUCCESS;
    degree = positives.length - obstacle;
  } else if (positives.length > 0) { // Partial failure
    outcomeType = DiceOutcomeTypes.PARTIAL;
    degree = negatives.length - obstacle;
  } else {
    outcomeType = DiceOutcomeTypes.FAILURE;
  }

  return new DicePoolResult({
    numberOfDice: numberOfDice,
    obstacle: obstacle,
    positives: positives,
    negatives: negatives,
    outcomeType: outcomeType,
    degree: degree,
    bonusDice: bonusDice,
  });
}

/**
 * Creates a new ChatMessage to display dice roll results. 
 * 
 * @param {DicePoolResult} args.rollResult The results of a dice pool roll. 
 * @param {String | undefined} args.flavor Optional. The flavor text / subtitle of the message. 
 * @param {String | undefined} args.actor Optional. The actor to associate with the message. 
 * @param {String | undefined} args.primaryTitle Optional. A primary title. 
 * @param {String | undefined} args.primaryImage Optional. An image url for the primary title. 
 * @param {String | undefined} args.secondaryTitle Optional. A secondary title. 
 * @param {String | undefined} args.secondaryImage Optional. An image url for the secondary title. 
 * @param {VisibilityMode | undefined} args.visibilityMode Optional. Sets the visibility of the chat message. 
 * * Default `VISIBILITY_MODES.public`. 
 * @param {String | undefined} args.diceComposition Optional. A localized string showing the composition of dice. 
 * @param {Boolean | undefined} args.showBackFire Optional. If true, will show the spell-backfire label.
 * 
 * @returns {Promise<any>}
 * 
 * @async
 */
export async function sendDiceResultToChat(args = {}) {
  args = {
    visibilityMode: VISIBILITY_MODES.public,
    ...args
  };
  ValidationUtil.validateOrThrow(args, ["rollResult"]);

  const ruleset = new Ruleset();

  // Convenience variable. 
  const rollResult = args.rollResult;

  const combinedResults = rollResult.positives.concat(rollResult.negatives);
  // This holds the results to display in the rendered template, including the obstacle value. 
  const resultsForDisplay = [];
  for (const face of combinedResults) {
    if (ruleset.isPositive(face)) {
      resultsForDisplay.push({ cssClass: CSS_CLASS_POSITIVE, content: face });
    } else {
      resultsForDisplay.push({ cssClass: CSS_CLASS_NEGATIVE, content: face });
    }
  }
  // Insert obstacle threshold. 
  const obstacleForDisplay = { cssClass: CSS_CLASS_OBSTACLE, content: `${game.i18n.localize(LOCALIZABLE_OBSTACLE_ABBREVIATION)} ${rollResult.obstacle}` }
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
    primaryTitle: args.primaryTitle,
    primaryImage: args.primaryImage,
    secondaryTitle: args.secondaryTitle,
    secondaryImage: args.secondaryImage,
    showBackFire: args.showBackFire,
  });

  return ChatUtil.sendToChat({
    renderedContent: renderedContent,
    flavor: args.flavor,
    actor: args.actor,
    sound: SOUNDS_CONSTANTS.DICE_ROLL,
    visibilityMode: args.visibilityMode
  });
}
