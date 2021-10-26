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
    
    // let roll = new Roll(formula, {}).evaluate();
    // Make the roll. 
    let results = new Die({ faces: 6, number: numberOfDice }).evaluate().results;

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

    // Render the results. 
    let renderedContent = await renderTemplate(messageTemplate, { 
        numberOfDice: numberOfDice,
        obstacle: obstacle,
        positives: positives,
        negatives: negatives,
        resultsForDisplay: resultsForDisplay,
        isSuccess: isSuccess,
        degree: degree
    });

     // Create a new chat message. 
    return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: ops.actor }),
        flavor: ops.actionName,
        content: renderedContent
    });
}

/**
 * Returns true, if the given face/number represents a positive (= success).
 * @param face A die face to check whether it represents a positive (= success).
 */
export function isPositive(face) {
    return parseInt(face) === 6;
}