export const TEMPLATES = {
  // --- Components
  // Inputs
  COMPONENT_INPUT_TEXTFIELD: "systems/ambersteel/presentation/component/input-textfield/input-textfield.hbs",
  COMPONENT_INPUT_DROPDOWN: "systems/ambersteel/presentation/component/input-dropdown/input-dropdown.hbs",
  COMPONENT_INPUT_NUMBER_SPINNER: "systems/ambersteel/presentation/component/input-number-spinner/input-number-spinner.hbs",
  COMPONENT_INPUT_TEXTAREA: "systems/ambersteel/presentation/component/input-textarea/input-textarea.hbs",
  COMPONENT_INPUT_RADIO_BUTTON_GROUP: "systems/ambersteel/presentation/component/input-radio-button-group/input-radio-button-group.hbs",
  COMPONENT_INPUT_LABEL: "systems/ambersteel/presentation/component/label/label.hbs",
  COMPONENT_INPUT_ITEM_GRID_VIEW: "systems/ambersteel/presentation/component/item-grid/item-grid-view.hbs",
  COMPONENT_INPUT_IMAGE: "systems/ambersteel/presentation/component/input-image/input-image.hbs",
  COMPONENT_INPUT_RICH_TEXT: "systems/ambersteel/presentation/component/input-rich-text/input-rich-text.hbs",
  // Buttons
  COMPONENT_BUTTON: "systems/ambersteel/presentation/component/button/button.hbs",
  COMPONENT_BUTTON_ADD: "systems/ambersteel/presentation/component/button-add/button-add.hbs",
  COMPONENT_BUTTON_DELETE: "systems/ambersteel/presentation/component/button-delete/button-delete.hbs",
  COMPONENT_BUTTON_OPEN_SHEET: "systems/ambersteel/presentation/component/button-open-sheet/button-open-sheet.hbs",
  COMPONENT_BUTTON_ROLL: "systems/ambersteel/presentation/component/button-roll/button-roll.hbs",
  COMPONENT_BUTTON_SEND_TO_CHAT: "systems/ambersteel/presentation/component/button-send-to-chat/button-send-to-chat.hbs",
  COMPONENT_BUTTON_TOGGLE_VISIBILITY: "systems/ambersteel/presentation/component/button-toggle-visibility/button-toggle-visibility.hbs",
  COMPONENT_BUTTON_TAKE_ITEM: "systems/ambersteel/presentation/component/button-take-item/button-take-item.hbs",
  COMPONENT_BUTTON_TOGGLE: "systems/ambersteel/presentation/component/button-toggle/button-toggle.hbs",
  COMPONENT_BUTTON_CONTEXT_MENU: "systems/ambersteel/presentation/component/button-context-menu/button-context-menu.hbs",
  // Composite
  COMPONENT_SORTABLE_LIST: "systems/ambersteel/presentation/component/sortable-list/sortable-list.hbs",
  // GM
  COMPONENT_GM_NOTES: "systems/ambersteel/presentation/component/section-gm-notes/section-gm-notes.hbs",
  // Dice
  DICE_ROLL_CHAT_MESSAGE: "systems/ambersteel/presentation/template/dice/roll.hbs",
  DICE_ROLL_DAMAGE_CHAT_MESSAGE: "systems/ambersteel/presentation/template/dice/roll-damage-chat-message.hbs",
  // --- Dialogs
  DIALOG_MODAL: "systems/ambersteel/presentation/dialog/modal-dialog/modal-dialog.hbs",
  DIALOG_ROLL: "systems/ambersteel/presentation/dialog/dialog-roll/dialog-roll.hbs",
  DIALOG_VISIBILITY: "systems/ambersteel/presentation/dialog/dialog-visibility/dialog-visibility.hbs",
  DIALOG_PLAIN: "systems/ambersteel/presentation/dialog/dialog-plain/dialog-plain.hbs",
  DIALOG_SELECT: "systems/ambersteel/presentation/dialog/dialog-select/dialog-select.hbs",
  DIALOG_ITEM_ADD: "systems/ambersteel/presentation/dialog/dialog-item-add/dialog-item-add.hbs",
  DIALOG_MIGRATOR: "systems/ambersteel/presentation/dialog/dialog-migrator/dialog-migrator.hbs",
  // --- Actor
  ACTOR_SHEET: "systems/ambersteel/presentation/template/actor/actor-sheet.hbs",
  ACTOR_ATTRIBUTE_TABLE: "systems/ambersteel/presentation/template/actor/component/component-attribute-table.hbs",
  ACTOR_PERSONALS: "systems/ambersteel/presentation/template/actor/part/actor-personals.hbs",
  ACTOR_ATTRIBUTES: "systems/ambersteel/presentation/template/actor/part/actor-attributes.hbs",
  ACTOR_SKILLS: "systems/ambersteel/presentation/template/actor/part/actor-skills.hbs",
  ACTOR_BELIEFS: "systems/ambersteel/presentation/template/actor/part/actor-beliefs.hbs",
  ACTOR_FATE: "systems/ambersteel/presentation/template/actor/part/actor-fate.hbs",
  ACTOR_BELIEFS_FATE: "systems/ambersteel/presentation/template/actor/part/actor-beliefs-fate.hbs",
  ACTOR_HEALTH: "systems/ambersteel/presentation/template/actor/part/actor-health.hbs",
  ACTOR_ASSETS: "systems/ambersteel/presentation/template/actor/part/actor-assets.hbs",
  ACTOR_BIOGRAPHY: "systems/ambersteel/presentation/template/actor/part/actor-biography.hbs",
  ACTOR_CHAT_MESSAGE: "systems/ambersteel/presentation/template/actor/actor-chat-message.hbs",
  // --- Item
  ITEM_SHEET: "systems/ambersteel/presentation/template/item/item/item-item-sheet.hbs",
  ITEM_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/item/item-item-chat-message.hbs",
  ITEM_LIST_ITEM: "systems/ambersteel/presentation/template/item/item/item-list-item.hbs",
  // Skill
  SKILL_ITEM_SHEET: "systems/ambersteel/presentation/template/item/skill/skill-item-sheet.hbs",
  SKILL_ITEM_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/skill/skill-chat-message.hbs",
  SKILL_LIST_ITEM: "systems/ambersteel/presentation/template/item/skill/skill-list-item.hbs",
  // Skill ability
  SKILL_ABILITY_TABLE: "systems/ambersteel/presentation/template/item/skill-ability/skill-ability-table.hbs",
  SKILL_ABILITY_LIST_ITEM: "systems/ambersteel/presentation/template/item/skill-ability/skill-ability-list-item.hbs",
  SKILL_ABILITY_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/skill-ability/skill-ability-chat-message.hbs",
  // Fate
  FATE_CARD: "systems/ambersteel/presentation/template/item/fate-card/fate-card.hbs",
  FATE_CARD_ITEM_SHEET: "systems/ambersteel/presentation/template/item/fate-card/fate-card-item-sheet.hbs",
  FATE_CARD_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/fate-card/fate-card-chat-message.hbs",
  // Injury
  INJURY_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/injury/injury-chat-message.hbs",
  INJURY_ITEM_SHEET: "systems/ambersteel/presentation/template/item/injury/injury-item-sheet.hbs",
  INJURY_LIST_ITEM: "systems/ambersteel/presentation/template/item/injury/injury-list-item.hbs",
  // Illness
  ILLNESS_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/illness/illness-chat-message.hbs",
  ILLNESS_ITEM_SHEET: "systems/ambersteel/presentation/template/item/illness/illness-item-sheet.hbs",
  ILLNESS_LIST_ITEM: "systems/ambersteel/presentation/template/item/illness/illness-list-item.hbs",
  // Mutation
  MUTATION_CHAT_MESSAGE: "systems/ambersteel/presentation/template/item/mutation/mutation-chat-message.hbs",
  MUTATION_ITEM_SHEET: "systems/ambersteel/presentation/template/item/mutation/mutation-item-sheet.hbs",
  MUTATION_LIST_ITEM: "systems/ambersteel/presentation/template/item/mutation/mutation-list-item.hbs",
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
