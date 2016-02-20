
var ExampleControls = function(editor, ractive) {
    this.editor = editor;
    this.ractive = ractive;
};

ExampleControls.prototype = {

    init: function() {
        this.load();
        this.ractive.on('examples.load', this.load.bind(this));
    },

    load: function() {
        var index = this.ractive.get('examples.selected');
        var source = this.ractive.get('examples.list')[index].source;
        this.editor.setValue(source);
    }
};

module.exports = ExampleControls;
