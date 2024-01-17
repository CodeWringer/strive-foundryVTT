import { SOUNDS_CONSTANTS } from "../../presentation/audio/sounds.mjs";
import { VISIBILITY_MODES, VisibilityMode } from "../../presentation/chat/visibility-modes.mjs";
import { TEMPLATES } from "../../presentation/templatePreloader.mjs";
import Ruleset from "../ruleset/ruleset.mjs";
import { Sum, SumComponent } from "../ruleset/summed-data.mjs";
import { validateOrThrow } from "../util/validation-utility.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import * as ChatUtil from "../../presentation/chat/chat-utility.mjs";
import * as ConstantsUtils from "../util/constants-utility.mjs";
import RollFormulaResolver, { EvaluatedRollFormula } from "./roll-formula-resolver.mjs";

/**
 * Represents a dice pool. 
 * 
 * @property {Array<SumComponent>} dice The dice composition for use in the roll. 
 * @property {Array<SumComponent>} bonus The bonus dice composition for use in the roll. 
 * @property {String} obstacle An obstacle formula. Supports complex formulae, e. g. 
 * `"3 D - 2 / @SI D4 + 2 D'`
 * * Default `"0"`
 * @property {RollDiceModifierType | undefined} modifier A dice number modifier. 
 * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
 */
export default class DicePool {
  /**
   * @param {Object} args The arguments object. 
   * @param {Array<SumComponent> | undefined} args.dice The dice composition for use in the roll. 
   * @param {Array<SumComponent> | undefined} args.bonus The bonus dice composition for use in the roll. 
   * @param {String} args.obstacle An obstacle formula. Supports complex formulae, e. g. 
   * `"3 D - 2 / @SI D4 + 2 D'`
   * * Default `"0"`
   * @param {RollDiceModifierType | undefined} args.modifier A dice number modifier. 
   * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
   */
  constructor(args = {}) {
    this.dice = args.dice ?? [];
    this.bonus = args.bonus ?? [];
    this.obstacle = args.obstacle ?? "0";
    this.modifier = args.modifier ?? ROLL_DICE_MODIFIER_TYPES.NONE;
  }

  /**
   * Rolls the current configuration of dice and returns the result. 
   * 
   * Calling this method again will produce different results every time. 
   * 
   * @returns {DicePoolRollResult}
   * 
   * @async
   */
  async roll() {
    // Determine the number of dice to roll with. 
    const diceSum = new Sum(this.dice);
    let modifiedDiceSum = diceSum.total;

    if (this.modifier.name === ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_DOWN.name) {
      modifiedDiceSum = parseInt(Math.floor(modifiedDiceSum / 2.0));
    } else if (this.modifier.name === ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_UP.name) {
      modifiedDiceSum = parseInt(Math.ceil(modifiedDiceSum / 2.0));
    }

    const bonusSum = new Sum(this.bonus);
    const totalNumberOfDice = modifiedDiceSum + bonusSum.total;
    const positives = [];
    const negatives = [];

    // Only try to do any rolls, if there are dice to roll. 
    if (totalNumberOfDice > 0) {
      // Let FoundryVTT make the roll. 
      const results = new Die({ faces: 6, number: totalNumberOfDice }).evaluate().results;

      // Analyze results. 
      const ruleset = new Ruleset();
      for (const result of results) {
        const face = result.result;
        if (ruleset.isPositive(face)) {
          positives.push(face);
        } else {
          negatives.push(face);
        }
      }
    }

    // Determine Ob
    const evaluatedObstacle = await new RollFormulaResolver({
      formula: this.obstacle,
    }).evaluate();
    const obstacle = parseInt(evaluatedObstacle.positiveTotal) + 1;

    // Determine outcome type and degree of success/failure. 
    let degree = 0;
    let outcomeType = DICE_POOL_RESULT_TYPES.NONE; // Ob 0 or invalid test. 
    if (positives.length >= obstacle) { // Complete success
      outcomeType = DICE_POOL_RESULT_TYPES.SUCCESS;
      degree = positives.length - obstacle;
    } else if (positives.length > 0) { // Partial failure
      outcomeType = DICE_POOL_RESULT_TYPES.PARTIAL;
      degree = positives.length;
    } else {
      outcomeType = DICE_POOL_RESULT_TYPES.FAILURE;
    }

    return new DicePoolRollResult({
      dice: this.dice,
      bonus: this.bonus,
      unmodifiedDice: diceSum.total,
      unmodifiedBonus: bonusSum.total,
      unmodifiedTotal: diceSum.total + bonusSum.total,
      modifiedDice: modifiedDiceSum,
      modifiedBonus: bonusSum.total,
      modifiedTotal: totalNumberOfDice,
      obstacle: obstacle,
      evaluatedObstacle: evaluatedObstacle,
      modifier: this.modifier,
      positives: positives,
      negatives: negatives,
      outcomeType: outcomeType,
      degree: degree,
    });
  }
}

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
export const CSS_CLASS_POSITIVE = "roll-success";

/**
 * CSS class of a negative die result. 
 * 
 * @type {String}
 * @constant
 */
export const CSS_CLASS_NEGATIVE = "roll-failure";

/**
 * CSS class of the obstacle value. 
 * 
 * @type {String}
 * @constant
 */
export const CSS_CLASS_OBSTACLE = "roll-obstacle";

/**
 * CSS class of a missing die result. 
 * 
 * @type {String}
 * @constant
 */
export const CSS_CLASS_MISSING_DIE = "roll-missing";

/**
 * Represents the result of a dice pool roll. 
 * 
 * @property {Number} unmodifiedDice
 * @property {Number} unmodifiedBonus
 * @property {Number} unmodifiedTotal
 * @property {Number} modifiedDice
 * @property {Number} modifiedBonus
 * @property {Number} modifiedTotal
 * @property {Array<SumComponent>} dice
 * @property {Array<SumComponent>} bonus
 * @property {Number} obstacle The obstacle that was rolled against. 
 * @property {EvaluatedRollFormula} evaluatedObstacle The dice results of the obstacle roll. 
 * @property {RollDiceModifierType} modifier The used dice modifier. 
 * @property {Array<Number>} positives The positives composition and total. 
 * @property {Array<Number>} negatives The negatives composition and total. 
 * @property {DicePoolRollResultType} outcomeType The result of this roll for use in a test. 
 * @property {Number} degree The degree of success or failure. 
 */
export class DicePoolRollResult {
  /**
   * @param {Object} args The arguments object. 
   * @param {Number} args.unmodifiedDice
   * @param {Number} args.unmodifiedBonus
   * @param {Number} args.unmodifiedTotal
   * @param {Number} args.modifiedDice
   * @param {Number} args.modifiedBonus
   * @param {Number} args.modifiedTotal
   * @param {Array<SumComponent>} args.dice
   * @param {Array<SumComponent>} args.bonus
   * @param {Number} args.obstacle The obstacle that was rolled against. 
   * @param {EvaluatedRollFormula} args.evaluatedObstacle The dice results of the obstacle roll. 
   * @param {RollDiceModifierType} args.modifier The used dice modifier. 
   * @param {Array<Number>} args.positives The positives composition and total. 
   * @param {Array<Number>} args.negatives The negatives composition and total. 
   * @param {DicePoolRollResultType} args.outcomeType The result of this roll for use in a test. 
   * @param {Number} args.degree The degree of success or failure. 
   */
  constructor(args = {}) {
    validateOrThrow(args, [
      "unmodifiedDice",
      "unmodifiedBonus",
      "unmodifiedTotal",
      "modifiedDice",
      "modifiedBonus",
      "modifiedTotal",
      "dice",
      "bonus",
      "obstacle", 
      "evaluatedObstacle", 
      "modifier", 
      "positives", 
      "negatives", 
      "outcomeType",
      "degree",
    ]);

    this.unmodifiedDice = args.unmodifiedDice;
    this.unmodifiedBonus = args.unmodifiedBonus;
    this.unmodifiedTotal = args.unmodifiedTotal;
    this.modifiedDice = args.modifiedDice;
    this.modifiedBonus = args.modifiedBonus;
    this.modifiedTotal = args.modifiedTotal;

    this.dice = args.dice;
    this.bonus = args.bonus;

    this.obstacle = args.obstacle;
    this.evaluatedObstacle = args.evaluatedObstacle;

    this.modifier = args.modifier;
    this.positives = args.positives;
    this.negatives = args.negatives;
    this.outcomeType = args.outcomeType;
    this.degree = args.degree;
  }

  /**
   * Sends this dice pool result to chat. 
   * 
   * @param {Object} args The arguments object. 
   * @param {VisibilityMode | undefined} args.visibilityMode Determines the visibility of the chat message. 
   * * Default `VISIBILITY_MODES.public`
   * @param {String | undefined} args.flavor The flavor text / subtitle of the message. 
   * @param {String | undefined} args.actor The actor to associate with the message. 
   * @param {String | undefined} args.primaryTitle A primary title. 
   * @param {String | undefined} args.primaryImage An image url for the primary title. 
   * @param {String | undefined} args.secondaryTitle A secondary title. 
   * @param {String | undefined} args.secondaryImage An image url for the secondary title. 
   * @param {Boolean | undefined} args.showBackFire Optional. If true, will show the spell-backfire label.
   * 
   * @async
   */
  async sendToChat(args = {}) {
    const positivesForRendering = this.positives.map(it => { return {cssClass: CSS_CLASS_POSITIVE, content: it}; });
    const negativesForRendering = this.negatives.map(it => { return {cssClass: CSS_CLASS_NEGATIVE, content: it}; });
    const combinedResultsForRendering = positivesForRendering.concat(negativesForRendering);

    const missingDiceCount = Math.max(this.obstacle - combinedResultsForRendering.length, 0);
    const obstacleForRendering = { cssClass: CSS_CLASS_OBSTACLE, content: `${game.i18n.localize(LOCALIZABLE_OBSTACLE_ABBREVIATION)} ${this.obstacle}` }
    
    if (this.obstacle >= combinedResultsForRendering.length) { // Obstacle greater than number of dice rolled. 
      // Insert "missing" dice. 
      for (let i = 0; i < missingDiceCount; i++) {
        combinedResultsForRendering.push({ cssClass: CSS_CLASS_MISSING_DIE, content: "" });
      }
      // Insert obstacle threshold. 
      combinedResultsForRendering.push(obstacleForRendering);
    } else { // Obstacle less than or equal to number of dice rolled. 
      // Insert obstacle threshold. 
      combinedResultsForRendering.splice(this.obstacle, 0, obstacleForRendering);
    }

    const diceComposition = this.getJoinedDiceCompositionString(this.dice, this.bonus);
    const totalNumberOfDice = this.getTotalNumberOfDiceString();
    const isObstacleRolled = true; // TODO
    const evaluatedObstacleForDisplay = await this.evaluatedObstacle.renderForDisplay();

    // Render the results. 
    const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_CHAT_MESSAGE, {
      resultsForDisplay: combinedResultsForRendering,
      outcomeType: this.outcomeType.name.toUpperCase(),
      degree: this.degree,
      numberOfDice: totalNumberOfDice,
      positives: this.positives.length,
      negatives: this.negatives.length,
      missingDiceCount: missingDiceCount,
      diceComposition: diceComposition,
      primaryTitle: args.primaryTitle,
      primaryImage: args.primaryImage,
      secondaryTitle: args.secondaryTitle,
      secondaryImage: args.secondaryImage,
      showBackFire: args.showBackFire,
      obstacle: this.obstacle,
      isObstacleRolled: isObstacleRolled,
      evaluatedObstacle: this.evaluatedObstacle,
      evaluatedObstacleForDisplay: evaluatedObstacleForDisplay,
    });

    return ChatUtil.sendToChat({
      renderedContent: renderedContent,
      flavor: args.flavor,
      actor: args.actor,
      sound: SOUNDS_CONSTANTS.DICE_ROLL,
      visibilityMode: args.visibilityMode ?? VISIBILITY_MODES.public
    });
  }
  
  /**
   * Returns a string for display of the dice components. 
   * 
   * The list is comma-separated and surrounded by parentheses. 
   * 
   * @returns {String} The joined and comma-separated dice component strings. 
   */
  getJoinedDiceCompositionString() {
    let joinedRollData = "";

    for (let i = 0; i < this.dice.length; i++) {
      const diceComponent = this.dice[i];
      joinedRollData = `${joinedRollData}${diceComponent.value} ${game.i18n.localize(diceComponent.localizableName)}`;

      if (i < this.dice.length - 1) {
        joinedRollData = `${joinedRollData}, `;
      }
    }

    // Include the bonus dice, but only if there are any. 
    if (this.modifiedBonus !== undefined && this.modifiedBonus !== 0) {
      joinedRollData = `${joinedRollData}, ${this.modifiedBonus} ${game.i18n.localize("ambersteel.roll.bonusDice")}`;
    }

    return `(${joinedRollData})`;
  }

  /**
   * Returns a string for display of the total number of dice. 
   * 
   * @returns {String} 
   */
  getTotalNumberOfDiceString() {
    if (this.modifier.name === ROLL_DICE_MODIFIER_TYPES.NONE.name) {
      return `${this.unmodifiedTotal}`;
    } else {
      return `${this.modifiedTotal}/${this.unmodifiedTotal}`;
    }
  }
}

/**
 * Represents the total outcome of a dice pool roll. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class DicePoolRollResultType {
  constructor(args = {}) {
    validateOrThrow(args, ["name", "localizableName"]);
    
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents all defined dice pool roll outcome types. 
 * 
 * @property {DicePoolRollResultType} NONE There is no actual outcome. 
 * * This is the case for Ob 0 tests, which commonly serve as a means to provide the Ob for an opposed test. 
 * @property {DicePoolRollResultType} SUCCESS The test was a complete success. 
 * @property {DicePoolRollResultType} FAILURE The test was a complete failure. 
 * @property {DicePoolRollResultType} PARTIAL The test was a partial failure. Not enough for a success, but not as bad as a complete failure. 
 * 
 * @constant
 */
export const DICE_POOL_RESULT_TYPES = {
  NONE: new DicePoolRollResultType({
    name: "none",
    localizableName: "ambersteel.general.none.label",
  }),
  SUCCESS: new DicePoolRollResultType({
    name: "success",
    localizableName: "ambersteel.roll.success.label",
  }),
  FAILURE: new DicePoolRollResultType({
    name: "failure",
    localizableName: "ambersteel.roll.failure.label",
  }),
  PARTIAL: new DicePoolRollResultType({
    name: "partial",
    localizableName: "ambersteel.roll.partial.label",
  }),
}
ConstantsUtils.enrichConstant(DICE_POOL_RESULT_TYPES);
