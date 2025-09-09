import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { PixiButton } from "../pixi/pixi-button.mjs";
import { PixiLoader } from "../pixi/pixi-preloader.mjs";

export default class TokenHealthConditions {
  /**
   * Removes the interactible action point bar from the given token. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @static
   */
  static removeFrom(token) {
    // TODO
  }

  /**
   * 
   * @param {Token} token 
   * @static
   */
  static hoverOn(token) {
    // TODO
  }

  /**
   * 
   * @param {Token} token 
   * @static
   */
  static hoverOff(token) {
    // TODO
  }

  /**
   * Updates the given token's current action point display. 
   * 
   * That means updating the texture and number, based on the current 
   * action point count. 
   * 
   * @param {Token} token 
   * 
   * @static
   */
  static updateOn(token) {
    if (ValidationUtil.isDefined(token.actionPointContainer) !== true) return;
    if (ValidationUtil.isDefined(token.actionPointContainer.text) !== true) return;
    if (ValidationUtil.isDefined(token.actionPointContainer.text.text) !== true) return;

    // TODO
  }
}
