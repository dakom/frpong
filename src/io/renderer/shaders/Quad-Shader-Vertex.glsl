attribute vec2 a_vertex;
    
varying vec2 v_texCoord;
    
uniform mat4 u_transform;
uniform mat4 u_size;
    
void main() {     
    gl_Position = u_transform * (u_size * vec4(a_vertex,0,1));
    v_texCoord = a_vertex;
}
