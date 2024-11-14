/**
 * Represents a means of determining the creation data for a new 
 * document to be instantiated. 
 */
export class DocumentCreationStrategy {
  /**
   * Determines the creation data and unless the user could and has canceled, 
   * will create the document. 
   * 
   * @returns {Object} The created document. 
   * 
   * @abstract
   * @async
   */
  async selectAndCreate() {
    throw new Error("Not implemented");
  }
}
