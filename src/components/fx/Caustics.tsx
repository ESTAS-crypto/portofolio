"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { causticsVertexShader, causticsFragmentShader } from "@/lib/shaders";
import { oceanStore } from "@/lib/oceanStore";

export default function Caustics({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Handle context loss
    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, causticsVertexShader);
    const fs = createShader(gl.FRAGMENT_SHADER, causticsFragmentShader);
    if (!vs || !fs) return;

    const pr = gl.createProgram();
    if (!pr) return;
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);

    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      return;
    }
    gl.useProgram(pr);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(pr, "R");
    const uM = gl.getUniformLocation(pr, "M");
    const uT = gl.getUniformLocation(pr, "T");
    const uD = gl.getUniformLocation(pr, "D");

    const mouseRaw = { x: 0.5, y: 0.5 };
    const mouseSmoothed = { x: 0.5, y: 0.5 };

    const handlePointerMove = (e: PointerEvent) => {
      mouseRaw.x = e.clientX / window.innerWidth;
      mouseRaw.y = 1 - e.clientY / window.innerHeight;
    };

    const handleResize = () => {
      const isLow = oceanStore.getState().isLowSpec;
      const scale = isLow ? 0.3 : 0.5;
      canvas.width = (window.innerWidth * scale) | 0;
      canvas.height = (window.innerHeight * scale) | 0;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);

    const tickerCb = (time: number) => {
      if (document.hidden || oceanStore.isCalm()) return;
      const bubEl = document.getElementById("bub");
      if (bubEl && Number(gsap.getProperty(bubEl, "opacity")) < 0.02) {
        return;
      }

      mouseSmoothed.x += (mouseRaw.x - mouseSmoothed.x) * 0.08;
      mouseSmoothed.y += (mouseRaw.y - mouseSmoothed.y) * 0.08;

      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform2f(uM, mouseSmoothed.x, mouseSmoothed.y);
      gl.uniform1f(uT, time);

      const maxScroll = ScrollTrigger?.maxScroll(window) || 1;
      const depthRatio = Math.min(1, window.scrollY / Math.max(1, maxScroll));
      gl.uniform1f(uD, depthRatio);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    gsap.ticker.add(tickerCb);

    return () => {
      gsap.ticker.remove(tickerCb);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      if (pr) gl.deleteProgram(pr);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="gl" aria-hidden="true" />;
}
