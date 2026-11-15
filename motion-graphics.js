/* AIRNOXAE procedural motion language
 * Lightweight SVG energy paths complement the Three.js Earth without replacing layout.
 */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const surfaces = [...document.querySelectorAll('main > .sec, footer')];
  if (!surfaces.length) return;
  const style = document.createElement('style');
  style.textContent = [
    '.ax-motion-surface{position:relative;isolation:isolate;overflow:hidden}',
    '.ax-motion-surface>.wrap{position:relative;z-index:1}',
    '.ax-flow-layer{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;opacity:.48;mix-blend-mode:screen;transform:translate3d(var(--ax-flow-x,0px),var(--ax-flow-y,0px),0);transition:opacity .8s ease}',
    '.ax-flow-layer svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.ax-flow-layer path{fill:none;stroke-linecap:round;stroke-dasharray:7 18;stroke-dashoffset:0;animation:ax-flow-travel 26s linear infinite}',
    '.ax-flow-layer path:nth-of-type(2){stroke-width:1;stroke-dasharray:2 20;animation-duration:34s;animation-direction:reverse;opacity:.72}',
    '.ax-flow-layer path:nth-of-type(3){stroke-width:.7;stroke-dasharray:1 24;animation-duration:42s;opacity:.5}',
    '.ax-motion-surface.is-spatial-active .ax-flow-layer{opacity:.7}',
    '.ax-motion-surface:nth-of-type(even) .ax-flow-layer svg{transform:scaleX(-1)}',
    '@keyframes ax-flow-travel{to{stroke-dashoffset:-520}}',
    '@media(max-width:700px){.ax-flow-layer{opacity:.25}.ax-motion-surface.is-spatial-active .ax-flow-layer{opacity:.36}}',
    '@media(prefers-reduced-motion:reduce){.ax-flow-layer path{animation:none!important}.ax-flow-layer{transform:none!important;transition:none!important}}'
  ].join('');
  document.head.appendChild(style);
  const ns='http://www.w3.org/2000/svg';
  surfaces.forEach((surface,index)=>{
    surface.classList.add('ax-motion-surface');
    const layer=document.createElement('div');
    layer.className='ax-flow-layer';
    layer.setAttribute('aria-hidden','true');
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 1200 760');
    svg.setAttribute('preserveAspectRatio','none');
    const defs=document.createElementNS(ns,'defs');
    const gradient=document.createElementNS(ns,'linearGradient');
    const gradientId='ax-flow-gradient-'+index;
    gradient.setAttribute('id',gradientId);
    gradient.setAttribute('x1','0%');gradient.setAttribute('y1','0%');
    gradient.setAttribute('x2','100%');gradient.setAttribute('y2','100%');
    [['0%','#2563EB','.04'],['48%','#38BDF8','.72'],['100%','#2563EB','.03']].forEach(([offset,color,opacity])=>{
      const stop=document.createElementNS(ns,'stop');
      stop.setAttribute('offset',offset);stop.setAttribute('stop-color',color);stop.setAttribute('stop-opacity',opacity);
      gradient.appendChild(stop);
    });
    defs.appendChild(gradient);svg.appendChild(defs);
    const paths=[
      'M-80 590 C130 190 310 760 520 390 S880 70 1280 330',
      'M-120 690 C160 390 310 120 590 430 S920 720 1320 210',
      'M-90 330 C210 40 390 640 680 350 S1010 120 1300 520'
    ];
    paths.forEach((d,pathIndex)=>{
      const path=document.createElementNS(ns,'path');
      path.setAttribute('d',d);path.setAttribute('stroke','url(#'+gradientId+')');
      path.setAttribute('stroke-width',pathIndex===0?'1.6':'1');
      path.style.animationDelay=(-index*3.7-pathIndex*4.2)+'s';
      svg.appendChild(path);
    });
    layer.appendChild(svg);surface.insertBefore(layer,surface.firstChild);
    if(reduce)return;
    if('IntersectionObserver'in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>surface.classList.toggle('is-spatial-active',entry.isIntersecting)),{threshold:.08});
      observer.observe(surface);
    }else surface.classList.add('is-spatial-active');
  });
  if(finePointer&&!reduce){
    let frame=0,px=0,py=0;
    window.addEventListener('pointermove',event=>{
      px=(event.clientX/Math.max(1,window.innerWidth)-.5)*12;
      py=(event.clientY/Math.max(1,window.innerHeight)-.5)*8;
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        document.querySelectorAll('.ax-flow-layer').forEach((layer,index)=>{
          const direction=index%2?-1:1;
          layer.style.setProperty('--ax-flow-x',(px*direction).toFixed(2)+'px');
          layer.style.setProperty('--ax-flow-y',(py*direction).toFixed(2)+'px');
        });
        frame=0;
      });
    },{passive:true});
  }
})();
