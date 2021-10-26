export async function rollDice(ops = {
    actionName: "",
    actionValue: 0,
    actor: {}
}) {
    const messageTemplate = "systems/ambersteel/templates/dice/roll.hbs"

    // Make the roll. 
    let roll = new Roll( ops.actionValue + "d6", {}).roll();
    let renderedRoll = await roll.render({ template: messageTemplate });

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: ops.actor }),
        flavor: ops.actionName,
        content: renderedRoll
    };

    return roll.toMessage(messageData);
}