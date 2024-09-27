import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DamageFindingHierarchy from "./damage-finding-hierarchy.mjs";
import DamageFindingListItemViewModel from "./damage-finding-list-item-viewmodel.mjs";

/**
 * @property {Array<DamageFindingListItemViewModel>} findingViewModels
 * @property {Array<DamageHierarchyListItemViewModel>} subHierarchyViewModels
 */
export default class DamageHierarchyListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DAMAGE_HIERARCHY_LIST_ITEM; }

  get findingTemplate() { return DamageFindingListItemViewModel.TEMPLATE; }

  get hierarchyTemplate() { return DamageHierarchyListItemViewModel.TEMPLATE; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id
   * @param {ViewModel | undefined} args.parent
   * @param {DamageFindingHierarchy} args.hierarchy
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["hierarchy"]);

    this.hierarchy = args.hierarchy;

    this.findingViewModels = [];
    this.subHierarchyViewModels = [];

    this.hierarchy.findings.forEach(finding => {
      const vm = new DamageFindingListItemViewModel({
        id: `finding-${finding.id}`,
        parent: this,
        damageFinding: finding,
      });
      this[vm.id] = vm;
      this.findingViewModels.push(vm);
    });
    this.hierarchy.subHierarchies.forEach(subHierarchy => {
      const vm = new DamageHierarchyListItemViewModel({
        id: `sub-${subHierarchy.id}`,
        parent: this,
        hierarchy: subHierarchy,
      });
      this[vm.id] = vm;
      this.subHierarchyViewModels.push(vm);
    });
  }

  /**
   * Returns a render of the template with this view model instance as its basis. 
   * 
   * @returns {String}
   */
  async render() {
    return await renderTemplate(DamageHierarchyListItemViewModel.TEMPLATE, {
      viewModel: this,
    });
  }
}
