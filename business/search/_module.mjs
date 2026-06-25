import AtReferencer from "./at-referencer.mjs";
import { Search, SEARCH_MODES, SearchItem, SearchResult } from "./search.mjs";

export {
  AtReferencer,
  SEARCH_MODES,
  SearchItem,
  SearchResult,
  Search,
};

/**
 * Wraps the `business.search` module. 
 */
export const search = {
  AtReferencer: AtReferencer,
  SEARCH_MODES: SEARCH_MODES,
  SearchItem: SearchItem,
  SearchResult: SearchResult,
  Search: Search,
};
