/**
 * Represents a data object for displaying custom chat messages. 
 * @property {String} renderedContent The fully rendered HTML to display as the chat message. 
 * @property {Actor|undefined} actor Optional. The actor who will act as the speaker (= sender) of the chat message. 
 * @property {String|undefined} flavor Optional. The flavor to display above the rendered chat message. Effectively represents an optional subtitle to display. 
 * @property {String|undefined} sound Optional. Path to a sound file to play, when the chat message is sent. 
 */
export default class PreparedChatData {
  constructor(args = {}) {
    args = {
      renderedContent: "", 
      actor: undefined,
      flavor: undefined,
      sound: undefined,
      ...args
    };
    this.renderedContent = args.renderedContent;
    this.actor = args.actor;
    this.flavor = args.flavor;
    this.sound = args.sound;
  }
}