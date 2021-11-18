/**
 * Represents a data object for displaying custom chat messages. 
 */
export default class PreparedChatData {
  /**
   * The actor who will act as the speaker (= sender) of the chat message. 
   * @type {Actor|undefined}
   */
  actor = undefined;

  /**
   * The flavor to display above the rendered chat message. 
   * Effectively represents an optional subtitle to display. 
   * @type {String|undefined}
   */
  flavor = undefined;

  /**
   * Path to a sound file to play, when the chat message is sent. 
   * @type {String|undefined}
   */
  sound = undefined;

  /**
   * The fully rendered HTML to display as the chat message. 
   * @type {String}
   */
  renderedContent = "";

  /**
   * 
   * @param {String} renderedContent The fully rendered HTML to display as the chat message. 
   * @param {Actor|undefined} actor The actor who will act as the speaker (= sender) of the chat message. 
   * @param {String|undefined} flavor The flavor to display above the rendered chat message. 
   * @param {String|undefined} sound Path to a sound file to play, when the chat message is sent. 
   */
  constructor(args = {}) {
    args = {
      renderedContent: undefined, 
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