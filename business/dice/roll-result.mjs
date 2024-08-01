import { TEMPLATES } from "../../presentation/templatePreloader.mjs";
import { ACTOR_TYPES } from "../document/actor/actor-types.mjs";
import { Sum } from "../ruleset/summed-data.mjs";
import { isDefined, validateOrThrow } from "../util/validation-utility.mjs";
import { DicePoolRollResultType } from "./dice-pool.mjs";
import { ResolvedObstacle } from "./roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import * as ChatUtil from "../../presentation/chat/chat-utility.mjs";
import { SOUNDS_CONSTANTS } from "../../presentation/audio/sounds.mjs";
import { VISIBILITY_MODES } from "../../presentation/chat/visibility-modes.mjs";
import { DICE_CONSTANTS } from "./dice-constants.mjs";

/**
 * Represents the result of a dice (pool) roll. 
 * 
 * @property {Sum} totalDice The potential total dice 
 * that were available in the roll. 
 * @property {Number} totalRolledDice The actual total number of dice 
 * that was rolled. 
 * @property {resolvedObstacle} resolvedObstacle
 * @property {Array<Number>} hits 
 * @property {Array<Number>} misses 
 * @property {Number} blankCount 
 * @property {Number} degree 
 * @property {DicePoolRollResultType} outcomeType 
 * @property {RollDiceModifierType} rollModifier 
 */
export class RollResult {
  /**
   * @param {Object} args
   * @param {Sum} args.totalDice The potential total dice 
   * that were available in the roll. 
   * @param {Number} args.totalRolledDice The actual total number of dice 
   * that was rolled. 
   * @param {ResolvedObstacle} args.resolvedObstacle
   * @param {Array<Number>} args.hits 
   * @param {Array<Number>} args.misses 
   * @param {Number} args.blankCount 
   * @param {Number} args.degree 
   * @param {DicePoolRollResultType} args.outcomeType 
   * @param {RollDiceModifierType} args.rollModifier 
   */
  constructor(args = {}) {
    validateOrThrow(args, [
      "totalDice",
      "totalRolledDice",
      "resolvedObstacle",
      "hits",
      "misses",
      "blankCount",
      "degree",
      "outcomeType",
      "rollModifier",
    ]);

    this.totalDice = args.totalDice;
    this.totalRolledDice = args.totalRolledDice;
    this.resolvedObstacle = args.resolvedObstacle;
    this.hits = args.hits;
    this.misses = args.misses;
    this.blankCount = args.blankCount;
    this.degree = args.degree;
    this.outcomeType = args.outcomeType;
    this.rollModifier = args.rollModifier;
  }
  
  /**
   * Sends this roll result to chat. 
   * 
   * @param {Object} args The arguments object. 
   * @param {VisibilityMode | undefined} args.visibilityMode Determines the visibility of the chat message. 
   * * Default `VISIBILITY_MODES.public`
   * @param {String | undefined} args.flavor The flavor text / subtitle of the message. 
   * @param {GameSystemActor | undefined} args.actor The actor to associate with the message. 
   * @param {String | undefined} args.primaryTitle A primary title. 
   * @param {String | undefined} args.primaryImage An image url for the primary title. 
   * @param {String | undefined} args.secondaryTitle A secondary title. 
   * @param {String | undefined} args.secondaryImage An image url for the secondary title. 
   * @param {String | undefined} args.additionalContent 
   * 
   * @async
   */
  async sendToChat(args = {}) {
    
    const hitsForRendering = this.hits
      .concat([])
      .sort()
      .reverse()
      .map(it => { return {cssClass: DICE_CONSTANTS.CSS_CLASS_HIT, content: it}; });
    const missesForRendering = this.misses
      .concat([])
      .sort()
      .reverse()
      .map(it => { return {cssClass: DICE_CONSTANTS.CSS_CLASS_MISS, content: it}; });

    let combinedResultsForRendering = []
      .concat(hitsForRendering)
      .concat(missesForRendering);

    const obstacle = this.resolvedObstacle.ob;
    const obstacleForRendering = { cssClass: DICE_CONSTANTS.CSS_CLASS_OBSTACLE, content: `${game.i18n.localize("system.roll.obstacle.abbreviation")} ${obstacle}` }
    
    if (obstacle >= this.totalRolledDice) { // Obstacle greater than number of dice rolled. 
      const blanksForRendering = [];
      for (let i = 0; i < this.blankCount; i++) {
        blanksForRendering.push({ cssClass: DICE_CONSTANTS.CSS_CLASS_MISSING_DIE, content: "" });
      }
      // Assemble
      combinedResultsForRendering = combinedResultsForRendering
        .concat(blanksForRendering)
        .concat(obstacleForRendering)
    } else { // Obstacle less than or equal to number of dice rolled. 
      combinedResultsForRendering.splice(obstacle, 0, obstacleForRendering);
    }

    let showReminder = false;
    if (isDefined(args.actor) === true) {
      const transientActor = args.actor.getTransientObject();
      if (transientActor.type === ACTOR_TYPES.PC) {
        showReminder = true;
      } else if (transientActor.type === ACTOR_TYPES.NPC) {
        showReminder = transientActor.progressionVisible;
      }
    }

    // Render the results. 
    const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_CHAT_MESSAGE, {
      resultsForDisplay: combinedResultsForRendering,
      outcomeType: this.outcomeType.name.toUpperCase(),
      degree: this.degree,
      numberOfDice: this.getTotalNumberOfDiceString(),
      hits: this.hits.length,
      misses: this.misses.length,
      missingDiceCount: this.blankCount,
      diceComposition: this.getJoinedDiceCompositionString(this.dice, this.bonus),
      primaryTitle: args.primaryTitle,
      primaryImage: args.primaryImage,
      secondaryTitle: args.secondaryTitle,
      secondaryImage: args.secondaryImage,
      additionalContent: args.additionalContent,
      obstacle: obstacle,
      isObstacleRolled: this.resolvedObstacle.isPlainNumber === false,
      obstacleFormula: this.resolvedObstacle.obFormula,
      evaluatedObstacleForDisplay: this.resolvedObstacle.resolvedObFormula,
      showReminder: showReminder,
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
    const joinedComponents = this.totalDice.components
      .map(component => `${component.value} ${game.i18n.localize(component.localizableName)}`)
      .join(", ");
    return `(${joinedComponents})`;
  }

  /**
   * Returns a string for display of the total number of dice. 
   * 
   * @returns {String} 
   */
  getTotalNumberOfDiceString() {
    if (this.rollModifier.name === ROLL_DICE_MODIFIER_TYPES.NONE.name) {
      return `${this.totalDice.total}`;
    } else {
      return `${this.totalRolledDice} / ${this.totalDice.total}`;
    }
  }
}
