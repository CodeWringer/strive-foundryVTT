import { ConstantsUtil } from "../../business/util/constants-utility.mjs";

/**
 * Represents a chat message visibility mode. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class VisibilityMode {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents the defined visibility modes.
 * 
 * @property {VisibilityMode} public Visible to everyone. 
 * @property {VisibilityMode} self Only visible to the user themself. 
 * @property {VisibilityMode} gm Only visible to the user themself and 
 * all game master users. 
 * 
 * @constant
 */
export const VISIBILITY_MODES = {
  public: new VisibilityMode({
    name: "public",
    localizableName: "system.general.messageVisibility.public.label"
  }),
  self: new VisibilityMode({
    name: "self",
    localizableName: "system.general.messageVisibility.self.label"
  }),
  gm: new VisibilityMode({
    name: "gm",
    localizableName: "system.general.messageVisibility.gm.label"
  }),
};
ConstantsUtil.enrichConstant(VISIBILITY_MODES);
