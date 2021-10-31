import { getAttributeGroupName } from './attribute-utility.mjs';

/**
 * Prepares skill data on the given item data. 
 * @param data 'item.data'
 */
export function prepareDerivedData(data) {
  const itemData = data.data;

  itemData.isExpanded = itemData.isExpanded ?? false;
  itemData.isExpandable = itemData.isExpandable ?? true;

  itemData.groupName = getAttributeGroupName(itemData.relatedAttribute);
}

export function activateListeners(html, owner) {
  html.find(".ambersteel-expand-skill-ability-list").click(_onExpandSkillAbilityList.bind(owner));
  html.find(".ambersteel-skill-ability-create").click(_onCreateSkillAbility.bind(owner));
}

/**
 * Returns the item object with the given id. 
 * @param owner Either an actor or an item sheet. 
 * @param itemId Id of the item. 
 */
function _getSkillItem(owner, itemId) {
  if (owner.actor && owner.actor.items) { // Actor sheet
    return owner.actor.items.get(itemId);
  } else { // Item sheet
    return owner.item;
  }
}

/**
 * @param event 
 * @private
 * @async
 */
async function _onExpandSkillAbilityList(event) {
  event.preventDefault();
  const element = event.currentTarget;
  const itemId = element.dataset.id;
  const skillItem = _getSkillItem(this, itemId);
  
  await skillItem.update({ ["data.isExpanded"]: !skillItem.data.data.isExpanded });
  this.render();
}

/**
 * @param event 
 * @private
 * @async
 */
async function _onCreateSkillAbility(event) {
  event.preventDefault();
  const element = event.currentTarget;
  const itemId = element.dataset.id;
  const skillItem = _getSkillItem(this, itemId);

  const abilities = skillItem.data.data.abilities.concat(
    [new SkillAbility("New Skill Ability", "", 0, 0, "" )]
  );
  await skillItem.update({ ["data.abilities"]: abilities });
  this.render();
}

/**
 * Returns the requirements to the next level of the given level. 
 * @param level The level for which to return the requirements to the next level. 
 */
export function getAdvancementRequirements(level = 0) {
  return {
    requiredSuccessses: (level == 0) ? 10 : (level + 1) * level * 2,
    requiredFailures: (level == 0) ? 14 : (level + 1) * level * 3
  }
};

/**
 * Sets the given level of the given skill. 
 * 
 * @param skillItem {Item} A skill item. 
 * @param newLevel {Number} Value to set the skill to, e.g. 0. Default 0
 * @param resetProgress {Boolean} If true, will also reset successes and failures. Default true
 * @async
 */
export async function setLevel(skillItem = undefined, newLevel = 0, resetProgress = true) {
  const req = getAdvancementRequirements(newLevel);

  await skillItem.update({
    ["data.value"]: newLevel,
    ["data.requiredSuccessses"]: req.requiredSuccessses,
    ["data.requiredFailures"]: req.requiredFailures,
    ["data.successes"]: resetProgress ? 0 : skillItem.data.data.successes,
    ["data.failures"]: resetProgress ? 0 : skillItem.data.data.failures
  });
};

/**
 * Adds success/failure progress to the given skill. 
 * 
 * Also auto-levels up the skill, if 'autoLevel' is set to true. 
 * @param skillItem {Item} A skill item. 
 * @param success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
 * @param autoLevel {Boolean} If true, will auto-level up. Default false
 * @param resetProgress {Boolean} If true, will also reset successes and failures,
 * if 'autoLevel' is also true and a level automatically incremented. Default true
 * @async
 */
export async function addProgress(skillItem = undefined, success = false, autoLevel = false, resetProgress = true) {
  const skillData = skillItem.data.data;

  const successes = parseInt(skillData.successes);
  const failures = parseInt(skillData.failures);
  const requiredSuccessses = parseInt(skillData.requiredSuccessses);
  const requiredFailures = parseInt(skillData.requiredFailures);

  if (success) {
    await skillItem.update({ ["data.successes"]: successes + 1 });
  } else {
    await skillItem.update({ ["data.failures"]: failures + 1 });
  }

  if (autoLevel) {
    if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
      const nextSkillValue = parseInt(skillData.value) + 1;
      await setLevel(nextSkillValue, resetProgress);
    }
  }
}

export class SkillAbility {
  constructor(name, description, requiredLevel, APCost, condition) {
    this.name = name;
    this.description = description;
    this.requiredLevel = requiredLevel;
    this.APCost = APCost;
    this.condition = condition;
  }
}