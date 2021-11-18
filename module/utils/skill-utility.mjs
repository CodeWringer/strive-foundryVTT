import { showDialog } from "./dialog-utility.mjs";

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
* Shows a dialog to the user to select a skill from the existing list of skills, 
* or check a flag to add a custom skill.  
* @returns {Promise} Resolves, when the dialog is closed. 
*/
export async function querySkillAddData() {
  const dialogTemplate = "systems/ambersteel/templates/dialog/skill-add-dialog.hbs";

  const dialogData = {
    availableSkills: [],
    selected: "",
    isCustomChecked: false
  };

  return showDialog({ 
      dialogTemplate: dialogTemplate, 
      localizableTitle: "ambersteel.dialog.titleSkillAddQuery"
    }, 
    dialogData
  );
}