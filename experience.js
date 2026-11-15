/* AIRNOXAE immersive experience
 * Progressive enhancement: the page remains complete if WebGL/CDN imports are unavailable.
 */
(() => {
  'use strict';
  const stage = document.getElementById('hero-stage');
  const canvas = document.getElementById('experience-canvas');
  if (!stage || !canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const supportsWebGL = (() => {
    try {
      const test = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (test.getContext('webgl') || test.getContext('experimental-webgl')));
    } catch (_) { return false; }
  })();

  // A small, low-cost spatial treatment continues through the page without a dependency.
  const cards = [...document.querySelectorAll('.card')];
  if (finePointer && !reducedMotion) {
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${-y * 3.2}deg) rotateY(${x * 3.8}deg) translateY(-5px)`;
      }, { passive: true });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Global pointer field: one shared interaction system across every section.
  const worldStyle = document.createElement('style');
  worldStyle.textContent = `
    .ax-cursor, .ax-cursor-trail, .ax-click-ripple { position:fixed; left:0; top:0; pointer-events:none; z-index:120; border-radius:50%; }
    .ax-cursor { width:12px; height:12px; margin:-6px 0 0 -6px; background:#8bdcff; box-shadow:0 0 18px 5px rgba(56,189,248,.45); opacity:0; transition:width .22s,height .22s,background .22s,opacity .2s; mix-blend-mode:screen; }
    .ax-cursor-ring { position:fixed; left:0; top:0; width:38px; height:38px; margin:-19px 0 0 -19px; border:1px solid rgba(139,220,255,.62); border-radius:50%; pointer-events:none; z-index:119; opacity:0; transition:width .25s,height .25s,border-color .25s,opacity .2s; }
    .ax-cursor.is-hot { width:22px; height:22px; margin:-11px 0 0 -11px; background:#fff; }
    .ax-cursor-ring.is-hot { width:58px; height:58px; margin:-29px 0 0 -29px; border-color:rgba(56,189,248,.95); }
    .ax-cursor-trail { width:4px; height:4px; margin:-2px; background:#38bdf8; box-shadow:0 0 12px 2px rgba(56,189,248,.55); opacity:0; }
    .ax-click-ripple { width:12px; height:12px; margin:-6px; border:1px solid rgba(139,220,255,.85); animation:ax-ripple .65s ease-out forwards; }
    @keyframes ax-ripple { to { width:86px; height:86px; margin:-43px; opacity:0; } }
    @media (hover:hover) and (pointer:fine) { body.ax-pointer-ready, body.ax-pointer-ready a, body.ax-pointer-ready button { cursor:none; } body.ax-pointer-ready input,body.ax-pointer-ready textarea,body.ax-pointer-ready select { cursor:text; } }
    @media (prefers-reduced-motion:reduce) { .ax-cursor,.ax-cursor-ring,.ax-cursor-trail,.ax-click-ripple { display:none!important; } }
  `;
  document.head.appendChild(worldStyle);

  if (finePointer && !reducedMotion) {
    const cursor = document.createElement('i');
    const ring = document.createElement('i');
    cursor.className = 'ax-cursor';
    ring.className = 'ax-cursor-ring';
    document.body.append(cursor, ring);
    const trail = Array.from({ length: mobile ? 5 : 10 }, () => {
      const dot = document.createElement('i');
      dot.className = 'ax-cursor-trail';
      document.body.appendChild(dot);
      return { el: dot, x: -100, y: -100 };
    });
    const pointer = { x: -100, y: -100, tx: -100, ty: -100 };
    let trailFrame = 0;
    const move = (event) => {
      pointer.tx = event.clientX; pointer.ty = event.clientY;
      cursor.style.opacity = ring.style.opacity = '1';
      document.documentElement.style.setProperty('--ax-pointer-x', event.clientX + 'px');
      document.documentElement.style.setProperty('--ax-pointer-y', event.clientY + 'px');
    };
    const animateTrail = () => {
      pointer.x += (pointer.tx - pointer.x) * .34;
      pointer.y += (pointer.ty - pointer.y) * .34;
      cursor.style.transform = `translate3d(${pointer.tx}px,${pointer.ty}px,0)`;
      ring.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0)`;
      let x = pointer.x, y = pointer.y;
      trail.forEach((dot, index) => {
        const follow = .28 - index * .014;
        dot.x += (x - dot.x) * follow;
        dot.y += (y - dot.y) * follow;
        dot.el.style.transform = `translate3d(${dot.x}px,${dot.y}px,0)`;
        dot.el.style.opacity = String((1 - index / trail.length) * .7);
        x = dot.x; y = dot.y;
      });
      trailFrame = requestAnimationFrame(animateTrail);
    };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', (event) => {
      const ripple = document.createElement('i');
      ripple.className = 'ax-click-ripple';
      ripple.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }, { passive: true });
    document.addEventListener('pointerover', (event) => {
      const hot = event.target.closest('a,button,[role="button"],.card');
      cursor.classList.toggle('is-hot', !!hot);
      ring.classList.toggle('is-hot', !!hot);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = ring.style.opacity = '0'; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && trailFrame) cancelAnimationFrame(trailFrame);
      else if (!document.hidden && !trailFrame) trailFrame = requestAnimationFrame(animateTrail);
    });
    document.body.classList.add('ax-pointer-ready');
    trailFrame = requestAnimationFrame(animateTrail);

    // Magnetic pull is deliberately small and only applies to primary actions.
    document.querySelectorAll('.btn,.mag,nav a.l').forEach((target) => {
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        target.style.translate = `${dx * .055}px ${dy * .075}px`;
      }, { passive: true });
      target.addEventListener('pointerleave', () => { target.style.translate = ''; });
    });
  }

  // A shared pointer-lit surface and scroll depth variables keep the visual language
  // consistent across sections even while the hero's WebGL scene is out of view.
  if (!reducedMotion) {
    let scrollTick = false;
    const updateWorld = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      document.documentElement.style.setProperty('--ax-scroll-progress', String(scrollY / max));
      scrollTick = false;
    };
    addEventListener('scroll', () => {
      if (!scrollTick) { scrollTick = true; requestAnimationFrame(updateWorld); }
    }, { passive: true });
    updateWorld();
  }

  // Scroll-linked section reveal and a restrained cinematic camera drift.
  const sections = [...document.querySelectorAll('main > section')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.dataset.spatialActive = 'true';
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .18 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  if (reducedMotion || !supportsWebGL) return;

  let renderer, scene, camera, rig, core, wire, rings = [], particles;
  let raf = 0, visible = false, disposed = false;
  let pointerX = 0, pointerY = 0, scrollProgress = 0;
  const clockStart = performance.now();

  const resize = () => {
    if (!renderer || !camera) return;
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5));
    camera.aspect = width / height;
    camera.position.z = mobile ? 7.6 : 6.6;
    camera.updateProjectionMatrix();
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const render = (time) => {
    raf = 0;
    if (disposed || !visible || !renderer) return;
    const elapsed = (time - clockStart) * .001;
    const targetX = pointerY * .16;
    const targetY = pointerX * .2;
    rig.rotation.x += (targetX + scrollProgress * .13 - rig.rotation.x) * .035;
    rig.rotation.y += (targetY + scrollProgress * .32 - rig.rotation.y) * .035;
    rig.position.y = Math.sin(elapsed * .55) * .075 - scrollProgress * .12;
    core.rotation.x += .0018;
    core.rotation.y += .003;
    wire.rotation.x -= .0011;
    wire.rotation.y += .0014;
    rings.forEach((ring, index) => {
      ring.rotation.z += (index % 2 ? -1 : 1) * (.001 + index * .00025);
      ring.rotation.x += .00035;
    });
    particles.rotation.y = elapsed * .012;
    particles.rotation.x = Math.sin(elapsed * .15) * .05;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };

  const start = () => {
    if (!visible || raf || disposed || !renderer) return;
    raf = requestAnimationFrame(render);
  };

  const init = async () => {
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      if (disposed) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
      camera.position.set(0, 0, mobile ? 7.6 : 6.6);
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !mobile,
        powerPreference: 'low-power',
        depth: true,
        stencil: false
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5));

      const ambient = new THREE.HemisphereLight(0x9ccfff, 0x071020, 1.55);
      scene.add(ambient);
      const key = new THREE.PointLight(0x38bdf8, 38, 18, 2);
      key.position.set(3.5, 2.8, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0x315cff, 46, 16, 2);
      rim.position.set(-3.5, -2, -2);
      scene.add(rim);

      rig = new THREE.Group();
      scene.add(rig);

      const shape = new THREE.IcosahedronGeometry(1.22, 2);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x183b68,
        metalness: .78,
        roughness: .2,
        clearcoat: 1,
        clearcoatRoughness: .12,
        iridescence: .28,
        emissive: 0x071a3b,
        emissiveIntensity: .7
      });
      core = new THREE.Mesh(shape, material);
      rig.add(core);

      const wireGeo = new THREE.IcosahedronGeometry(1.34, 1);
      wire = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({
        color: 0x8bdcff,
        wireframe: true,
        transparent: true,
        opacity: .22
      }));
      rig.add(wire);

      const ringSpecs = [
        [1.8, .012, 0x38bdf8, .72, [1.05, .18, -.42]],
        [2.05, .008, 0x2563eb, .55, [-.55, 1.0, .72]],
        [1.58, .006, 0xb7eaff, .34, [.42, -.82, 1.1]]
      ];
      ringSpecs.forEach(([radius, tube, color, opacity, rotation]) => {
        const geometry = new THREE.TorusGeometry(radius, tube, 8, 160);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          color, transparent: true, opacity
        }));
        mesh.rotation.set(...rotation);
        rig.add(mesh);
        rings.push(mesh);
      });

      const count = mobile ? 72 : 156;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const radius = 2.1 + Math.random() * 2.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
        color: 0x8bdcff,
        size: mobile ? .018 : .024,
        transparent: true,
        opacity: .62,
        sizeAttenuation: true,
        depthWrite: false
      }));
      scene.add(particles);

      resize();
      stage.classList.add('webgl-ready');
      if (finePointer) {
        stage.addEventListener('pointermove', (event) => {
          const rect = stage.getBoundingClientRect();
          pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
          pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2;
        }, { passive: true });
        stage.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
      }

      // GSAP is optional: if its CDN is unavailable, the native scene and CSS reveals remain.
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('https://cdn.jsdelivr.net/npm/gsap@3.14.2/index.js'),
          import('https://cdn.jsdelivr.net/npm/gsap@3.14.2/ScrollTrigger.js')
        ]);
        gsap.registerPlugin(ScrollTrigger);
        gsap.to({ progress: 0 }, {
          progress: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            endTrigger: '#contact',
            end: 'bottom bottom',
            scrub: 1.4,
            onUpdate: (self) => { scrollProgress = self.progress; }
          }
        });
        ScrollTrigger.refresh();
      } catch (_) {
        const updateScroll = () => {
          const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
          scrollProgress = Math.min(1, Math.max(0, scrollY / max));
        };
        addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
      });
      const visibility = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting && !document.hidden;
        if (visible) start();
        else stop();
      }, { threshold: 0.01 });
      visibility.observe(stage);
      addEventListener('resize', resize, { passive: true });
      start();
    } catch (_) {
      // Keep the original CSS sculpture visible when WebGL or the CDN is unavailable.
      canvas.hidden = true;
      stage.classList.remove('webgl-ready');
    }
  };

  const loader = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loader.disconnect();
      init();
    }
  }, { rootMargin: '180px' });
  loader.observe(stage);

  // Release GPU resources if the page is restored or the scene is explicitly removed.
  addEventListener('pagehide', () => {
    disposed = true;
    stop();
    if (renderer) {
      scene?.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
        else object.material?.dispose?.();
      });
      renderer.dispose();
    }
  }, { once: true });
})();
