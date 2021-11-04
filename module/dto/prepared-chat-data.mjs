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
   * @param renderedContent {String} The fully rendered HTML to display as the chat message. 
   * @param actor {Actor|undefined} The actor who will act as the speaker (= sender) of the chat message. 
   * @param flavor {String|undefined} The flavor to display above the rendered chat message. 
   * @param sound {String|undefined} Path to a sound file to play, when the chat message is sent. 
   */
  constructor(renderedContent, actor = undefined, flavor = undefined, sound = undefined) {
    this.renderedContent = renderedContent;
    this.actor = actor;
    this.flavor = flavor;
    this.sound = sound;
  }
}