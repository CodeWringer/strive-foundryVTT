export const TEMPLATES = {
  // --- Components
  // Inputs
  COMPONENT_INPUT_TEXTFIELD: "systems/ambersteel/module/components/input-textfield/input-textfield.hbs",
  COMPONENT_INPUT_DROPDOWN: "systems/ambersteel/module/components/input-dropdown/input-dropdown.hbs",
  COMPONENT_INPUT_NUMBER_SPINNER: "systems/ambersteel/module/components/input-number-spinner/input-number-spinner.hbs",
  COMPONENT_INPUT_TEXTAREA: "systems/ambersteel/module/components/input-textarea/input-textarea.hbs",
  COMPONENT_INPUT_RADIO_BUTTON_GROUP: "systems/ambersteel/module/components/input-radio-button-group/input-radio-button-group.hbs",
  COMPONENT_INPUT_LABEL: "systems/ambersteel/templates/components/input-label.hbs",
  COMPONENT_INPUT_ITEM_GRID_VIEW: "systems/ambersteel/module/components/item-grid/item-grid-view.hbs",
  // Buttons
  COMPONENT_BUTTON: "systems/ambersteel/module/components/button/button.hbs",
  COMPONENT_BUTTON_TAKE_ITEM: "systems/ambersteel/templates/components/button-take-item.hbs",
  COMPONENT_BUTTON_ADD: "systems/ambersteel/module/components/button-add/button-add.hbs",
  COMPONENT_BUTTON_DELETE: "systems/ambersteel/module/components/button-delete/button-delete.hbs",
  COMPONENT_BUTTON_OPEN_SHEET: "systems/ambersteel/module/components/button-open-sheet/button-open-sheet.hbs",
  COMPONENT_BUTTON_ROLL: "systems/ambersteel/module/components/button-roll/button-roll.hbs",
  COMPONENT_BUTTON_SEND_TO_CHAT: "systems/ambersteel/module/components/button-send-to-chat/button-send-to-chat.hbs",
  COMPONENT_BUTTON_TOGGLE_VISIBILITY: "systems/ambersteel/module/components/button-toggle-visibility/button-toggle-visibility.hbs",
  // GM
  COMPONENT_GM_NOTES: "systems/ambersteel/templates/gm-notes.hbs",
  // Dice
  DICE_ROLL_CHAT_MESSAGE: "systems/ambersteel/templates/dice/roll.hbs",
  // --- Dialogs
  DIALOG_ROLL: "systems/ambersteel/templates/dialog/dialog-roll.hbs",
  DIALOG_ITEM_ADD: "systems/ambersteel/templates/dialog/dialog-add-item.hbs",
  DIALOG_VISIBILITY: "systems/ambersteel/templates/dialog/dialog-visibility.hbs",
  DIALOG_PLAIN: "systems/ambersteel/templates/dialog/dialog-plain.hbs",
  DIALOG_SELECT: "systems/ambersteel/templates/dialog/dialog-select.hbs",
  // --- Actor
  ACTOR_SHEET: "systems/ambersteel/templates/actor/actor-character-sheet.hbs",
  ACTOR_ATTRIBUTE_TABLE: "systems/ambersteel/templates/actor/components/component-attribute-table.hbs",
  ACTOR_SKILL_TABLE: "systems/ambersteel/templates/actor/components/component-skill-table.hbs",
  ACTOR_PERSONALS: "systems/ambersteel/templates/actor/parts/actor-personals.hbs",
  ACTOR_ATTRIBUTES: "systems/ambersteel/templates/actor/parts/actor-attributes.hbs",
  ACTOR_SKILLS: "systems/ambersteel/templates/actor/parts/actor-skills.hbs",
  ACTOR_BELIEFS: "systems/ambersteel/templates/actor/parts/actor-beliefs.hbs",
  ACTOR_FATE: "systems/ambersteel/templates/actor/parts/actor-fate.hbs",
  ACTOR_BELIEFS_FATE: "systems/ambersteel/templates/actor/parts/actor-beliefs-fate.hbs",
  ACTOR_HEALTH: "systems/ambersteel/templates/actor/parts/actor-health.hbs",
  ACTOR_ASSETS: "systems/ambersteel/templates/actor/parts/actor-assets.hbs",
  ACTOR_BIOGRAPHY: "systems/ambersteel/templates/actor/parts/actor-biography.hbs",
  // --- Item
  ITEM_SHEET: "systems/ambersteel/templates/item/item/item-item-sheet.hbs",
  ITEM_CHAT_MESSAGE: "systems/ambersteel/templates/item/item/item-item-chat-message.hbs",
  ITEM_LIST_ITEM: "systems/ambersteel/templates/item/item/item-list-item.hbs",
  // Skill
  SKILL_ITEM_SHEET: "systems/ambersteel/templates/item/skill/skill-item-sheet.hbs",
  SKILL_ITEM_CHAT_MESSAGE: "systems/ambersteel/templates/item/skill/skill-chat-message.hbs",
  SKILL_LIST_ITEM: "systems/ambersteel/templates/item/skill/skill-list-item.hbs",
  // Skill ability
  SKILL_ABILITY_TABLE: "systems/ambersteel/templates/item/skill-ability/skill-ability-table.hbs",
  SKILL_ABILITY_LIST_ITEM: "systems/ambersteel/templates/item/skill-ability/skill-ability-list-item.hbs",
  SKILL_ABILITY_CHAT_MESSAGE: "systems/ambersteel/templates/item/skill-ability/skill-ability-chat-message.hbs",
  // Fate
  FATE_CARD: "systems/ambersteel/templates/item/fate-card/fate-card.hbs",
  FATE_CARD_ITEM_SHEET: "systems/ambersteel/templates/item/fate-card/fate-card-item-sheet.hbs",
  // Injury
  INJURY_CHAT_MESSAGE: "systems/ambersteel/templates/item/injury/injury-chat-message.hbs",
  INJURY_ITEM_SHEET: "systems/ambersteel/templates/item/injury/injury-item-sheet.hbs",
  INJURY_LIST_ITEM: "systems/ambersteel/templates/item/injury/injury-list-item.hbs",
  // Illness
  ILLNESS_CHAT_MESSAGE: "systems/ambersteel/templates/item/illness/illness-chat-message.hbs",
  ILLNESS_ITEM_SHEET: "systems/ambersteel/templates/item/illness/illness-item-sheet.hbs",
  ILLNESS_LIST_ITEM: "systems/ambersteel/templates/item/illness/illness-list-item.hbs",
}

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  const templateArr = [];
  for (const propertyName in TEMPLATES) {
    templateArr.push(TEMPLATES[propertyName]);
  }
  return loadTemplates(templateArr);
};
