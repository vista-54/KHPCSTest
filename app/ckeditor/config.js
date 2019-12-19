/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    config.uiColor = '#e8e8e8';
    config.extraPlugins = 'placeholder,uploader,imageresizerowandcolumn';

    config.toolbar = [
        {name: 'Print', items: ['Preview', 'Print']},
        {name: 'Editing', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
        {name: 'Scayt', items: ['Scayt']},
        {name: 'Replace', items: ['Find', 'Replace']},
        {name: 'Img', items: ['Uploader', 'Image', 'Table', 'SpecialChar', 'HorizontalRule', 'PageBreak']},
        // '/',
        {name: 'Img', items: ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Subscript', 'Superscript', 'CopyFormatting', 'RemoveFormat']},
        {name: 'ListNumberedBulleted', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl']},
        // '/',
        {name: 'Styles', items: [ 'Styles','Format','Font','FontSize', 'lineheight', 'letterspacing'] },
        {name: 'colors', items: [ 'TextColor','BGColor' ] },
        {name: 'theme', items: [ 'UIColor','Maximize'] }
        // {name: 'theme', items: [ 'UIColor','Maximize', 'CreatePlaceholder'] }
    ];
    // config.removeButtons = 'Image';
    config.width = '100%';
    config.height = '500px';
    config.removePlugins = 'elementspath';



};