const PATH_TEXTURE_SLOT = "systems/ambersteel/images/box.png";
const PATH_BULK = "systems/ambersteel/images/weight-hanging-solid.svg";
const PATH_QUANTITY = "systems/ambersteel/images/hashtag-solid.svg";
const PATH_SEND_TO_CHAT = "systems/ambersteel/images/comments-solid.svg";
const PATH_DELETE = "systems/ambersteel/images/trash-solid.svg";
const PATH_OPEN_SHEET = "systems/ambersteel/images/external-link-alt-solid.svg";

const LOADER = new PIXI.Loader();
export const TEXTURES = {};

LOADER.add("itemSlot", PATH_TEXTURE_SLOT);
LOADER.add("itemBulk", PATH_BULK);
LOADER.add("itemQuantity", PATH_QUANTITY);
LOADER.add("itemSendToChat", PATH_SEND_TO_CHAT);
LOADER.add("itemDelete", PATH_DELETE);
LOADER.add("itemOpenSheet", PATH_OPEN_SHEET);

LOADER.load((loader, resources) => {
  TEXTURES.ITEM_SLOT = resources.itemSlot.texture,
  TEXTURES.BULK = resources.itemBulk.texture,
  TEXTURES.QUANTITY = resources.itemQuantity.texture,
  TEXTURES.SEND_TO_CHAT = resources.itemSendToChat.texture,
  TEXTURES.DELETE = resources.itemDelete.texture,
  TEXTURES.OPEN_SHEET = resources.itemOpenSheet.texture
});