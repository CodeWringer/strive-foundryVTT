import Complication from "../../../../business/model/domain/complication/complication.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { SlideInAnim } from "../../../animation/slide-in-anim.mjs";
import { SlideOutAnim } from "../../../animation/slide-out-anim.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import ComplicationViewModel from "./complication-viewmodel.mjs";

export default class ComplicationListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.complication.list; }

  /** @override */
  get clazz() { return ComplicationListViewModel; }

  get isEditable() { return this._isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    new Promise(async (resolve) => {
      const elm = this.element.find(".context-button-section");
      if (value) {
        await new SlideInAnim({
          elm: elm,
        }).execute();
        elm.removeClass("hidden");
      } else {
        await new SlideOutAnim({
          elm: elm,
        }).execute();
        elm.addClass("hidden");
      }
      resolve();
    });
  }

  /**
   * @param {Object} args
   * @param {Array<Complication> | undefined} args.complications
   */
  constructor(args = {}) {
    super(args);

    this.complications = args.complications ?? [];
    this.complicationViewModels = this.complications.map(complication => new ComplicationViewModel({
      document: complication,
    }));
    
    this.vmContextMenuButton = new ButtonDropDownViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      content: '<i class="ico ico-burger-menu lg"></i>',
      options: [
        // TODO
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.complication.add"),
          onClick: () => {
            // TODO
          },
        }),
      ],
    });
  }

  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isEditable) {
      this.element.find(".context-button-section").removeClass("hidden");
    } else {
      this.element.find(".context-button-section").addClass("hidden");
    }
  }
}
