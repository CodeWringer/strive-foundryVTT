import { getElementValue } from "../utils/sheet-utility.mjs";

/**
 * 
 * @param ops 
 * @returns {Object} An object with the following properties: 
 * renderedContent {String} The fully rendered chat message html. 
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
export async function rollDice(ops = {
    actionName: "",
    actionValue: 0,
    obstacle: 0,
    bonusDice: 0,
    actor: {}
}) {
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
 * @param args 
 */
export function sendDiceResultToChat(args = { 
    renderedContent: "", 
    flavor: "", 
    actor: {},
    visibilityMode: CONFIG.ambersteel.visibilityModes.public
    }) {
    const sound = "../sounds/dice.wav";
    
    if (args.visibilityMode === CONFIG.ambersteel.visibilityModes.self) {
        throw "Not yet implemented";
        const self = undefined;

        ChatMessage.create({
            user: self,
            speaker: ChatMessage.getSpeaker({ actor: args.actor }),
            flavor: args.flavor,
            content: args.renderedContent,
            sound: sound
        });
    } else if (args.visibilityMode === CONFIG.ambersteel.visibilityModes.gm) {
        const gms = ChatMessage.getWhisperRecipients("GM");
        for (const gm of gms) {
            ChatMessage.create({
                user: gm,
                speaker: ChatMessage.getSpeaker({ actor: args.actor }),
                flavor: args.flavor,
                content: args.renderedContent,
                sound: sound
            });
        }
    } else {
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: args.actor }),
            flavor: args.flavor,
            content: args.renderedContent,
            sound: sound
        });
    }
}

/**
 * Returns true, if the given face/number represents a positive (= success).
 * @param face A die face to check whether it represents a positive (= success).
 */
export function isPositive(face) {
    return parseInt(face) === 6;
}

/**
 * Shows a dialog to the user to enter an obstacle and bonus dice number. 
 * @returns {Promise} Resolves, when the dialog is closed. 
 */
export async function queryRollData() {
    const dialogTemplate = "systems/ambersteel/templates/dice/roll-dialog.hbs";

    let dialogData = {
        obstacle: 0,
        bonusDice: 0,
        confirmed: false,
        visibilityMode: CONFIG.ambersteel.visibilityModes.public,
        CONFIG: CONFIG
    };

    return new Promise(async (resolve, reject) => {

        // Render template. 
        let renderedContent = await renderTemplate(dialogTemplate, dialogData);

        let dialog = new Dialog({
            title: game.i18n.localize("ambersteel.roll.titleDialogQuery"),
            content: renderedContent,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("ambersteel.labels.confirm"),
                    callback: () => {
                        dialogData.confirmed = true;
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("ambersteel.labels.cancel"),
                    callback: () => {}
                }
            },
            default: "confirm",
            render: html => {},
            close: html => {
                resolve({
                    obstacle: parseInt(html.find(".obstacle")[0].value),
                    bonusDice: parseInt(html.find(".bonus-dice")[0].value),
                    confirmed: dialogData.confirmed,
                    visibilityMode: getElementValue(html.find(".visibility")[0])
                });
            }
        });
        dialog.render(true);

    });
}