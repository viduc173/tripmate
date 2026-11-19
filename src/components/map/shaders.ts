// GLSL for the 3D Vietnam map. Land colour follows latitude (cool north, warm south) with a soft
// rim light; the sea draws slow ripples and a coastal glow. All uniforms are cheap per-frame.

export const landVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const landFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uNorth;
  uniform vec3 uSouth;
  uniform vec3 uRim;
  uniform vec3 uCam;
  varying vec3 vWorld;
  varying vec3 vNormal;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    float t = clamp((-vWorld.z + 8.0) / 16.0, 0.0, 1.0);        // 0 = south, 1 = north
    vec3 base = mix(uSouth, uNorth, smoothstep(0.0, 1.0, t));
    float light = 0.55 + 0.45 * max(dot(normalize(vNormal), normalize(vec3(-0.4, 1.0, 0.5))), 0.0);
    vec3 view = normalize(uCam - vWorld);
    float rim = pow(1.0 - max(dot(view, normalize(vNormal)), 0.0), 3.0);
    float grain = (hash(floor(vWorld.xz * 60.0)) - 0.5) * 0.015;
    float pulse = 0.5 + 0.5 * sin(uTime * 0.6 + vWorld.z * 0.8);
    vec3 col = base * light + grain + uRim * rim * (0.35 + 0.25 * pulse);
    gl_FragColor = vec4(col, 1.0);
  }
`

export const seaVertex = /* glsl */ `
  varying vec2 vXZ;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vXZ = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const seaFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uLine;
  uniform vec2 uCoast[8];
  varying vec2 vXZ;
  void main() {
    float d = 1e3;
    for (int i = 0; i < 8; i++) d = min(d, distance(vXZ, uCoast[i]));
    float ripple = smoothstep(0.92, 1.0, sin(d * 6.0 - uTime * 1.2) * 0.5 + 0.5) * smoothstep(6.0, 0.5, d);
    float grid = max(step(0.985, fract(vXZ.x)), step(0.985, fract(vXZ.y))) * 0.12;
    float fade = smoothstep(30.0, 4.0, length(vXZ));
    vec3 col = uDeep + uLine * (ripple * 0.35 + grid) * fade;
    gl_FragColor = vec4(col, 1.0);
  }
`
