/**
 * @property {String} DROP_DOWN A drop-down. 
 * * `specificArgs`: 
 * * * `options: {Array<ChoiceOption>}` The options available to the drop-down. 
 * * * `adapter: {ChoiceAdapter}` A `ChoiceOption` adapter. 
 * @property {String} IMAGE
 * @property {String} NUMBER_SPINNER
 * * `specificArgs`: 
 * * * `min: {Number | undefined}` Optional. The minimum value. 
 * * * `max: {Number | undefined}` Optional. The maximum value. 
 * * * `step: {Number | undefined}` Optional. The increment/decrement step size. 
 * @property {String} RADIO_BUTTONS A radio button group.
 * * `specificArgs`: 
 * * * `options: {Array<StatefulChoiceOption>}` The options available to the radio button group. 
 * @property {String} RICH_TEXT
 * @property {String} TEXTAREA
 * * `specificArgs`: 
 * * * `spellcheck: {Boolean | undefined}` Optional. Sets whether spell checking is enabled. 
 * * * `placeholder: {String | undefined}` Optional. Sets a placeholder text to display while the textfield is empty. 
 * @property {String} TEXTFIELD
 * * `specificArgs`: 
 * * * `placeholder: {String | undefined}` Optional. A placeholder text to display while the textfield is empty. 
 * 
 * @constant
 */
export const DYNAMIC_INPUT_TYPES = {
  DROP_DOWN: "DROP_DOWN",
  IMAGE: "IMAGE",
  NUMBER_SPINNER: "NUMBER_SPINNER",
  RADIO_BUTTONS: "RADIO_BUTTONS",
  RICH_TEXT: "RICH_TEXT",
  TEXTAREA: "TEXTAREA",
  TEXTFIELD: "TEXTFIELD",
}