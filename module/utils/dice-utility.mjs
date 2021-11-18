import { getElementValue } from "./sheet-utility.mjs";
import * as ChatUtil from "./chat-utility.mjs";
import { showDialog } from './dialog-utility.mjs';
import { validateOrThrow } from "./validation-utility.mjs";

/**
 * Rolls the given number of dice and returns the results of the roll, both in raw 
 * form and as rendered HTML. 
 * @param {String|undefined} ops.actionName Optional. The subtitle to show in the chat message. 
 * @param {Number} ops.actionValue The number of dice to roll. 
 * @param {Number} ops.obstacle The obstacle to roll against. 
 * @param {Number} ops.bonusDice An additional number of dice to roll. 
 * @param {Actor|undefined} ops.actor Optional. The actor to associate with the chat message. 
 * @returns {Object} An object with the following properties: 
 * renderedContent {String} The fully rendered chat message HTML. 
 * flavor {String} 
 * actor {Object}
 * rollResults {Object} An object with the following properties: 
 * rollResults.numberOfDice {Number}
 * rollResults.obstacle {Number}
 * rollResults.positives {[Number]}
 * rollResults.negatives {[Number]}
 * rollResults.isSuccess {Boolean}
 * rollResults.degree {Number}
 */
export async function rollDice(ops = {}) {
    ops = {
        actionName: undefined,
        actionValue: 0,
        obstacle: 0,
        bonusDice: 0,
        actor: undefined,
        ...ops
    };
    validateOrThrow(ops, ["actionValue", "obstacle", "bonusDice"]);
    const messageTemplate = "systems/ambersteel/templates/dice/roll.hbs";
    const obstacle = parseInt(ops.obstacle);

    // Get number of dice to roll. 
    let numberOfDice = parseInt(ops.actionValue) + parseInt(ops.bonusDice);
    // Ensure no negative number of dice to roll. 
    numberOfDice = numberOfDice >= 0 ? numberOfDice : 0;
    
    // Make the roll. 
    const results = new Die({ faces: 6, number: numberOfDice }).evaluate().results;

    // Analyze results. 
    let positives = [];
    let negatives = [];
    for (let result of results) {
        let face = result.result;
        if (isPositive(face)) {
            positives.push(face);
        } else {
            negatives.push(face);
        }
    }
    let combinedResults = positives.concat(negatives);

    // This holds the results to display in the rendered template, including the 
    // obstacle value. 
    let resultsForDisplay = [];
    for (let face of combinedResults) {
        if (isPositive(face)) {
            resultsForDisplay.push({ cssClass: "roll-success", content: face });
        } else {
            resultsForDisplay.push({ cssClass: "roll-failure", content: face });
        }
    }
    // Insert obstacle threshold. 
    const localizedObstacleAbbreviation = game.i18n.localize("ambersteel.roll.obstacleAbbreviation");
    const obstacleForDisplay = { cssClass: "roll-obstacle", content: `${localizedObstacleAbbreviation} ${obstacle}` }
    if (obstacle >= resultsForDisplay.length) {
        resultsForDisplay.push(obstacleForDisplay);
    } else {
        resultsForDisplay.splice(obstacle, 0, obstacleForDisplay);
    }

    let isSuccess = positives.length >= obstacle;
    let degree = isSuccess ? positives.length - obstacle : negatives.length - obstacle;

    let rollResults = {
        numberOfDice: numberOfDice,
        obstacle: obstacle,
        positives: positives,
        negatives: negatives,
        isSuccess: isSuccess,
        degree: degree
    };

    // Render the results. 
    const renderedContent = await renderTemplate(messageTemplate, {
        ...rollResults, 
        resultsForDisplay: resultsForDisplay,
    });

    return {
        renderedContent: renderedContent,
        flavor: ops.actionName,
        actor: ops.actor,
        rollResults: rollResults
    }
}

/**
 * Creates a new ChatMessage to display dice roll results. 
 * @param {String} args.renderedContent The fully rendered chat message HTML. 
 * @param {String} args.flavor Optional. The flavor text / subtitle of the message. 
 * @param {String} args.actor Optional. The actor to associate with the message. 
 * @param {String} args.visibilityMode Optional. Sets the visibility of the chat message. Default public. 
 */
export function sendDiceResultToChat(args = {}) {
    validateOrThrow(args, ["renderedContent"]);
    args = { 
        renderedContent: "", 
        flavor: undefined, 
        actor: undefined,
        visibilityMode: CONFIG.ambersteel.visibilityModes.public,
        ...args
    };
    ChatUtil.sendToChat({
        speaker: undefined,
        renderedContent: args.renderedContent,
        flavor: args.flavor,
        actor: args.actor,
        sound: "../sounds/dice.wav",
        visibilityMode: args.visibilityMode
    });
}

/**
 * Returns true, if the given face/number represents a positive (= success).
 * @param {String|Number} face A die face to check whether it represents a positive (= success).
 */
export function isPositive(face) {
    return parseInt(face) === 6 || parseInt(face) === 5;
}

/**
 * Returns true, if the given face/number represents a spell-backfire-causing negative. 
 * @param {String|Number} face A die face to check whether it represents a spell-backfire-causing negative. 
 */
export function causesBackfire(face) {
    return parseInt(face) === 1 || parseInt(face) === 2;
}

/**
 * Shows a dialog to the user to enter an obstacle and bonus dice number. 
 * @returns {Promise} Resolves, when the dialog is closed. 
 */
export async function queryRollData() {
    const dialogTemplate = "systems/ambersteel/templates/dialog/roll-dialog.hbs";
    const dialogData = {
        obstacle: 0,
        bonusDice: 0,
        visibilityMode: CONFIG.ambersteel.visibilityModes.public
    };

    return new Promise(async (resolve, reject) => {
        const result = await showDialog({ dialogTemplate: dialogTemplate, localizableTitle: "ambersteel.dialog.titleRollQuery" }, dialogData);
        resolve({
            obstacle: parseInt(getElementValue(result.html.find(".obstacle")[0])),
            bonusDice: parseInt(getElementValue(result.html.find(".bonus-dice")[0])),
            visibilityMode: getElementValue(result.html.find(".visibilityMode")[0]),
            confirmed: result.confirmed
        });
    });
}