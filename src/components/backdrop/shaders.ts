// Written for TripMate. Ideas (layered gradient sky, weather as uniforms, ridge silhouettes,
// horizon glow band) are learned from MengTo/threeui (MIT); no code is copied.

export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const noise = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
`

/** Day-card sky: gradient, drifting clouds, two mountain ridges, rain / snow / lightning / fog. */
export const skyFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uTop, uBottom, uRidge;
uniform float uCloud, uRain, uSnow, uStorm, uFog, uSeed;
varying vec2 vUv;
${noise}
float ridge(float x, float base, float amp, float freq, float seed) {
  return base + amp * (fbm(vec2(x * freq + seed, seed)) - 0.5) * 2.0;
}
void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

  // Clouds drift slowly to the right.
  vec2 cp = vec2(uv.x * aspect * 1.4 + uTime * 0.02 + uSeed, uv.y * 2.2);
  float c = smoothstep(0.55 - uCloud * 0.3, 0.95, fbm(cp)) * uCloud;
  col = mix(col, mix(vec3(1.0), uTop * 0.6 + 0.35, uStorm * 0.7), c * 0.85);

  // Lightning: rare, short flashes.
  float flash = step(0.985, fract(sin(floor(uTime * 3.0) * 12.9898 + uSeed) * 43758.5)) * uStorm;
  col += flash * 0.35;

  // Two ridges; the near one is darker.
  float x = uv.x * aspect;
  float far = ridge(x, 0.34, 0.12, 0.9, uSeed + 3.0);
  float nearR = ridge(x, 0.16, 0.1, 1.6, uSeed + 7.0);
  col = mix(col, mix(uRidge, uBottom, 0.45), smoothstep(far + 0.006, far - 0.006, uv.y));
  col = mix(col, uRidge * 0.8, smoothstep(nearR + 0.006, nearR - 0.006, uv.y));

  // Fog pools low.
  col = mix(col, vec3(0.86, 0.88, 0.9), uFog * smoothstep(0.7, 0.0, uv.y) * (0.6 + 0.4 * fbm(vec2(x * 2.0 + uTime * 0.05, uv.y * 3.0))));

  // Rain: slanted streaks.
  if (uRain > 0.0) {
    vec2 rp = vec2(x * 60.0 + uv.y * 12.0, uv.y * 6.0 + uTime * 9.0);
    float r = step(0.93, hash(floor(rp))) * smoothstep(0.0, 0.4, fract(rp.y));
    col = mix(col, vec3(0.85, 0.9, 1.0), r * uRain * 0.45);
  }
  // Snow: soft flakes falling and swaying.
  if (uSnow > 0.0) {
    for (int l = 0; l < 2; l++) {
      float s = 18.0 + float(l) * 14.0;
      vec2 sp = vec2(x * s + sin(uTime * 0.6 + uv.y * 4.0 + float(l)) * 0.6, uv.y * s * 0.6 + uTime * (1.2 + float(l)));
      vec2 cell = fract(sp) - 0.5;
      float on = step(0.82, hash(floor(sp) + float(l) * 7.0));
      col = mix(col, vec3(1.0), on * smoothstep(0.18, 0.0, length(cell)) * uSnow);
    }
  }
  gl_FragColor = vec4(col, 1.0);
}
`

/** Emerald horizon: dark field with a slow glowing band along the bottom edge. */
export const emeraldFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;
${noise}
void main() {
  vec2 uv = vUv;
  float wave = sin(uv.x * 2.6 + uTime * 0.35) * 0.07 + sin(uv.x * 5.3 - uTime * 0.22) * 0.035;
  float band = smoothstep(0.42, -0.08, uv.y + wave);
  band *= 0.65 + 0.7 * fbm(vec2(uv.x * 2.0 + uTime * 0.06, uTime * 0.03));
  vec3 base = vec3(0.027, 0.063, 0.051);
  vec3 jade = vec3(0.12, 0.42, 0.33);
  vec3 mint = vec3(0.36, 0.76, 0.6);
  vec3 glow = mix(jade, mint, clamp(uv.x + sin(uTime * 0.15) * 0.3, 0.0, 1.0));
  vec3 col = base + glow * pow(band, 1.6) * 1.1;
  col *= mix(1.0, smoothstep(1.25, 0.35, length(uv - vec2(0.5, 0.0))), 0.8);
  col += (hash(uv * uRes) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`
