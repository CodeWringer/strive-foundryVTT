import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";

/**
 * An override of the default `ProseMirrorMenu` for the sole purpose of listening 
 * for the `update` call, which is used to trigger rich-text `ViewModel.value` updates. 
 * 
 * @extends FoundryWrapper.ProseMirrorMenu
 */
export default class CustomProseMirrorMenu extends FoundryWrapper.ProseMirrorMenu {
  /** @override @inheritdoc */
  update(view, prevState) {
    super.update(view, prevState);

    const _findViewModel = (id, iterable) => {
      for (const viewModel of iterable) {
        if (viewModel.id == id) {
          return viewModel;
        }
        const viewModelChild = _findViewModel(id, viewModel.children);
        if (ValidationUtil.isDefined(viewModelChild)) {
          return viewModelChild;
        }
      }
    };

    const richTextElement = $(view.dom).closest(".strive.rich-text");
    const id = richTextElement.attr("id");
    const viewModel = _findViewModel(id, game.strive.viewModels.getAll());
    if (ValidationUtil.isDefined(viewModel) && ValidationUtil.isDefined(viewModel.flushValue)) {
      viewModel.flushValue();
    }
  }
}