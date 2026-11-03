import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";
import GeneralApplication from "./general-application.mjs";

/**
 * Represents an Application that can house arbitrary documents that are expected to represent one of the main 
 * domain types, such as an Expertise. 
 * 
 * @abstract Inheritors MUST override:
 * * `static PARTS`
 * * `get localizedDocumentType`
 * * `createViewModel()`
 * 
 * Inheritors may override:
 * * `static DEFAULT_OPTIONS`
 * * `_getViewModelConstructorArgs()`
 * 
 * @extends FoundryWrapper.ApplicationV2
 */
export default class GeneralDocumentApplication extends GeneralApplication {
/** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 600, height: 520, },
    classes: ["strive", "sheet", "item", "strive-regular-font"],
    tag: "form",
    window: {
      resizable: true,
    },
    actions: {
      sendToChat: {
        buttons: [0],
        handler: (event, element) => {
          const id = $(element).parent().parent().attr("id")
          const viewModel = game.strive.viewModels.get(id);
          viewModel.sendToChat();
        },
      },
      enterEditMode: {
        buttons: [0],
        handler: (event, element) => {
          const id = $(element).parent().parent().attr("id")
          const viewModel = game.strive.viewModels.get(id);
          viewModel.enterEditMode();
        },
      },
      saveEdits: {
        buttons: [0],
        handler: (event, element) => {
          const id = $(element).parent().parent().attr("id")
          const viewModel = game.strive.viewModels.get(id);
          viewModel.saveEdits();
        },
      },
    },
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return ((this.actor ?? this.item) ?? {}).isOwner ?? false; }

  /**
   * @param {Object} document 
   */
  constructor(document) {
    super();
    if (!ValidationUtil.isDefined(document)) {
      throw new Error("document must not be undefined");
    }

    this.document = document;
  }

  /** @override */
  _getViewModelConstructorArgs() {
    const args = {
      document: this.document,
    };
    if (ValidationUtil.isFunction(this.document.getTransientObject)) {
      const document = this.document.getEnhancedDocument();
      const documentContext = document.context;
      args.document = document;
      args.documentContext = documentContext;
    }
    return args;
  }

  /** @override */
  _getFrameButtons() {
    const controls = super._getFrameButtons();
    return [
      {
        action: "sendToChat",
        icon: "ico ico-speech-bubble",
        label: "system.general.sendToChat",
      },
      {
        action: "enterEditMode",
        icon: "ico ico-edit",
        label: "system.general.edit.enterEditMode",
      },
      {
        action: "saveEdits",
        icon: "ico ico-floppy",
        label: "system.general.edit.saveEdits",
      },
    ].concat(controls);
  }
}
