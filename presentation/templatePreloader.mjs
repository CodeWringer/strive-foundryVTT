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
  // Labels
  COMPONENT_LABEL: `${basePathComponent}/label/label.hbs`,
  COMPONENT_LABEL_READ_ONLY_VALUE: `${basePathComponent}/label/read-only-value.hbs`,
  COMPONENT_HEADER_PRIMARY: `${basePathComponent}/label/header/primary-header-label.hbs`,
  COMPONENT_HEADER_SECONDARY: `${basePathComponent}/label/header/secondary-header-label.hbs`,
  COMPONENT_HEADER_TERTIARY: `${basePathComponent}/label/header/tertiary-header-label.hbs`,
  // Inputs
  COMPONENT_INPUT_TEXTFIELD: `${basePathComponent}/input-textfield/input-textfield.hbs`,
  COMPONENT_INPUT_DROPDOWN: `${basePathComponent}/input-dropdown/input-dropdown.hbs`,
  COMPONENT_INPUT_NUMBER_SPINNER: `${basePathComponent}/input-number-spinner/input-number-spinner.hbs`,
  COMPONENT_INPUT_TEXTAREA: `${basePathComponent}/input-textarea/input-textarea.hbs`,
  COMPONENT_INPUT_RADIO_BUTTON_GROUP: `${basePathComponent}/input-radio-button-group/input-radio-button-group.hbs`,
  COMPONENT_INPUT_IMAGE: `${basePathComponent}/input-image/input-image.hbs`,
  COMPONENT_INPUT_RICH_TEXT: `${basePathComponent}/input-rich-text/input-rich-text.hbs`,
  COMPONENT_INPUT_PROPERTIES: `${basePathComponent}/input-properties/input-properties.hbs`,
  COMPONENT_INPUT_PROPERTY_PILL: `${basePathComponent}/input-properties/input-property-pill.hbs`,
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
  COMPONENT_BUTTON_TOGGLE_ICON: `${basePathComponent}/button-toggle-icon/button-toggle-icon.hbs`,
  COMPONENT_BUTTON_CONTEXT_MENU: `${basePathComponent}/button-context-menu/button-context-menu.hbs`,
  // Composite
  COMPONENT_SORTABLE_LIST: `${basePathComponent}/sortable-list/sortable-list.hbs`,
  COMPONENT_SIMPLE_LIST: `${basePathComponent}/simple-list/simple-list.hbs`,
  COMPONENT_SIMPLE_LIST_ITEM: `${basePathComponent}/simple-list/simple-list-item.hbs`,
  DICE_ROLL_LIST: `${basePathComponent}/dice-roll-list/dice-roll-list.hbs`,
  COMPONENT_DAMAGE_DEFINITION_LIST_ITEM: `${basePathComponent}/damage-definition-list/damage-definition-list-item.hbs`,
  COMPONENT_DAMAGE_DEFINITION_LIST: `${basePathComponent}/damage-definition-list/damage-definition-list.hbs`,
  DICE_ROLL_DAMAGE_CHAT_MESSAGE: `${basePathComponent}/damage-definition-list/damage-roll-chat-message.hbs`,
  COMPONENT_LAZY_LOAD: `${basePathComponent}/lazy-load/lazy-load.hbs`,
  COMPONENT_LAZY_LOAD_RICH_TEXT: `${basePathComponent}/lazy-rich-text/lazy-rich-text.hbs`,
  COMPONENT_VISIBILITY_TOGGLE_LIST: `${basePathComponent}/visibility-toggle-list/visibility-toggle-list.hbs`,
  COMPONENT_VISIBILITY_TOGGLE_LIST_ITEM: `${basePathComponent}/visibility-toggle-list/visibility-toggle-list-item.hbs`,
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
  DIALOG_DYNAMIC_INPUT: `${basePathPresentation}/dialog/dynamic-input-dialog/dynamic-input-dialog.hbs`,
  // --- Settings Dialogs
  DIALOG_SETTINGS_HEALTH_STATES: `${basePathPresentation}/dialog/settings/health-states/health-states-settings-dialog.hbs`,
  CUSTOM_HEALTH_STATE_LIST_ITEM: `${basePathPresentation}/dialog/settings/health-states/custom-health-state-list-item.hbs`,
  // --- Actor
  ACTOR_SHEET: `${basePathPresentation}/sheet/actor/actor-sheet.hbs`,
  ACTOR_PERSONALS: `${basePathPresentation}/sheet/actor/part/actor-personals.hbs`,
  ACTOR_ATTRIBUTE_TABLE: `${basePathPresentation}/sheet/actor/part/abilities/actor-attribute-table.hbs`,
  ACTOR_ATTRIBUTES: `${basePathPresentation}/sheet/actor/part/abilities/actor-attributes.hbs`,
  ACTOR_SKILLS: `${basePathPresentation}/sheet/actor/part/abilities/actor-skills.hbs`,
  ACTOR_BELIEFS: `${basePathPresentation}/sheet/actor/part/actor-beliefs.hbs`,
  ACTOR_FATE: `${basePathPresentation}/sheet/actor/part/actor-fate.hbs`,
  ACTOR_BELIEFS_FATE: `${basePathPresentation}/sheet/actor/part/actor-beliefs-fate.hbs`,
  ACTOR_HEALTH: `${basePathPresentation}/sheet/actor/part/health/actor-health.hbs`,
  ACTOR_HEALTH_STATES: `${basePathPresentation}/sheet/actor/part/health/actor-health-states.hbs`,
  ACTOR_HEALTH_STATES_LIST_ITEM: `${basePathPresentation}/sheet/actor/part/health/actor-health-states-list-item.hbs`,
  ACTOR_ASSETS: `${basePathPresentation}/sheet/actor/part/assets/actor-assets.hbs`,
  ACTOR_ASSETS_EQUIPPED: `${basePathPresentation}/sheet/actor/part/assets/actor-assets-equipped.hbs`,
  ACTOR_ASSET_SLOT_GROUP: `${basePathPresentation}/sheet/actor/part/assets/actor-asset-slot-group.hbs`,
  ACTOR_ASSET_SLOT: `${basePathPresentation}/sheet/actor/part/assets/actor-asset-slot.hbs`,
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
  // Mutation
  SCAR_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/scar/scar-chat-message.hbs`,
  SCAR_ITEM_SHEET: `${basePathPresentation}/sheet/item/scar/scar-item-sheet.hbs`,
  SCAR_LIST_ITEM: `${basePathPresentation}/sheet/item/scar/scar-list-item.hbs`,
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
