const PATH_TEXTURE_SLOT = "systems/ambersteel/presentation/image/box.png";
const PATH_BULK = "systems/ambersteel/presentation/image/weight-hanging-solid.svg";
const PATH_QUANTITY = "systems/ambersteel/presentation/image/hashtag-solid.svg";
const PATH_SEND_TO_CHAT = "systems/ambersteel/presentation/image/comments-solid.svg";
const PATH_DELETE = "systems/ambersteel/presentation/image/trash-solid.svg";
const PATH_OPEN_SHEET = "systems/ambersteel/presentation/image/external-link-alt-solid.svg";
const PATH_CROSS = "systems/ambersteel/presentation/image/times-circle-solid.svg";
const PATH_ARROW = "systems/ambersteel/presentation/image/caret-up-solid.svg";
const PATH_HAND_HOLD_ITEM_UP = "systems/ambersteel/presentation/image/hand-holding-box-up-solid.svg";
const PATH_HAND_HOLD_ITEM_DOWN = "systems/ambersteel/presentation/image/hand-holding-box-down-solid.svg";

const LOADER = new PIXI.Loader();
export const TEXTURES = {};

LOADER.add("itemSlot", PATH_TEXTURE_SLOT);
LOADER.add("itemBulk", PATH_BULK);
LOADER.add("itemQuantity", PATH_QUANTITY);
LOADER.add("itemSendToChat", PATH_SEND_TO_CHAT);
LOADER.add("itemDelete", PATH_DELETE);
LOADER.add("itemOpenSheet", PATH_OPEN_SHEET);
LOADER.add("cross", PATH_CROSS);
LOADER.add("arrow", PATH_ARROW);
LOADER.add("handHoldItemUp", PATH_HAND_HOLD_ITEM_UP);
LOADER.add("handHoldItemDown", PATH_HAND_HOLD_ITEM_DOWN);

LOADER.load((loader, resources) => {
  TEXTURES.ITEM_SLOT = resources.itemSlot.texture,
  TEXTURES.BULK = resources.itemBulk.texture,
  TEXTURES.QUANTITY = resources.itemQuantity.texture,
  TEXTURES.SEND_TO_CHAT = resources.itemSendToChat.texture,
  TEXTURES.DELETE = resources.itemDelete.texture,
  TEXTURES.OPEN_SHEET = resources.itemOpenSheet.texture,
  TEXTURES.CROSS = resources.cross.texture,
  TEXTURES.ARROW = resources.arrow.texture,
  TEXTURES.HAND_HOLD_ITEM_UP = resources.handHoldItemUp.texture,
  TEXTURES.HAND_HOLD_ITEM_DOWN = resources.handHoldItemDown.texture
});