import ButtonViewModel from '../button/button-viewmodel.mjs';
import Expertise from '../../../business/document/item/skill/expertise.mjs';
import { ValidationUtil } from '../../../business/util/validation-utility.mjs';

/**
 * A button that allows adding a newly created embedded document to a specific actor. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} localizedLabel A localized text to 
 * display as a button label. 
 * 
 * @property {DocumentCreationStrategy} creationStrategy Used to determine the 
 * creation data, for example by letting the user select a specific template Item from 
 * a given list. 
 * @property {Object} creationData Data to pass to the item creation function. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: Item | Expertise` - The created `Item` document or `Expertise`. 
 */
export default class ButtonAddViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonAdd', `{{> "${super.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: Item | Expertise` - The created `Item` document or `Expertise`. 
   * 
   * @param {DocumentCreationStrategy} args.creationStrategy Used to determine the 
   * creation data, for example by letting the user select a specific template Item from 
   * a given list. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-plus"></i>',
    });
    ValidationUtil.validateOrThrow(args, ["creationStrategy"]);

    this.creationStrategy = args.creationStrategy;
  }

  /**
   * @param {Event} event
   * 
   * @returns {Actor | Item | Expertise} The created document. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    event.preventDefault();

    if (this.isEditable !== true) return;

    return await this.creationStrategy.selectAndCreate();
  }
}
