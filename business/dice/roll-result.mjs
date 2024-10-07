import { ACTOR_TYPES } from "../document/actor/actor-types.mjs";
import { Sum, SumComponent } from "../ruleset/summed-data.mjs";
import { DicePoolRollResultType } from "./dice-pool.mjs";
import { ResolvedObstacle } from "./roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import { SOUNDS_CONSTANTS } from "../../presentation/audio/sounds.mjs";
import { VISIBILITY_MODES, VisibilityMode } from "../../presentation/chat/visibility-modes.mjs";
import { DICE_CONSTANTS } from "./dice-constants.mjs";
import { ChatUtil } from "../../presentation/chat/chat-utility.mjs";
import { ValidationUtil } from "../util/validation-utility.mjs";
import { UuidUtil } from "../util/uuid-utility.mjs";

/**
 * Represents the input data of a dice (pool) roll. 
 * 
 * @property {Sum} dice The potential total dice 
 * that were available in the roll. 
 * @property {Number} bonusDice An additional number of dice that 
 * were rolled and unaffected by the roll modifier. 
 * @property {Number} compensationPoints Modifies the faces of misses, 
 * to potentially turn them into hits. 
 * @property {Number} hitModifier Number of automatic hits/misses. 
 * @property {RollDiceModifierType} rollModifier Modifies the number of 
 * dice to actually roll. 
 */
export class RollInputData {
  /**
   * @param {Object} args
   * @param {Sum} args.dice The potential total dice 
   * that were available in the roll. 
   * @param {Number} args.bonusDice An additional number of dice that 
   * were rolled and unaffected by the roll modifier. 
   * @param {Number} args.compensationPoints Modifies the faces of misses, 
   * to potentially turn them into hits. 
   * @param {Number} args.hitModifier Number of automatic hits/misses. 
   * @param {RollDiceModifierType} args.rollModifier Modifies the number of 
   * dice to actually roll. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, [
      "dice",
      "bonusDice",
      "compensationPoints",
      "hitModifier",
      "rollModifier",
    ]);

    this.dice = args.dice;
    this.bonusDice = args.bonusDice;
    this.compensationPoints = args.compensationPoints;
    this.hitModifier = args.hitModifier;
    this.rollModifier = args.rollModifier;
  }
}

/**
 * Represents a step of the dice rolling process. Could be the step before modifiers are applied, 
 * or the step after. 
 * 
 * @property {Array<Number>} faces The face results of the dice that were actually rolled. 
 * @property {resolvedObstacle} resolvedObstacle
 * @property {Array<Number>} hits 
 * @property {Array<Number>} misses 
 * @property {Number} blankCount 
 * @property {Number} degree 
 * @property {DicePoolRollResultType} outcomeType 
*/
export class RollStepData {
  /**
   * @param {Object} args
   * @param {Array<Number>} args.faces The face results of the dice that were actually rolled. 
   * @param {ResolvedObstacle} args.resolvedObstacle
   * @param {Array<Number>} args.hits 
   * @param {Array<Number>} args.misses 
   * @param {Number} args.blankCount 
   * @param {Number} args.degree 
   * @param {DicePoolRollResultType} args.outcomeType 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, [
      "faces",
      "resolvedObstacle",
      "hits",
      "misses",
      "blankCount",
      "degree",
      "outcomeType",
    ]);

    this.faces = args.faces;
    this.resolvedObstacle = args.resolvedObstacle;
    this.hits = args.hits;
    this.misses = args.misses;
    this.blankCount = args.blankCount;
    this.degree = args.degree;
    this.outcomeType = args.outcomeType;
  }
}

/**
 * Represents the result of a dice (pool) roll. 
 * 
 * @property {RollInputData} inputData 
 * @property {RollStepData} intermediateResults 
 * @property {RollStepData} results 
 */
export class RollResult {
  /**
   * @param {Object} args
   * @param {RollInputData} args.inputData
   * @param {RollStepData} args.intermediateResults
   * @param {RollStepData} args.results
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, [
      "inputData",
      "intermediateResults",
      "results",
    ]);

    this.inputData = args.inputData;
    this.intermediateResults = args.intermediateResults;
    this.results = args.results;
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
    const showIntermediateFaces = this._getAreResultsDifferent();

    const intermediateFacesForDisplay = this._getFacesForDisplay(this.intermediateResults);
    const resultFacesForDisplay = this._getFacesForDisplay(this.results);

    let showReminder = false;
    if (ValidationUtil.isDefined(args.actor) === true) {
      const transientActor = args.actor.getTransientObject();
      if (transientActor.type === ACTOR_TYPES.PC) {
        showReminder = true;
      } else if (transientActor.type === ACTOR_TYPES.NPC) {
        showReminder = transientActor.progressionVisible;
      }
    }

    // Render the results. 
    const renderedContent = await renderTemplate(game.strive.const.TEMPLATES.DICE_ROLL_CHAT_MESSAGE, {
      id: UuidUtil.createUUID(),
      primaryTitle: args.primaryTitle,
      primaryImage: args.primaryImage,
      secondaryTitle: args.secondaryTitle,
      secondaryImage: args.secondaryImage,

      showIntermediateFaces: showIntermediateFaces,
      intermediateFaces: intermediateFacesForDisplay,

      finalFaces: resultFacesForDisplay,

      outcomeType: this.results.outcomeType.name.toUpperCase(),
      degree: this.results.degree,

      diceCount: this.getTotalNumberOfDiceString(),
      hitCount: this.results.hits.length,
      missCount: this.results.misses.length,
      blankCount: this.results.blankCount,

      diceComposition: this.getJoinedDiceCompositionString(),

      obstacle: this.results.resolvedObstacle.ob,
      unmodifiedObstacle: this.results.resolvedObstacle.ob - 1,
      isObstacleRolled: this.results.resolvedObstacle.isPlainNumber === false,
      obFormula: this.results.resolvedObstacle.obFormula,
      resolvedObFormula: this.results.resolvedObstacle.resolvedObFormula,

      showReminder: showReminder,
      additionalContent: args.additionalContent,
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
   * 
   * @private
   */
  getJoinedDiceCompositionString() {
    const components = this.inputData.dice.components.concat([]);

    if (this.inputData.bonusDice !== 0) {
      components.push(new SumComponent(
        "bonusDice",
        "system.roll.bonusDice",
        this.inputData.bonusDice,
      ));
    }

    if (this.inputData.compensationPoints !== 0) {
      components.push(new SumComponent(
        "compensationPoints",
        "system.roll.compensationPoints",
        this.inputData.compensationPoints,
      ));
    }

    if (this.inputData.hitModifier !== 0) {
      components.push(new SumComponent(
        "hitModifier",
        "system.roll.hitModifier",
        this.inputData.hitModifier,
      ));
    }

    const joinedComponents = components
      .map(component => `${component.value} ${game.i18n.localize(component.localizableName)}`)
      .join(", ");

    return `(${joinedComponents})`;
  }

  /**
   * Returns a string for display of the total number of dice. 
   * 
   * @returns {String} 
   * 
   * @private
   */
  getTotalNumberOfDiceString() {
    const actualTotal = this.results.faces.length;

    if (this.inputData.rollModifier.name === ROLL_DICE_MODIFIER_TYPES.NONE.name) {
      return `${actualTotal}`;
    } else {
      const total = this.inputData.dice.total + this.inputData.bonusDice;
      return `${actualTotal} / ${total}`;
    }
  }

  /**
   * Returns `true`, if the intermediate and final results differ. 
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _getAreResultsDifferent() {
    if (this.intermediateResults.faces.length !== this.results.faces.length) {
      return true;
    } else {
      for (let i = 0; i < this.intermediateResults.faces.length; i++) {
        const intermediateFace = this.intermediateResults.faces[i];
        const resultFace = this.results.faces[i];
        
        if (intermediateFace !== resultFace) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 
   * @param {RollStepData} rollStepData 
   * 
   * @returns {Array<Object>} Fields:
   * * `cssClass: String`
   * * `content: String`
   * 
   * @private
   */
  _getFacesForDisplay(rollStepData) {
    const hitsForRendering = rollStepData.hits
      .concat([])
      .sort()
      .reverse()
      .map(it => { return {cssClass: `roll die d6 ${DICE_CONSTANTS.CSS_CLASS_HIT}`, content: it}; });
    const missesForRendering = rollStepData.misses
      .concat([])
      .sort()
      .reverse()
      .map(it => { return {cssClass: `roll die d6 ${DICE_CONSTANTS.CSS_CLASS_MISS}`, content: it}; });

    let combinedResultsForRendering = []
      .concat(hitsForRendering)
      .concat(missesForRendering);

    const obstacle = rollStepData.resolvedObstacle.ob;
    const obstacleForRendering = { cssClass: DICE_CONSTANTS.CSS_CLASS_OBSTACLE, content: `${game.i18n.localize("system.roll.obstacle.abbreviation")} ${obstacle}` }
    
    if (obstacle >= rollStepData.faces.length) { // Obstacle greater than number of dice rolled. 
      const blanksForRendering = [];
      for (let i = 0; i < rollStepData.blankCount; i++) {
        blanksForRendering.push({ cssClass: `roll die d6 ${DICE_CONSTANTS.CSS_CLASS_MISSING_DIE}`, content: "" });
      }
      // Add blanks and then the obstacle to the end of the faces list. 
      combinedResultsForRendering = combinedResultsForRendering
        .concat(blanksForRendering)
        .concat(obstacleForRendering)
    } else { // Obstacle less than or equal to number of dice rolled. 
      // Insert the obstacle in-between hits and misses. 
      combinedResultsForRendering.splice(obstacle, 0, obstacleForRendering);
    }

    return combinedResultsForRendering;
  }
}
