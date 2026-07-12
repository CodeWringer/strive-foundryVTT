import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { StringUtil } from "../../../../common/util/string-utility.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputSliderViewModel from "../../../component/input-slider/input-slider-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import ListViewModel from "../../../component/list/list-viewmodel.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"
import ProjectComplicationListItemViewModel from "./complication/project-complication-list-item-viewmodel.mjs"

/**
 * @property {TransientProject} document
 */
export default class ProjectListItemViewModel extends BaseListItemViewModel {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientProject} args.document 
   */
  constructor(args = {}) {
    super(args);

    this.vmProgressRange = new InputSliderViewModel({
      id: "vmProgressRange",
      parent: this,
      min: 0,
      max: this.document.totalProgress,
      value: this.document.progress,
      localizedToolTip: StringUtil.format(game.i18n.localize("system.project.progressOf"),
        this.document.progress,
      ),
      onChange: (_, newValue) => {
        this.document.progress = newValue;
        this.vmProgressRange.localizedToolTip = StringUtil.format(game.i18n.localize("system.project.progressOf"),
          this.document.progress,
        );
      },
      onInput: (event, viewModel) => {
        const newValue = event.currentTarget.value;
        viewModel.localizedToolTip = StringUtil.format(
          game.i18n.localize("system.project.progressOf"),
          newValue
        );
      },
    });
    this.vmProgress = new InputNumberSpinnerViewModel({
      id: "vmProgress",
      parent: this,
      min: 0,
      value: this.document.progress,
      localizedToolTip: game.i18n.localize("system.project.progress"),
      onChange: (_, newValue) => {
        this.document.progress = newValue;
      },
    });
    this.vmTotalProgress = new InputNumberSpinnerViewModel({
      id: "vmTotalProgress",
      parent: this,
      min: 0,
      value: this.document.totalProgress,
      localizedToolTip: game.i18n.localize("system.project.totalProgress"),
      onChange: (_, newValue) => {
        this.document.totalProgress = newValue;
      },
    });
    this.vmComplications = new ListViewModel({
      id: "vmComplications",
      parent: this,
      value: this.document.complications,
      newItemDefaultValue: game.i18n.localize("system.project.complication.defaultValue"),
      isItemAddable: true,
      isItemRemovable: true,
      contentItemTemplate: ProjectComplicationListItemViewModel.TEMPLATE,
      contentItemViewModelFactory: (index, item) => new ProjectComplicationListItemViewModel({
        id: `vmComplication${index}`,
        isEditable: true,
        complication: item,
      }),
      onChange: (_, newValue) => {
        this.document.complications = newValue;
      },
    });
  }

  /** @override */
  getPromotedContent() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.PROJECT_ITEM_SHEET_PROMOTED_CONTENT,
      viewModel: this,
    });
  }

  /** @override */
  getAdditionalContent() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.PROJECT_ITEM_SHEET_ADDITIONAL_CONTENT,
      viewModel: this,
    });
  }

  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        iconClass: 'ico-quality-solid',
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          id: "quality",
          parent: this,
          min: 0,
          value: this.document.quality,
          onChange: (_, newValue) => {
            this.document.quality = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.project.quality"),
      }),
      new DataFieldComponent({
        iconClass: 'ico-project-push-solid',
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          id: "pushes",
          parent: this,
          min: 0,
          value: this.document.pushes,
          onChange: (_, newValue) => {
            this.document.pushes = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.project.pushes"),
      }),
      new DataFieldComponent({
        iconClass: 'ico-distance-solid',
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          id: "progressIncrement",
          parent: this,
          min: 0,
          value: this.document.progressIncrement,
          onChange: (_, newValue) => {
            this.document.progressIncrement = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.project.progressIncrement"),
      }),
      new DataFieldComponent({
        iconClass: 'ico-hourglass-solid',
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          id: "timeIncrement",
          parent: this,
          value: this.document.timeIncrement,
          onChange: (_, newValue) => {
            this.document.timeIncrement = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.project.timeIncrement"),
      }),
      new DataFieldComponent({
        iconClass: 'ico-skill-solid',
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          id: "projectSkill",
          parent: this,
          value: this.document.projectSkill,
          onChange: (_, newValue) => {
            this.document.projectSkill = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.project.projectSkill"),
      }),
    ].concat(super.getDataFields() ?? []);
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ProjectListItemViewModel));
  }
}
