import ViewModel from "../../../view-model/view-model.mjs";

class PlainActorSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_PLAIN_SHEET }
}
