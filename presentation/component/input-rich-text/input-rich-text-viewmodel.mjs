import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a rich-text-editor. 
 * 
 * Internally, this works as a wrapper to a tinyMCE editor, the way FoundryVTT includes it. 
 * 
 * @extends InputViewModel
 */
export default class InputRichTextViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_RICH_TEXT; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputRichText', `{{> "${InputRichTextViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {Object}
   * @private
   */
  _editor = undefined;

  /**
   * @type {JQuery}
   * @private
   */
  _elementButtonEditMode = undefined;

  /**
   * @type {JQuery}
   * @private
   */
  _elementReadOnlyContents = undefined;

  /**
   * @type {JQuery}
   * @private
   */
  _elementEditor = undefined;

  _isInEditMode = false;
  get isInEditMode() { return this._isInEditMode; }
  set isInEditMode(value) {
    // Ensure only a change in value causes any further logic. 
    if (this._isInEditMode === value) return;

    this._isInEditMode = value;
    if (value === true) {
      this._elementButtonEditMode.addClass("hidden");
      this._elementReadOnlyContents.addClass("hidden");
      this._elementEditor.removeClass("hidden");

      this._createEditor();
    } else {
      this._editor.destroy();
      this._editor = undefined;

      this._elementEditor.addClass("hidden");
      this._elementButtonEditMode.removeClass("hidden");
      this._elementReadOnlyContents.removeClass("hidden");
    }
  }
  
  /**
   * @private
   * @async
   */
  async _createEditor() {
    const mceConfig = this._getEditorConfig();
    this._editor = (await tinyMCE.init(mceConfig))[0];
    this._editor.resetContent(this.value);
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    const thiz = this;

    this.vmBtnEditMode = new ButtonViewModel({
      id: "vmBtnEditMode",
      parent: thiz,
      isEditable: thiz.isEditable,
    });
    this.vmBtnEditMode.onClick = async (html, isOwner, isEditable) => {
      if (isEditable !== true) return;
      
      thiz.isInEditMode = true;
    }
  }

  /** @override */
  async activateListeners(html, isOwner, isEditable) {
    await super.activateListeners(html, isOwner, isEditable);

    this._elementButtonEditMode = this.element.find(".component-rich-text-editbutton");
    this._elementEditor = this.element.find(".component-rich-text");
    this._elementReadOnlyContents = this.element.find("#content");

    const renderedContent = await TextEditor.enrichHTML(this.value ?? "", { async: true, secrets: this.isEditable });
    this._elementReadOnlyContents.empty();
    this._elementReadOnlyContents.append(renderedContent);
  }

  /** @override */
  dispose() {
    super.dispose();

    if (this._editor !== undefined && this._editor !== null) {
      this._editor.destroy();
    }
    this._editor = undefined;
  }
  
  /**
   * @private
   * @returns {Object}
   */
  _getEditorConfig() {
    // Default settings that Foundry sets on its instances of TinyMCE. 
    // branding: false
    // content_css: "/css/mce.css"
    // file_picker_callback: ƒ (pickerCallback, value, meta)
    // init_instance_callback: editor => {…}
    // menubar: false
    // plugins: "lists image table hr code save link"
    // save_enablewhendirty: true
    // statusbar: false
    // style_formats: [{…}]
    // style_formats_merge: true
    // table_default_styles: {}
    // toolbar: "styles removeformat | bullist numlist | image table hr link code | save cancel"

    const thiz = this;

    return {
      target: this._elementEditor[0],
      branding: false,
      statusbar: false,
      menubar: false,
      content_css: "/css/mce.css",
      content_style: '@font-face { font-family: "Black-Chancery"; src: url("systems/ambersteel/presentation/font/BLKCHCRY.TTF") format("truetype"); }',
      style_formats_merge: true,
      style_formats: [
        {
          title: "Custom", items: [
            { block: "section", classes: "secret", title: "Secret", wrapper: true }
          ]
        }
      ],
      table_default_styles: {},
      save_enablewhendirty: false,
      plugins: "lists image table hr code save link",
      toolbar: "styles fontfamily fontsize removeformat | save cancel | bullist numlist | image table hr link code",
      font_family_formats: 'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; BlackChancery=Black-Chancery; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
      file_picker_callback: thiz._mceFilePickerCallback,
      save_oncancelcallback: () => {
        thiz.isInEditMode = false;
      },
      save_onsavecallback: () => {
        // Fetch content **before** disposing of the editor. 
        const content = this._editor.getContent();
        
        // If this value is true, that means the content was changed by the user. 
        const isDirty = (this.value ?? "").length !== content.length;

        // Ensure the editor is destroyed, to avoid potential leaks. 
        thiz.isInEditMode = false;

        if (isDirty === true) {
          // Update the value and send it to the DB. 
          thiz.value = content;
        }
      }
    };
  }

  /**
   * @param pickerCallback 
   * @param value 
   * @param meta 
   * @private
   */
  _mceFilePickerCallback(pickerCallback, value, meta) {
    let filePicker = new FilePicker({
      type: "image",
      callback: path => {
        pickerCallback(path);
        // Reset our z-index for next open
        $(".tox-tinymce-aux").css({zIndex: ''});
      },
    });
    filePicker.render();
    // Set the TinyMCE dialog to be below the FilePicker
    $(".tox-tinymce-aux").css({zIndex: Math.min(++_maxZ, 9999)});
  };
}
