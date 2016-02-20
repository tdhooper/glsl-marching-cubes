
var EditorControls = function(editor, ractive) {
    this.editor = editor;
    this.ractive = ractive;
};

EditorControls.prototype = {

    init: function() {
        this.load();
        this.ractive.on('examples.load', this.load.bind(this));
        this.editor.editor.on('change', this.onUpdate.bind(this));
        this.ractive.observe('bounding.size', this.onBoundingUpdate.bind(this));
        this.ractive.observe('bounding.position', this.onBoundingUpdate.bind(this));
    },

    onUpdate: function() {
        var source = this.editor.getValue(source);
        this.ractive.fire('source.bounding', this.getBoundingProperties(source));
    },

    onBoundingUpdate: function() {
        var bounding = this.ractive.get('bounding');
        var source = this.editor.getValue();
        source = this.setBoundingProperties(source, bounding);
        this.editor.setValue(source);
    },

    load: function() {
        var index = this.ractive.get('examples.selected');
        var source = this.ractive.get('examples.list')[index].source;
        this.editor.setValue(source);
    },

    getBoundingProperties: function(source) {
        return {
            position: this.getBoundingPosition(source),
            size: this.getBoundingSize(source)
        };
    },

    setBoundingProperties: function(source, props) {
        source = this.setBoundingPosition(source, props.position);
        source = this.setBoundingSize(source, props.size);
        return source;
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

    setBoundingPosition: function(source, position) {
        return this.setBoundingValue(
            'BOUNDING_BOX_POSITION',
            source,
            [
                position.x,
                position.y,
                position.z
            ]
        );
    },

    setBoundingSize: function(source, size) {
        return this.setBoundingValue(
            'BOUNDING_BOX_SIZE',
            source,
            [
                size.width,
                size.height,
                size.depth
            ]
        );
    },

    getBoundingValue: function(name, source) {
        var re = new RegExp(name + '\\s+([-\\d\\.]+)\\s+([-\\d\\.]+)\\s+([-\\d\\.]+)');
        var matches = re.exec(source);
        if (matches && matches.length == 4) {
            return [
                Number(matches[1]),
                Number(matches[2]),
                Number(matches[3])
            ]
        }
    },

    setBoundingValue: function(name, source, values) {
        var re = new RegExp('(' + name + '\\s+)[-\\d\\.]+(\\s+)[-\\d\\.]+(\\s+)[-\\d\\.]+');
        return source.replace(re, '$1'+values[0]+'$2'+values[1]+'$3'+values[2]);
    }
};

module.exports = EditorControls;
