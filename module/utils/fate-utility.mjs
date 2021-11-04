export function prepareDerivedActorData(context) {
  const maxCards = CONFIG.ambersteel.fateSystem.maxCards;
  const fateSystemData = context.data.data.fateSystem;

  fateSystemData.cards = (context.actor.items.filter(item => {
    return item.data.type === "fate-card"
  })).map(it => it.data);
  fateSystemData.remainingSlots = maxCards - fateSystemData.cards.length;
}