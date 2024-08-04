/**
 * String partial `"systems/strive"`. 
 * 
 * @type {String}
 * @constant
 */
const basePath = "systems/strive";

/**
 * String partial `"systems/strive/presentation"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathPresentation = `${basePath}/presentation`;

/**
 * String partial `"systems/strive/presentation/component"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathComponent = `${basePathPresentation}/component`;

export const TEMPLATES = {
  // --- Components
  COMPONENT_VERTICAL_LINE: `${basePathComponent}/vertical-line/vertical-line.hbs`,
  // Labels
  COMPONENT_LABEL: `${basePathComponent}/label/label.hbs`,
  COMPONENT_LABEL_READ_ONLY_VALUE: `${basePathComponent}/label/read-only-value.hbs`,
  COMPONENT_LABEL_ADMONISHING_READ_ONLY_VALUE: `${basePathComponent}/label/admonishing-read-only-value.hbs`,
  COMPONENT_HEADER_PRIMARY: `${basePathComponent}/label/header/primary-header-label.hbs`,
  COMPONENT_HEADER_SECONDARY: `${basePathComponent}/label/header/secondary-header-label.hbs`,
  COMPONENT_HEADER_TERTIARY: `${basePathComponent}/label/header/tertiary-header-label.hbs`,
  COMPONENT_LABELED_CONTROL: `${basePathComponent}/labeled-control/labeled-control.hbs`,
  // Inputs
  COMPONENT_INPUT_TEXTFIELD: `${basePathComponent}/input-textfield/input-textfield.hbs`,
  COMPONENT_INPUT_DROPDOWN: `${basePathComponent}/input-choice/input-dropdown/input-dropdown.hbs`,
  COMPONENT_INPUT_RADIO_BUTTON_GROUP: `${basePathComponent}/input-choice/input-radio-button-group/input-radio-button-group.hbs`,
  COMPONENT_INPUT_NUMBER_SPINNER: `${basePathComponent}/input-number-spinner/input-number-spinner.hbs`,
  COMPONENT_INPUT_TEXTAREA: `${basePathComponent}/input-textarea/input-textarea.hbs`,
  COMPONENT_INPUT_IMAGE: `${basePathComponent}/input-image/input-image.hbs`,
  COMPONENT_INPUT_RICH_TEXT: `${basePathComponent}/input-rich-text/input-rich-text.hbs`,
  COMPONENT_INPUT_SEARCH: `${basePathComponent}/input-search/input-search.hbs`,
  COMPONENT_INPUT_SLIDER: `${basePathComponent}/input-slider/input-slider.hbs`,
  COMPONENT_INPUT_TAGS: `${basePathComponent}/input-tags/input-tags.hbs`,
  COMPONENT_INPUT_TAG: `${basePathComponent}/input-tags/input-tag-pill.hbs`,
  COMPONENT_INPUT_TOGGLE: `${basePathComponent}/input-toggle/input-toggle.hbs`,
  // Buttons
  COMPONENT_BUTTON: `${basePathComponent}/button/button.hbs`,
  COMPONENT_BUTTON_CHECKBOX: `${basePathComponent}/button-checkbox/button-checkbox.hbs`,
  // Composite
  COMPONENT_SORTABLE_LIST: `${basePathComponent}/sortable-list/sortable-list.hbs`,
  COMPONENT_SORT_CONTROLS: `${basePathComponent}/sort-controls/sort-controls.hbs`,
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
  COMPONENT_HINT_CARD: `${basePathComponent}/hint-card/hint-card.hbs`,
  // GM
  COMPONENT_GM_NOTES: `${basePathComponent}/section-gm-notes/section-gm-notes.hbs`,
  // Dice
  DICE_ROLL_CHAT_MESSAGE: `${basePathPresentation}/dice/roll.hbs`,
  // --- Dialogs
  DIALOG_MODAL: `${basePathPresentation}/dialog/modal-dialog/modal-dialog.hbs`,
  DIALOG_PLAIN: `${basePathPresentation}/dialog/plain-dialog/plain-dialog.hbs`,
  DIALOG_PLAIN_CONFIRMABLE: `${basePathPresentation}/dialog/plain-confirmable-dialog/plain-confirmable-dialog.hbs`,
  DIALOG_SINGLE_CHOICE: `${basePathPresentation}/dialog/single-choice-dialog/single-choice-dialog.hbs`,
  DIALOG_MIGRATOR: `${basePathPresentation}/dialog/migrator-dialog/migrator-dialog.hbs`,
  DIALOG_DYNAMIC_INPUT: `${basePathPresentation}/dialog/dynamic-input-dialog/dynamic-input-dialog.hbs`,
  DIALOG_DICE_POOL_DESIGNER: `${basePathPresentation}/dialog/dice-pool-designer-dialog/dice-pool-designer-dialog.hbs`,
  // --- Settings Dialogs
  DIALOG_SETTINGS_HEALTH_STATES: `${basePathPresentation}/dialog/settings/health-states/health-states-settings-dialog.hbs`,
  CUSTOM_HEALTH_STATE_LIST_ITEM: `${basePathPresentation}/dialog/settings/health-states/custom-health-state-list-item.hbs`,
  // --- Actor
  ACTOR_SHEET: `${basePathPresentation}/sheet/actor/actor-sheet.hbs`,
  ACTOR_PERSONALS: `${basePathPresentation}/sheet/actor/part/actor-personals.hbs`,
  ACTOR_PERSONALITY_TRAITS: `${basePathPresentation}/sheet/actor/part/personality/personality-traits/personality-traits.hbs`,
  ACTOR_ATTRIBUTE_TABLE: `${basePathPresentation}/sheet/actor/part/abilities/actor-attribute-table.hbs`,
  ACTOR_ATTRIBUTES: `${basePathPresentation}/sheet/actor/part/abilities/actor-attributes.hbs`,
  ACTOR_SKILLS: `${basePathPresentation}/sheet/actor/part/abilities/actor-skills.hbs`,
  ACTOR_DRIVERS: `${basePathPresentation}/sheet/actor/part/personality/actor-drivers.hbs`,
  ACTOR_FATE: `${basePathPresentation}/sheet/actor/part/actor-fate.hbs`,
  ACTOR_PERSONALITY: `${basePathPresentation}/sheet/actor/part/personality/actor-personality.hbs`,
  ACTOR_HEALTH: `${basePathPresentation}/sheet/actor/part/health/actor-health.hbs`,
  ACTOR_HEALTH_STATES: `${basePathPresentation}/sheet/actor/part/health/actor-health-states.hbs`,
  ACTOR_HEALTH_STATES_LIST_ITEM: `${basePathPresentation}/sheet/actor/part/health/actor-health-states-list-item.hbs`,
  ACTOR_GRIT_POINTS: `${basePathPresentation}/sheet/actor/part/health/grit-points/grit-points.hbs`,
  ACTOR_ASSETS: `${basePathPresentation}/sheet/actor/part/assets/actor-assets.hbs`,
  ACTOR_ASSETS_EQUIPPED: `${basePathPresentation}/sheet/actor/part/assets/actor-assets-equipped.hbs`,
  ACTOR_ASSET_SLOT_GROUP: `${basePathPresentation}/sheet/actor/part/assets/actor-asset-slot-group.hbs`,
  ACTOR_ASSET_SLOT: `${basePathPresentation}/sheet/actor/part/assets/actor-asset-slot.hbs`,
  ACTOR_BIOGRAPHY: `${basePathPresentation}/sheet/actor/part/actor-biography.hbs`,
  ACTOR_CHAT_MESSAGE: `${basePathPresentation}/sheet/actor/actor-chat-message.hbs`,
  CHALLENGE_RATING: `${basePathPresentation}/sheet/actor/part/abilities/challenge-rating.hbs`,
  // --- Item
  // Base
  BASE_LIST_ITEM: `${basePathPresentation}/sheet/item/base/base-list-item.hbs`,
  BASE_ITEM_SHEET: `${basePathPresentation}/sheet/item/base/base-item-sheet.hbs`,
  // Asset
  ASSET_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/asset/asset-item-chat-message.hbs`,
  ASSET_LIST_ITEM_EXTRA_HEADER: `${basePathPresentation}/sheet/item/asset/asset-list-item-extra-header.hbs`,
  // Skill
  SKILL_ITEM_SHEET_EXTRA_CONTENT: `${basePathPresentation}/sheet/item/skill/skill-item-sheet-extra-content.hbs`,
  SKILL_ITEM_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/skill/skill-chat-message.hbs`,
  SKILL_LIST_ITEM_EXTRA_CONTENT: `${basePathPresentation}/sheet/item/skill/skill-list-item-extra-content.hbs`,
  SKILL_LIST_ITEM_EXTRA_HEADER: `${basePathPresentation}/sheet/item/skill/skill-list-item-extra-header.hbs`,
  SKILL_PREREQUISITE_LIST_ITEM: `${basePathPresentation}/sheet/item/skill/skill-prerequisite-list-item.hbs`,
  SKILL_BASE_ATTRIBUTE_LIST_ITEM: `${basePathPresentation}/sheet/item/skill/base-attribute/base-attribute-list-item.hbs`,
  // Expertise
  EXPERTISE_TABLE: `${basePathPresentation}/sheet/item/expertise/expertise-table.hbs`,
  EXPERTISE_LIST_ITEM_EXTRA_CONTENT: `${basePathPresentation}/sheet/item/expertise/expertise-list-item-extra-content.hbs`,
  EXPERTISE_LIST_ITEM_EXTRA_HEADER: `${basePathPresentation}/sheet/item/expertise/expertise-list-item-extra-header.hbs`,
  EXPERTISE_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/expertise/expertise-chat-message.hbs`,
  // Fate
  FATE_CARD: `${basePathPresentation}/sheet/item/fate-card/fate-card.hbs`,
  FATE_CARD_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/fate-card/fate-card-chat-message.hbs`,
  // Injury
  INJURY_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/injury/injury-chat-message.hbs`,
  // Illness
  ILLNESS_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/illness/illness-chat-message.hbs`,
  ILLNESS_LIST_ITEM_EXTRA_HEADER: `${basePathPresentation}/sheet/item/illness/illness-list-item-extra-header.hbs`,
  // Mutation
  MUTATION_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/mutation/mutation-chat-message.hbs`,
  // Mutation
  SCAR_CHAT_MESSAGE: `${basePathPresentation}/sheet/item/scar/scar-chat-message.hbs`,
  // UI
  COMBAT_TRACKER: `${basePathPresentation}/combat/combat-tracker.hbs`,
  COMBAT_TRACKER_ACTION_POINTS: `${basePathPresentation}/combat/combat-tracker-action-points.hbs`,
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
