attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 worldTransform;
varying vec3 color;

void main() {
    gl_Position = worldTransform * vec4(a_position, 1);
    color = a_color;
}
