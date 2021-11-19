export function getDataSet(event) {
  const dataset = event.currentTarget.dataset;

  if (!dataset.ownerId || !dataset.ownerType) return dataset;

  const ownerId = dataset.ownerId;
  const ownerType = dataset.ownerType;

  let owner = undefined
  let actor = undefined
  if (ownerType.toLowerCase() == "actor") {
    owner = game.actors.get(ownerId);
    actor = owner;
  } else if (ownerType.toLowerCase() == "item") {
    owner = game.items.get(ownerId);
    actor = owner.parent;
  } else {
    throw `Unrecognized ownerType '${ownerType}'!`;
  }

  return {
    ...dataset,
    owner: owner,
    actor: actor
  }
}