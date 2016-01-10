precision mediump float;

uniform vec2 resolution;
uniform sampler2D vertices;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 origin = texture2D( vertices, uv );
    gl_FragColor = origin;
}
