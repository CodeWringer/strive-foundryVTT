/**
 * @property {String} DROP_DOWN A drop-down that allows picking a single item from a list. 
 * * `specificArgs`: 
 * * * `options: {Array<ChoiceOption>}` The options available to the drop-down. 
 * @property {String} IMAGE Displays and allows picking an image. 
 * @property {String} NUMBER_SPINNER Provides only numeric input, with buttons for easy 
 * incrementation and decrementation. 
 * * `specificArgs`: 
 * * * `min: {Number | undefined}` Optional. The minimum value. 
 * * * `max: {Number | undefined}` Optional. The maximum value. 
 * * * `step: {Number | undefined}` Optional. The increment/decrement step size. 
 * @property {String} RADIO_BUTTONS A radio button group that allows picking a single item 
 * from a list. 
 * * `specificArgs`: 
 * * * `options: {Array<StatefulChoiceOption>}` The options available to the radio button group. 
 * @property {String} RICH_TEXT Allows a user to enter multiple lines of richly formatted text. 
 * @property {String} TEXTAREA Allows a user to enter multiple lines of unformatted text. 
 * * `specificArgs`: 
 * * * `spellcheck: {Boolean | undefined}` Optional. Sets whether spell checking is enabled. 
 * * * `placeholder: {String | undefined}` Optional. Sets a placeholder text to display while the textfield is empty. 
 * @property {String} TEXTFIELD Allows a user to enter a single line of unformatted text. 
 * * `specificArgs`: 
 * * * `placeholder: {String | undefined}` Optional. A placeholder text to display while the textfield is empty. 
 * @property {String} LABEL Allows no input to be made. Is used only to display information to the user. 
 * @property {String} SIMPLE_LIST Allows editing a dynamic number of entries in a list. 
 * * The `defaultValue` is expected to be the list of values. For example, this could be 
 * a list of attributes. 
 * * `specificArgs`: 
 * * * `contentItemTemplate: {String}` 
 * * * `contentItemViewModelFactory: {Function}` The factory function used to get view model 
 * instances. Receives the current index as first and the values array as second argument. 
 * Is expected to return a new view model instance. 
 * * * `newItemDefaultValue: {Any}` 
 * * * `isItemAddable: {Boolean | undefined}` 
 * * * `isItemRemovable: {Boolean | undefined}` 
 * * * `localizedAddLabel: {String | undefined}` 
 * @property {String} TOGGLE Toggles a boolean value. 
 * @property {String} CUSTOM
 * * `specificArgs`: 
 * * * `viewModelFactory: {Function}` - Must return a `ViewModel` instance. Receives the following arguments:
 * * * * `id: String`
 * * * * `parent: ViewModel`
 * * * * `value: Any | undefined`
 * * * * `furtherArgs: Object`
 * * * `furtherArgs: {Object}` - Passed to the `viewModelFactory`, to allow further, custom args 
 * to be processed. 
 * * * `template: {String}` 
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
  LABEL: "LABEL",
  SIMPLE_LIST: "SIMPLE_LIST",
  TOGGLE: "TOGGLE",
  CUSTOM: "CUSTOM",
}