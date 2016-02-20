
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
        this.ractive.fire('source.bounding', this.getBoundingProperties(source));
        this.editor.setValue(source);
    },

    getBoundingProperties: function(source) {
        return {
            position: this.getBoundingPosition(source),
            size: this.getBoundingSize(source)
        };
    },

    getBoundingPosition: function(source) {
        var values = this.getBoundingValue('BOUNDING_BOX_POSITION', source);
        if (values) {
            return {
                x: values[0],
                y: values[1],
                z: values[2]
            }
        };
    },

    getBoundingSize: function(source) {
        var values = this.getBoundingValue('BOUNDING_BOX_SIZE', source);
        if (values) {
            return {
                width: values[0],
                height: values[1],
                depth: values[2]
            }
        };
    },

    getBoundingValue: function(name, source) {
        var re = new RegExp(name + '\\s+([\\d\\.]+)\\s+([\\d\\.]+)\\s+([\\d\\.]+)');
        var matches = re.exec(source);
        if (matches && matches.length == 4) {
            return [
                Number(matches[1]),
                Number(matches[2]),
                Number(matches[3])
            ]
        }
    }
};

module.exports = ExampleControls;
