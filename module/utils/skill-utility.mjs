import { getAttributeGroupName } from './attribute-utility.mjs';
import { getItem } from './item-utility.mjs';

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

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param owner {Object} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, owner, isOwner, isEditable) {
  // Show skill abilities. 
  html.find(".ambersteel-expand-skill-ability-list").click(_onExpandSkillAbilityList.bind(owner));

  if (!isOwner) return;
  if (!isEditable) return;

  // Add skill ability. 
  html.find(".ambersteel-skill-ability-create").click(_onCreateSkillAbility.bind(owner));

  // Delete skill ability.
  html.find(".ambersteel-skill-ability-delete").click(_onDeleteSkillAbility.bind(owner));
}

/**
 * @param event 
 * @private
 * @async
 */
async function _onExpandSkillAbilityList(event) {
  event.preventDefault();
  const element = event.currentTarget;
  const itemId = element.dataset.itemId;
  const skillItem = getItem(this, itemId);

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
  const itemId = element.dataset.itemId;
  const skillItem = getItem(this, itemId);

  const abilities = skillItem.data.data.abilities.concat(
    [new SkillAbility("New Skill Ability", "", 0, 0, "")]
  );
  await skillItem.update({ ["data.abilities"]: abilities });
  this.render();
}

/**
 * @param event 
 * @private
 * @async
 */
async function _onDeleteSkillAbility(event) {
  event.preventDefault();
  const element = event.currentTarget;
  const itemId = element.dataset.itemId;
  const index = parseInt(element.dataset.index);
  const skillItem = getItem(this, itemId);
  const dataAbilities = skillItem.data.data.abilities;

  const abilities = dataAbilities.slice(0, index).concat(dataAbilities.slice(index + 1));
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
  constructor(name, description, requiredLevel, apCost, condition) {
    this.name = name;
    this.description = description;
    this.requiredLevel = requiredLevel;
    this.apCost = apCost;
    this.condition = condition;
  }
}

/**
* Shows a dialog to the user to select a skill from the existing list of skills, 
* or check a flag to add a custom skill.  
* @returns {Promise} Resolves, when the dialog is closed. 
*/
export async function querySkillAddData() {
  const dialogTemplate = "systems/ambersteel/templates/dialog/skill-add-dialog.hbs";

  let dialogData = {
    availableSkills: [],
    selected: "",
    isCustomChecked: false,
    confirmed: false
  };

  return new Promise(async (resolve, reject) => {
    // Render template. 
    let renderedContent = await renderTemplate(dialogTemplate, dialogData);

    let dialog = new Dialog({
      title: game.i18n.localize("ambersteel.skill.titleDialogQuery"),
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
          callback: () => { }
        }
      },
      default: "confirm",
      render: html => { },
      close: html => {
        resolve({
          skill: html.find(".skill-select")[0].value,
          customSkill: html.find(".ambersteel-checkbox")[0].value === "true",
          confirmed: dialogData.confirmed
        });
      }
    });
    dialog.render(true);
  });
}