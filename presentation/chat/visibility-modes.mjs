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

export const VISIBILITY_MODES = {
  public: new VisibilityMode({
    name: "public",
    localizableName: "ambersteel.general.messageVisibility.public.label"
  }),
  self: new VisibilityMode({
    name: "self",
    localizableName: "ambersteel.general.messageVisibility.self.label"
  }),
  gm: new VisibilityMode({
    name: "gm",
    localizableName: "ambersteel.general.messageVisibility.gm.label"
  })
};