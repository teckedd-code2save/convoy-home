import { useRef, useEffect } from 'react'

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define STAGES 7

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float stageNode(vec2 uv, vec2 center, float t) {
  float d = length(uv - center);
  float pulse = 0.5 + 0.5 * sin(t * 2.0 + center.x * 10.0);
  float core = smoothstep(0.06, 0.03, d);
  float ring = smoothstep(0.12, 0.08, d) * (0.3 + 0.2 * pulse);
  float glow = smoothstep(0.25, 0.10, d) * 0.08;
  return core + ring + glow;
}

float connectionLine(vec2 uv, vec2 a, vec2 b, float t) {
  vec2 ab = b - a;
  float len = length(ab);
  vec2 dir = ab / len;
  vec2 pa = uv - a;
  float proj = clamp(dot(pa, dir), 0.0, len);
  vec2 closest = a + dir * proj;
  float d = length(uv - closest);
  float flow = sin(proj * 8.0 - t * 3.0) * 0.5 + 0.5;
  float base = smoothstep(0.008, 0.003, d) * 0.15;
  float packet = smoothstep(0.02, 0.01, d) * flow * 0.4;
  return base + packet;
}

float dataPacket(vec2 uv, vec2 a, vec2 b, float t, float offset) {
  vec2 ab = b - a;
  float len = length(ab);
  vec2 dir = ab / len;
  float speed = 0.4;
  float pos = fract((t * speed) + offset) * len;
  vec2 p = a + dir * pos;
  float d = length(uv - p);
  return smoothstep(0.025, 0.008, d) * 0.6;
}

vec2 stagePos(int idx) {
  float t = float(idx) / float(STAGES - 1);
  float x = (t - 0.5) * 1.6;
  float y = sin(t * PI) * 0.12 - 0.15;
  return vec2(x, y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time;

  float bg = noise(uv * 3.0 + t * 0.1) * 0.03 + noise(uv * 8.0 - t * 0.05) * 0.015;
  vec3 col = vec3(0.027, 0.027, 0.04) + vec3(bg);

  // Mouse ripple
  vec2 mouseUV = (u_mouse - u_resolution * 0.5) / u_resolution.y;
  float mouseD = length(uv - mouseUV);
  float ripple = sin(mouseD * 20.0 - t * 4.0) * exp(-mouseD * 4.0) * 0.02;
  col += vec3(ripple * 0.5, ripple * 0.7, ripple);

  // Stage nodes
  for (int i = 0; i < STAGES; i++) {
    vec2 p = stagePos(i);
    float node = stageNode(uv, p, t);
    float hue = float(i) / float(STAGES);
    vec3 nodeCol = mix(vec3(0.357, 0.427, 0.961), vec3(0.482, 0.561, 1.0), hue);
    col += nodeCol * node;
  }

  // Connections
  for (int i = 0; i < STAGES - 1; i++) {
    vec2 a = stagePos(i);
    vec2 b = stagePos(i + 1);
    float line = connectionLine(uv, a, b, t);
    col += vec3(0.357, 0.427, 0.961) * line;

    for (int j = 0; j < 3; j++) {
      float offset = float(j) / 3.0;
      float pkt = dataPacket(uv, a, b, t, offset);
      col += vec3(0.6, 0.65, 1.0) * pkt;
    }
  }

  // Scan lines
  float scan = sin(gl_FragCoord.y * 2.0) * 0.005;
  col += vec3(scan);

  // Vignette
  float vig = 1.0 - smoothstep(0.3, 1.2, length(uv));
  col *= 0.7 + 0.3 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`

export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, source)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e: MouseEvent) => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      mouseRef.current.x = e.clientX * dpr
      mouseRef.current.y = (canvas.clientHeight - e.clientY) * dpr
    }
    window.addEventListener('mousemove', onMouse)

    let start = performance.now()
    let visible = true

    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting },
      { threshold: 0.01 }
    )
    observer.observe(canvas)

    const render = () => {
      if (visible) {
        const elapsed = (performance.now() - start) / 1000
        gl.uniform1f(uTime, elapsed)
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}
