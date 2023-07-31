import { SOUNDS_CONSTANTS } from "../../presentation/audio/sounds.mjs";
import { VISIBILITY_MODES, VisibilityMode } from "../../presentation/chat/visibility-modes.mjs";
import { TEMPLATES } from "../../presentation/templatePreloader.mjs";
import Ruleset from "../ruleset/ruleset.mjs";
import { Sum, SumComponent } from "../ruleset/summed-data.mjs";
import { validateOrThrow } from "../util/validation-utility.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import * as ChatUtil from "../../presentation/chat/chat-utility.mjs";

/**
 * Represents a dice pool. 
 * 
 * @property {Array<SumComponent>} dice The dice composition for use in the roll. 
 * @property {Array<SumComponent>} bonus The bonus dice composition for use in the roll. 
 * @property {Number} obstacle The obstacle to roll against. 
 * * Default `0`
 * @property {RollDiceModifierType | undefined} modifier A dice number modifier. 
 * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
*/
export default class DicePool {
  /**
   * @param {Object} args The arguments object. 
   * @param {Array<SumComponent> | undefined} args.dice The dice composition for use in the roll. 
   * @param {Array<SumComponent> | undefined} args.bonus The bonus dice composition for use in the roll. 
   * @param {Number} args.obstacle The obstacle to roll against. 
   * * Default `0`
   * @param {RollDiceModifierType | undefined} args.modifier A dice number modifier. 
   * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
   */
  constructor(args = {}) {
    this.dice = args.dice ?? [];
    this.bonus = args.bonus ?? [];
    this.obstacle = args.obstacle ?? 0;
    this.modifier = args.modifier ?? ROLL_DICE_MODIFIER_TYPES.NONE;
  }

  /**
   * Rolls the current configuration of dice and returns the result. 
   * 
   * Calling this method again will produce different results every time. 
   * 
   * @returns {DicePoolRollResult}
   */
  roll() {
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
    let outcomeType = DICE_POOL_RESULT_TYPES.NONE;
    let degree = 0;

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
      
      // Determine outcome type and degree of success/failure. 
      if (this.obstacle < 1) { // Ob 0 test?
        outcomeType = DICE_POOL_RESULT_TYPES.NONE;
      } else if (positives.length >= this.obstacle) { // Complete success
        outcomeType = DICE_POOL_RESULT_TYPES.SUCCESS;
        degree = positives.length - this.obstacle;
      } else if (positives.length > 0) { // Partial failure
        outcomeType = DICE_POOL_RESULT_TYPES.PARTIAL;
        degree = positives.length;
      } else {
        outcomeType = DICE_POOL_RESULT_TYPES.FAILURE;
      }
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
      obstacle: this.obstacle,
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
 * @property {Number} obstacle The obstacle that was roll against. 
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
   * @param {Number} args.obstacle The obstacle that was roll against. 
   * @param {RollDiceModifierType} args.modifier The used dice modifier. 
   * @param {Array<Number>} positives The positives composition and total. 
   * @param {Array<Number>} negatives The negatives composition and total. 
   * @param {DicePoolRollResultType} outcomeType The result of this roll for use in a test. 
   * @param {Number} degree The degree of success or failure. 
   */
  constructor(args = {}) {
    this.unmodifiedDice = args.unmodifiedDice;
    this.unmodifiedBonus = args.unmodifiedBonus;
    this.unmodifiedTotal = args.unmodifiedTotal;
    this.modifiedDice = args.modifiedDice;
    this.modifiedBonus = args.modifiedBonus;
    this.modifiedTotal = args.modifiedTotal;

    this.dice = args.dice;
    this.bonus = args.bonus;

    this.obstacle = args.obstacle;
    this.modifier = args.modifier;
    this.positives = args.positives;
    this.negatives = args.negatives;
    this.outcomeType = args.outcomeType;
    this.degree = args.degree;

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
      "modifier", 
      "positives", 
      "negatives", 
      "outcomeType",
      "degree",
    ]);
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

    // Insert obstacle threshold. 
    const obstacleForRendering = { cssClass: CSS_CLASS_OBSTACLE, content: `${game.i18n.localize(LOCALIZABLE_OBSTACLE_ABBREVIATION)} ${this.obstacle}` }

    if (this.obstacle >= combinedResultsForRendering.length) { // Obstacle greater than number of dice rolled. 
      combinedResultsForRendering.push(obstacleForRendering);
    } else { // Obstacle less than or equal to number of dice rolled. 
      combinedResultsForRendering.splice(this.obstacle, 0, obstacleForRendering);
    }

    const diceComposition = this._getJoinedDiceCompositionString(this.dice, this.bonus);
    const totalNumberOfDice = this._getTotalNumberOfDiceString();

    // Render the results. 
    const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_CHAT_MESSAGE, {
      resultsForDisplay: combinedResultsForRendering,
      outcomeType: this.outcomeType.name.toUpperCase(),
      degree: this.degree,
      numberOfDice: totalNumberOfDice,
      positives: this.positives.length,
      negatives: this.negatives.length,
      diceComposition: diceComposition,
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
  _getJoinedDiceCompositionString() {
    let joinedRollData = "";

    for (const entry of this.dice) {
      joinedRollData = `${joinedRollData}${entry.value} ${game.i18n.localize(entry.localizableName)}, `
    }

    joinedRollData = `${joinedRollData}${this.modifiedBonus} ${game.i18n.localize("ambersteel.roll.bonusDice")}`;

    return `(${joinedRollData})`;
  }

  /**
   * Returns a string for display of the total number of dice. 
   * 
   * @returns {String} 
   */
  _getTotalNumberOfDiceString() {
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
    this.name = args.name;
    this.localizableName = args.localizableName;
    validateOrThrow(args, ["name", "localizableName"]);
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
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * @property {Array<VisibilityMode>} asArray The constants of this type, as an array. 
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
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asChoices;
  },
  get asArray() {
    if (this._asArray === undefined) {
      this._asArray = getAsArray(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asArray;
  },
}
