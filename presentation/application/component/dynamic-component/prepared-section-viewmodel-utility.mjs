import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DynamicComponent from "./dynamic-component.mjs";
import PreparedSection from "./prepared-section.mjs";

export const PreparedSectionViewModelUtility = {
  /**
   * Converts the given `sections` to `PreparedSection`s and assigns them to the 
   * `viewModel.preparedSections` field. 
   * @param {ViewModel} viewModel
   * @param {Array<DynamicComponent>} sections 
   */
  convertDynamicComponents: (viewModel, sections) => {
    viewModel.preparedSections = sections.map(section => {
      let sectionViewModel;
      if (ValidationUtil.isDefined(section.viewModelFactory)) {
        sectionViewModel = section.viewModelFactory(viewModel);
      }
      const prepared = new PreparedSection({
        html: section.html,
        template: section.template,
        viewModel: sectionViewModel,
        cssClass: section.cssClass,
      });

      if (ValidationUtil.isDefined(prepared.viewModel)) {
        viewModel[prepared.viewModel._id] = prepared.viewModel;
      }
      return prepared;
    });
  },
};
