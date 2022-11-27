import { showDialog } from "./dialog-utility.mjs";

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
      localizedTitle: game.i18n.localize("ambersteel.character.skill.ability.add.query")
    }, 
    dialogData
  );
}