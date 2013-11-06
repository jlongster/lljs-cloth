attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 worldTransform;
varying vec4 color;

void main() {
    gl_Position = worldTransform * vec4(a_position, 1);
    color = vec4(1, 1, 1, 1);
}
