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