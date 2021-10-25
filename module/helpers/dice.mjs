export function rollDice(ops = {
    actionName: "",
    actionValue: 0,
    actor: {}
}) {
    // Make the roll. 
    let roll = new Roll( ops.actionValue + "d6", {}).roll();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: ops.actor }),
      flavor: ops.actionName,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;
}