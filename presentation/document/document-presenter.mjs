import TransientDocument from "../../business/document/transient-document.mjs";
import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import ButtonDeleteViewModel from "../component/button-delete/button-delete-viewmodel.mjs";
import ButtonSendToChatViewModel from "../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import Component from "../layout/component.mjs";
import Layoutable from "../layout/layoutable.mjs";
import { TEMPLATES } from "../templatePreloader.mjs";
import ViewModel from "../view-model/view-model.mjs";

/**
 * Abstract base class for document presenters. 
 * 
 * Serves as a means to present a `TransientDocument`, 
 * in one of its forms, like a dedicated sheet, as a 
 * chat message or a list item. 
 * 
 * @property {TransientDocument} document The represented 
 * document instance. 
 * 
 * @method getLayout Returns the layout information. 
 * * abstract
 * @method getViewModel Returns a new view model instance, 
 * to present the layout. 
 * 
 * @abstract
 */
export default class DocumentPresenter {
  /**
   * @param {Object} args 
   * @param {TransientDocument} args.document 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.buttonSendToChat = new Component({
      template: ButtonSendToChatViewModel.TEMPLATE,
      viewModelFunc: (parent, isEditable, isGM) => {
        return new ButtonSendToChatViewModel({
          id: "sendToChat",
          parent: parent,
          target: this.document,
          isEditable: isEditable || isGM,
        });
      },
    });
    this.buttonDelete = new Component({
      template: ButtonDeleteViewModel.TEMPLATE,
      viewModelFunc: (parent, isEditable, isGM) => {
        return new ButtonDeleteViewModel({
          id: "delete",
          parent: parent,
          target: this.document,
          isEditable: isEditable || isGM,
          withDialog: true,
          localizableTitle: "ambersteel.general.delete.label",
        });
      },
    });
  }

  /**
   * Returns the layout information. 
   * 
   * @returns {Layoutable}
   * 
   * @abstract
   */
  getLayout() { throw new Error("Not implemented"); }

  /**
   * Returns a new view model instance, to present the layout. 
   * 
   * @returns {ViewModel}
   * 
   * @virtual
   */
  getViewModel(parent) {
    this.getLayout().getViewModel(parent);
  }
}