/**
 * Represents the index of a document. 
 * 
 * This is effectively a small subset of the document's metadata. 
 * 
 * @property {Object} args 
 * @property {String} args.id Id of the document. 
 * @property {String} args.name Name of the document. 
 * @property {DocumentCollectionSource} args.sourceType The source type where 
 * the document was found. 
 * @property {String} args.sourceName Name of the source. 
 */
export class DocumentIndex {
  constructor(args = {}) {
    this.id = args.id;
    this.name = args.name;
    this.sourceType = args.sourceType;
    this.sourceName = args.sourceName;
  }
}