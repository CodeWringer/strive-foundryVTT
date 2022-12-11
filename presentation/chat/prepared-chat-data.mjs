/**
 * Represents a data object for displaying custom chat messages. 
 * @property {String} renderedContent The fully rendered HTML to display as the chat message. 
 * @property {Actor | undefined} actor Optional. The actor who will act as the speaker (= sender) of the chat message. 
 * @property {String | undefined} flavor Optional. The flavor to display above the rendered chat message. Effectively represents an optional subtitle to display. 
 * @property {String | undefined} sound Optional. Path to a sound file to play, when the chat message is sent. 
 * @property {ViewModel | undefined} viewModel Optional. A view model instance to associate the chat message with. 
 * 
 */
export default class PreparedChatData {
  /**
   * @param {String | undefined} args.renderedContent
   * @param {Actor | undefined} args.actor
   * @param {String | undefined} args.flavor
   * @param {String | undefined} args.sound
   * @param {ViewModel | undefined} args.viewModel
   */
  constructor(args = {}) {
    this.type = "PreparedChatData";

    this.renderedContent = args.renderedContent ?? "";
    this.actor = args.actor;
    this.flavor = args.flavor;
    this.sound = args.sound;
    this.viewModel = args.viewModel;
  }
}