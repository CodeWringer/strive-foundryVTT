import { createUUID } from "../../business/util/uuid-utility.mjs";

/**
 * Represents the definition of a button on a modal dialog. 
 * 
 * @property {String} id Id of the button element. 
 * @property {Function | undefined} clickCallback Function to invoke when the button 
 * is clicked. 
 * * Receives the DOM of the dialog window as the first and the dialog object 
 * as its second argument. 
 * @property {String | undefined} cssClass CSS class of the button itself. 
 * @property {String | undefined} iconCssClass Css class of the icon of the button. 
 * * E. g. `"fas fa-check"`. 
 * @property {String | undefined} localizedLabel Localized label string. 
 */
export default class DialogButtonDefinition {
  /**
   * @param {String} id Id of the button element. 
   * * Default is a new UUID. 
   * @param {Function | undefined} clickCallback Function to invoke when the button 
   * is clicked. 
   * * Receives the DOM of the dialog window as the first and the dialog object 
   * as its second argument. 
   * @param {String | undefined} cssClass CSS class of the button itself. 
   * @param {String | undefined} iconCssClass Css class of the icon of the button. 
   * * E. g. `"fas fa-check"`. 
   * @param {String | undefined} localizedLabel Localized label string. 
   */
  constructor(args) {
    this.id = args.id ?? createUUID();
    this.clickCallback = args.clickCallback;
    this.cssClass = args.cssClass;
    this.iconCssClass = args.iconCssClass;
    this.localizedLabel = args.localizedLabel;
  }
}