<script setup>
import {computed,ref,onMounted} from 'vue'
const ready=ref(false)
onMounted(()=>{ready.value=true})
const t=ref(.25),s=ref(1/3)
const l=computed(()=>[1-t.value-(1-t.value)*s.value,t.value,(1-t.value)*s.value])
const point=computed(()=>({x:80+480*l.value[1],y:270-230*l.value[2]}))
const fmt=x=>Number(x).toFixed(3)
function reset(){t.value=.25;s.value=1/3}
</script>
<template>
  <section v-if="ready" class="bary-demo" aria-label="面积坐标演示">
    <h3>移动点，观察面积权重</h3>
    <svg viewBox="0 0 660 315" role="img" :aria-label="`面积坐标 ${l.map(fmt).join('，')}`">
      <path d="M80 270L560 270L80 40Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <path :d="`M80 40L560 270L${point.x} ${point.y}Z`" fill="#b9d9cc" stroke="currentColor"/>
      <path :d="`M80 270L80 40L${point.x} ${point.y}Z`" fill="#e4d7b6" stroke="currentColor"/>
      <path :d="`M80 270L560 270L${point.x} ${point.y}Z`" fill="#b7d6e5" stroke="currentColor"/>
      <circle :cx="point.x" :cy="point.y" r="5" fill="currentColor"/>
      <text x="55" y="300" fill="currentColor">1 (0,0)</text><text x="535" y="300" fill="currentColor">2 (2,0)</text><text x="55" y="30" fill="currentColor">3 (0,1)</text>
    </svg>
    <div class="demo-controls">
      <label>横向位置 x/2 = {{fmt(t)}}<input aria-label="横向位置" v-model.number="t" type="range" min="0" max="1" step="0.01"/></label>
      <label>剩余高度比例 = {{fmt(s)}}<input aria-label="剩余高度比例" v-model.number="s" type="range" min="0" max="1" step="0.01"/></label>
      <button type="button" @click="reset">重置</button>
    </div>
    <p aria-live="polite">L₁={{fmt(l[0])}} · L₂={{fmt(l[1])}} · L₃={{fmt(l[2])}}；和={{fmt(l.reduce((a,b)=>a+b,0))}}</p>
    <p class="hint">位置为 ({{fmt(2*l[1])}}, {{fmt(l[2])}})。可用方向键精调滑块。</p>
  </section>
</template>
