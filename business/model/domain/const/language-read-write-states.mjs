/**
 * Represents a Language "Read/Write" state. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 */
export class LanguageReadWriteState {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * @property {LanguageReadWriteState} able 
 * @property {LanguageReadWriteState} unable 
 * 
 * @constant
 */
export const LANGUAGE_READ_WRITE = {
  able: new LanguageReadWriteState({
    name: "able",
    localizableName: "system.item.language.readAndWrite.canReadAndWrite",
    icon: "ico ico-can-read"
  }),
  unable: new LanguageReadWriteState({
    name: "unable",
    localizableName: "system.item.language.readAndWrite.cannotReadAndWrite",
    icon: "ico ico-cannot-read"
  }),
};
