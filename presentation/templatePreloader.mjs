/**
 * String partial `"systems/ambersteel"`. 
 * 
 * @type {String}
 * @constant
 */
const basePath = "systems/ambersteel";

/**
 * String partial `"systems/ambersteel/presentation"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathPresentation = `${basePath}/presentation`;

/**
 * String partial `"systems/ambersteel/presentation/component"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathComponent = `${basePathPresentation}/component`;

export const TEMPLATES = {
  // --- Components
  // Inputs
  COMPONENT_INPUT_TEXTFIELD: `${basePathComponent}/input-textfield/input-textfield.hbs`,
  COMPONENT_INPUT_DROPDOWN: `${basePathComponent}/input-dropdown/input-dropdown.hbs`,
  COMPONENT_INPUT_NUMBER_SPINNER: `${basePathComponent}/input-number-spinner/input-number-spinner.hbs`,
  COMPONENT_INPUT_TEXTAREA: `${basePathComponent}/input-textarea/input-textarea.hbs`,
  COMPONENT_INPUT_RADIO_BUTTON_GROUP: `${basePathComponent}/input-radio-button-group/input-radio-button-group.hbs`,
  COMPONENT_INPUT_LABEL: `${basePathComponent}/label/label.hbs`,
  COMPONENT_INPUT_ITEM_GRID_VIEW: `${basePathComponent}/item-grid/item-grid-view.hbs`,
  COMPONENT_INPUT_IMAGE: `${basePathComponent}/input-image/input-image.hbs`,
  COMPONENT_INPUT_RICH_TEXT: `${basePathComponent}/input-rich-text/input-rich-text.hbs`,
  // Buttons
  COMPONENT_BUTTON: `${basePathComponent}/button/button.hbs`,
  COMPONENT_BUTTON_ADD: `${basePathComponent}/button-add/button-add.hbs`,
  COMPONENT_BUTTON_DELETE: `${basePathComponent}/button-delete/button-delete.hbs`,
  COMPONENT_BUTTON_OPEN_SHEET: `${basePathComponent}/button-open-sheet/button-open-sheet.hbs`,
  COMPONENT_BUTTON_ROLL: `${basePathComponent}/button-roll/button-roll.hbs`,
  COMPONENT_BUTTON_SEND_TO_CHAT: `${basePathComponent}/button-send-to-chat/button-send-to-chat.hbs`,
  COMPONENT_BUTTON_TOGGLE_VISIBILITY: `${basePathComponent}/button-toggle-visibility/button-toggle-visibility.hbs`,
  COMPONENT_BUTTON_TAKE_ITEM: `${basePathComponent}/button-take-item/button-take-item.hbs`,
  COMPONENT_BUTTON_TOGGLE: `${basePathComponent}/button-toggle/button-toggle.hbs`,
  COMPONENT_BUTTON_CONTEXT_MENU: `${basePathComponent}/button-context-menu/button-context-menu.hbs`,
  // Composite
  COMPONENT_SORTABLE_LIST: `${basePathComponent}/sortable-list/sortable-list.hbs`,
  // GM
  COMPONENT_GM_NOTES: `${basePathComponent}/section-gm-notes/section-gm-notes.hbs`,
  // Dice
  DICE_ROLL_CHAT_MESSAGE: `${basePathPresentation}/dice/roll.hbs`,
  // --- Dialogs
  DIALOG_MODAL: `${basePathPresentation}/dialog/modal-dialog/modal-dialog.hbs`,
  DIALOG_ROLL: `${basePathPresentation}/dialog/roll-dialog/roll-dialog.hbs`,
  DIALOG_PLAIN: `${basePathPresentation}/dialog/plain-dialog/plain-dialog.hbs`,
  DIALOG_PLAIN_CONFIRMABLE: `${basePathPresentation}/dialog/plain-confirmable-dialog/plain-confirmable-dialog.hbs`,
  DIALOG_SINGLE_CHOICE: `${basePathPresentation}/dialog/single-choice-dialog/single-choice-dialog.hbs`,
  DIALOG_ITEM_ADD: `${basePathPresentation}/dialog/dialog-item-add/dialog-item-add.hbs`,
  DIALOG_MIGRATOR: `${basePathPresentation}/dialog/migrator-dialog/migrator-dialog.hbs`,
  // --- Actor
  ACTOR_SHEET: `${basePathPresentation}/sheet/actor/actor-sheet.hbs`,
  ACTOR_ATTRIBUTE_TABLE: `${basePathPresentation}/sheet/actor/part/actor-attribute-table.hbs`,
  ACTOR_PERSONALS: `${basePathPresentation}/sheet/actor/part/actor-personals.hbs`,
  ACTOR_ATTRIBUTES: `${basePathPresentation}/sheet/actor/part/actor-attributes.hbs`,
  ACTOR_SKILLS: `${basePathPresentation}/sheet/actor/part/actor-skills.hbs`,
  ACTOR_BELIEFS: `${basePathPresentation}/sheet/actor/part/actor-beliefs.hbs`,
  ACTOR_FATE: `${basePathPresentation}/sheet/actor/part/actor-fate.hbs`,
  ACTOR_BELIEFS_FATE: `${basePathPresentation}/sheet/actor/part/actor-beliefs-fate.hbs`,
  ACTOR_HEALTH: `${basePathPresentation}/sheet/actor/part/actor-health.hbs`,
  ACTOR_ASSETS: `${basePathPresentation}/sheet/actor/part/actor-assets.hbs`,
  ACTOR_BIOGRAPHY: `${basePathPresentation}/sheet/actor/part/actor-biography.hbs`,
  ACTOR_CHAT_MESSAGE: `${basePathPresentation}/sheet/actor/actor-chat-message.hbs`,
  // --- Item
  // Asset
  ASSET_SHEET: `${basePathPresentation}/sheet/item/asset/asset-item-sheet.hbs`,
  ASSET_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/asset/asset-item-chat-message.hbs`,
  ASSET_LIST_ITEM: `${basePathPresentation}/sheet/item/asset/asset-list-item.hbs`,
  // Skill
  SKILL_ITEM_SHEET: `${basePathPresentation}/sheet/item/skill/skill-item-sheet.hbs`,
  SKILL_ITEM_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/skill/skill-chat-message.hbs`,
  SKILL_LIST_ITEM: `${basePathPresentation}/sheet/item/skill/skill-list-item.hbs`,
  // Skill ability
  SKILL_ABILITY_TABLE: `${basePathPresentation}/sheet/item/skill-ability/skill-ability-table.hbs`,
  SKILL_ABILITY_LIST_ITEM: `${basePathPresentation}/sheet/item/skill-ability/skill-ability-list-item.hbs`,
  SKILL_ABILITY_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/skill-ability/skill-ability-chat-message.hbs`,
  DICE_ROLL_DAMAGE_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/skill-ability/roll-damage-chat-message.hbs`,
  // Fate
  FATE_CARD: `${basePathPresentation}/sheet/item/fate-card/fate-card.hbs`,
  FATE_CARD_ITEM_SHEET: `${basePathPresentation}/sheet/item/fate-card/fate-card-item-sheet.hbs`,
  FATE_CARD_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/fate-card/fate-card-chat-message.hbs`,
  // Injury
  INJURY_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/injury/injury-chat-message.hbs`,
  INJURY_ITEM_SHEET: `${basePathPresentation}/sheet/item/injury/injury-item-sheet.hbs`,
  INJURY_LIST_ITEM: `${basePathPresentation}/sheet/item/injury/injury-list-item.hbs`,
  // Illness
  ILLNESS_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/illness/illness-chat-message.hbs`,
  ILLNESS_ITEM_SHEET: `${basePathPresentation}/sheet/item/illness/illness-item-sheet.hbs`,
  ILLNESS_LIST_ITEM: `${basePathPresentation}/sheet/item/illness/illness-list-item.hbs`,
  // Mutation
  MUTATION_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/mutation/mutation-chat-message.hbs`,
  MUTATION_ITEM_SHEET: `${basePathPresentation}/sheet/item/mutation/mutation-item-sheet.hbs`,
  MUTATION_LIST_ITEM: `${basePathPresentation}/sheet/item/mutation/mutation-list-item.hbs`,
}

/**
 * Returns the pre-loaded Handlebars templates, for fast access when rendering. 
 * 
 * @return {Any}
 * 
 * @async
 */
 export async function preloadHandlebarsTemplates() {
  const templateArr = [];
  for (const propertyName in TEMPLATES) {
    templateArr.push(TEMPLATES[propertyName]);
  }
  return await loadTemplates(templateArr);
};
