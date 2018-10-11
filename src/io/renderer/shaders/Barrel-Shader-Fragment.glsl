precision mediump float;

const float PI = 3.1415926535;

uniform sampler2D u_image;
uniform float u_distortion;

varying vec2 v_texCoord;

vec2 Distort(vec2 p)
{
    float theta  = atan(p.y, p.x);
    float radius = length(p);
    radius = pow(radius, u_distortion);
    p.x = radius * cos(theta);
    p.y = radius * sin(theta);
    return 0.5 * (p + 1.0);
}

void main()
{
  vec2 uv = v_texCoord;
  vec2 xy = 2.0 * uv - 1.0;
  float d = length(xy);
  if (d < 1.0)
  {
    uv = Distort(xy);
  }
  vec4 c = texture2D(u_image, uv);
  gl_FragColor = c;
}
