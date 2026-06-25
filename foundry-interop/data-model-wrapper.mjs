/**
 * Wraps FoundryVTT's schema field definitions.
 * 
 * You never know when Foundry's namespaces change and then only _this_ place must be modified, 
 * instead of _everywhere_. Keeps imports and namespacing cleaner, in general. And when the API 
 * does change, this is also the place to do any mapping necessary. 
 * 
 * @see https://foundryvtt.com/api/modules/foundry.data.fields.html
 */
export const FoundrySchemaFields = {
  AlphaField: foundry.data.fields.AlphaField,
  AngleField: foundry.data.fields.AngleField,
  AnyField: foundry.data.fields.AnyField,
  ArrayField: foundry.data.fields.ArrayField,
  BooleanField: foundry.data.fields.BooleanField,
  ColorField: foundry.data.fields.ColorField,
  DataField: foundry.data.fields.DataField,
  DataModelSchemaField: foundry.data.fields.DataModelSchemaField,
  DocumentAuthorField: foundry.data.fields.DocumentAuthorField,
  DocumentFlagsField: foundry.data.fields.DocumentFlagsField,
  DocumentIdField: foundry.data.fields.DocumentIdField,
  DocumentOwnershipField: foundry.data.fields.DocumentOwnershipField,
  DocumentStatsField: foundry.data.fields.DocumentStatsField,
  DocumentTypeField: foundry.data.fields.DocumentTypeField,
  DocumentUUIDField: foundry.data.fields.DocumentUUIDField,
  EmbeddedCollectionDeltaField: foundry.data.fields.EmbeddedCollectionDeltaField,
  EmbeddedCollectionField: foundry.data.fields.EmbeddedCollectionField,
  EmbeddedDataField: foundry.data.fields.EmbeddedDataField,
  EmbeddedDocumentField: foundry.data.fields.EmbeddedDocumentField,
  FilePathField: foundry.data.fields.FilePathField,
  ForeignDocumentField: foundry.data.fields.ForeignDocumentField,
  GridOffsetField: foundry.data.fields.GridOffsetField,
  GridOffsetsField: foundry.data.fields.GridOffsetsField,
  HTMLField: foundry.data.fields.HTMLField,
  HueField: foundry.data.fields.HueField,
  IntegerSortField: foundry.data.fields.IntegerSortField,
  JavaScriptField: foundry.data.fields.JavaScriptField,
  JSONField: foundry.data.fields.JSONField,
  NumberField: foundry.data.fields.NumberField,
  ObjectField: foundry.data.fields.ObjectField,
  SceneLevelsSetField: foundry.data.fields.SceneLevelsSetField,
  SchemaField: foundry.data.fields.SchemaField,
  SetField: foundry.data.fields.SetField,
  ShaderField: foundry.data.fields.ShaderField,
  ShapesField: foundry.data.fields.ShapesField,
  StringField: foundry.data.fields.StringField,
  TypeDataField: foundry.data.fields.TypeDataField,
  TypedObjectField: foundry.data.fields.TypedObjectField,
  TypedSchemaField: foundry.data.fields.TypedSchemaField,
}

/**
 * Wraps the TypeDataModel type, which *all* data models must inherit from. 
 * 
 * @abstract Inheritors MUST implement:
 * * `static defineschema()`
 * 
 * @see https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html
 * @see https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html#defineschema
 */
export const TypeDataModel = foundry.abstract.TypeDataModel;
