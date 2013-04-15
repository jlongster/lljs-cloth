attribute vec3 a_position;
uniform mat4 worldTransform;

void main() {
    gl_Position = worldTransform * vec4(a_position, 1);
}
