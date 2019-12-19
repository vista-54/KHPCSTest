CKEDITOR.plugins.add('uploader',
    {
        init: function (editor) {
            var pluginName = 'uploader';
            editor.ui.addButton('Uploader',
                {
                    label: 'Upload image',
                    command: 'OpenWindow',
                    icon: CKEDITOR.plugins.getPath('uploader') + 'uploader.png'
                });
            var cmd = editor.addCommand('OpenWindow', { exec: showMyDialog });
        }
    });
function showMyDialog() {
    document.getElementById('file').click();
}