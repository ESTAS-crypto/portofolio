export const causticsVertexShader = `
attribute vec2 p;
void main() {
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const causticsFragmentShader = `
precision mediump float;
uniform vec2 R, M;
uniform float T, D;

void main() {
  vec2 uv = gl_FragCoord.xy / R;
  vec2 p = uv * 6.0 - vec2(3.0);
  p.x *= R.x / R.y;
  vec2 i = p;
  float c = 1.0, k = 0.005;
  for (int n = 0; n < 4; n++) {
    float t = T * 0.35 * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / k), p.y / (cos(i.y + t) / k)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  float v = clamp(pow(abs(c), 8.0), 0.0, 1.0);
  if (v != v) v = 0.0;
  float m = 1.0 - smoothstep(0.0, 0.35, distance(uv * vec2(R.x / R.y, 1.0), M * vec2(R.x / R.y, 1.0)));
  vec3 col = vec3(v) * vec3(0.35, 0.8, 1.0) * 1.3 * (0.5 + 1.1 * m) * (1.0 - 0.55 * D) * smoothstep(0.0, 0.9, uv.y * 0.6 + 0.45);
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, col.b);
}
`;
