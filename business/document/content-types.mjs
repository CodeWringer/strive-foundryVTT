/**
 * A global constant for the internal specific type names of documents. 
 * 
 * @constant
 * 
 * @property {Object} ACTOR
 * @property {String} ACTOR.PC
 * @property {String} ACTOR.NPC
 * @property {String} ACTOR.PLAIN
 * 
 * @property {Object} ITEM
 * @property {String} ITEM.ASSET
 * @property {String} ITEM.SKILL
 * @property {String} ITEM.FATE
 * @property {String} ITEM.INJURY
 * @property {String} ITEM.ILLNESS
 * @property {String} ITEM.MUTATION
 * @property {String} ITEM.SCAR
 * 
 */
export const CONTENT_TYPES = {
  ACTOR: {
    PC: "pc",
    NPC: "npc",
    PLAIN: "plain",
  },
  ITEM: {
    ASSET: "item",
    SKILL: "skill",
    FATE: "fate",
    INJURY: "injury",
    ILLNESS: "illness",
    MUTATION: "mutation",
    SCAR: "scar",
  },
};
