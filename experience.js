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
      if (document.hidden && trailFrame) { cancelAnimationFrame(trailFrame); trailFrame = 0; }
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

  let renderer, scene, camera, rig, earth, clouds, atmosphere, cityLights, rings = [], particles, key;
  let raf = 0, visible = false, disposed = false;
  let pointerX = 0, pointerY = 0, scrollProgress = 0;
  let particleBase = new Float32Array(0), particleVelocity = new Float32Array(0);
  const arcPulses = [];
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
    rig.position.y = Math.sin(elapsed * .55) * .045 - scrollProgress * .12;
    rig.scale.setScalar(1 + scrollProgress * .055);
    earth.rotation.y += .00062;
    earth.rotation.x = Math.sin(elapsed * .12) * .018;
    clouds.rotation.y += .00078;
    atmosphere.rotation.y -= .00012;
    cityLights.rotation.y = earth.rotation.y;
    rings.forEach((ring, index) => {
      ring.rotation.z += (index % 2 ? -1 : 1) * (.00075 + index * .00018);
      ring.rotation.x += .00022;
    });
    arcPulses.forEach((pulse) => {
      pulse.progress = (pulse.progress + pulse.speed) % 1;
      pulse.mesh.position.copy(pulse.curve.getPoint(pulse.progress));
      pulse.mesh.scale.setScalar(.78 + Math.sin(pulse.progress * Math.PI * 2) * .2);
    });
    // Cursor-following key light and local particle repulsion with spring return.
    key.position.x += (pointerX * 3.8 - key.position.x) * .045;
    key.position.y += (-pointerY * 2.8 - key.position.y) * .045;
    const particlePositions = particles.geometry.attributes.position;
    for (let i = 0; i < particlePositions.count; i += 1) {
      const ix = i * 3;
      const dx = particlePositions.array[ix] - pointerX * 2.5;
      const dy = particlePositions.array[ix + 1] + pointerY * 2.0;
      const dz = particlePositions.array[ix + 2];
      const distanceSq = dx * dx + dy * dy + dz * dz;
      if (distanceSq < 1.45) {
        const force = (1.45 - distanceSq) * .018;
        particleVelocity[ix] += dx * force;
        particleVelocity[ix + 1] += dy * force;
        particleVelocity[ix + 2] += dz * force;
      }
      particleVelocity[ix] += (particleBase[ix] - particlePositions.array[ix]) * .0018;
      particleVelocity[ix + 1] += (particleBase[ix + 1] - particlePositions.array[ix + 1]) * .0018;
      particleVelocity[ix + 2] += (particleBase[ix + 2] - particlePositions.array[ix + 2]) * .0018;
      particleVelocity[ix] *= .965;
      particleVelocity[ix + 1] *= .965;
      particleVelocity[ix + 2] *= .965;
      particlePositions.array[ix] += particleVelocity[ix];
      particlePositions.array[ix + 1] += particleVelocity[ix + 1];
      particlePositions.array[ix + 2] += particleVelocity[ix + 2];
    }
    particlePositions.needsUpdate = true;
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
      key = new THREE.PointLight(0x38bdf8, 38, 18, 2);
      key.position.set(3.5, 2.8, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0x315cff, 46, 16, 2);
      rim.position.set(-3.5, -2, -2);
      scene.add(rim);

      rig = new THREE.Group();
      scene.add(rig);

      // Textured Earth: day map, night-side city lights, cloud shell and a restrained atmosphere.
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous');
      const planetTextures = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r180/examples/textures/planets/';
      const sphereGeometry = new THREE.SphereGeometry(1.2, mobile ? 48 : 72, mobile ? 48 : 72);
      const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: new THREE.Color(0x355b80),
        shininess: 18,
        bumpScale: .018
      });
      earth = new THREE.Mesh(sphereGeometry, earthMaterial);
      rig.add(earth);

      const loadMap = (file, apply, colorMap = false) => {
        textureLoader.load(planetTextures + file, (texture) => {
          if (disposed) { texture.dispose(); return; }
          if (colorMap) texture.colorSpace = THREE.SRGBColorSpace;
          apply(texture);
        }, undefined, () => {
          // The scene remains usable if an optional texture host is unavailable.
          if (file === 'earth_atmos_2048.jpg') earthMaterial.color.set(0x174b82);
        });
      };
      loadMap('earth_atmos_2048.jpg', (texture) => {
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
      }, true);
      loadMap('earth_normal_2048.jpg', (texture) => {
        earthMaterial.normalMap = texture;
        earthMaterial.needsUpdate = true;
      });
      loadMap('earth_specular_2048.jpg', (texture) => {
        earthMaterial.specularMap = texture;
        earthMaterial.needsUpdate = true;
      });

      cityLights = new THREE.Mesh(
        new THREE.SphereGeometry(1.204, mobile ? 40 : 64, mobile ? 40 : 64),
        new THREE.MeshBasicMaterial({ color: 0x9bdcff, transparent: true, opacity: .58,
          blending: THREE.AdditiveBlending, depthWrite: false })
      );
      rig.add(cityLights);
      loadMap('earth_lights_2048.png', (texture) => {
        cityLights.material.map = texture;
        cityLights.material.needsUpdate = true;
      }, true);

      clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.218, mobile ? 40 : 64, mobile ? 40 : 64),
        new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: .2,
          depthWrite: false, blending: THREE.NormalBlending })
      );
      rig.add(clouds);
      loadMap('earth_clouds_1024.png', (texture) => {
        clouds.material.map = texture;
        clouds.material.needsUpdate = true;
      }, true);

      atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.29, mobile ? 40 : 64, mobile ? 40 : 64),
        new THREE.ShaderMaterial({
          uniforms: { glowColor: { value: new THREE.Color(0x38bdf8) } },
          vertexShader: 'varying vec3 vNormal; varying vec3 vViewPosition; void main(){ vNormal=normalize(normalMatrix*normal); vec4 mvPosition=modelViewMatrix*vec4(position,1.0); vViewPosition=-mvPosition.xyz; gl_Position=projectionMatrix*mvPosition; }',
          fragmentShader: 'uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vViewPosition; void main(){ float rim=pow(0.78-max(dot(normalize(vNormal),normalize(vViewPosition)),0.0),3.0); gl_FragColor=vec4(glowColor,clamp(rim,0.0,1.0)*0.9); }',
          side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
        })
      );
      rig.add(atmosphere);

      // Geographic hubs and curved routes make the globe read as a connected world.
      const globePoint = (lat, lon, radius = 1.235) => {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      };
      const hubs = [
        { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
        { name: 'New York', lat: 40.7128, lon: -74.006 },
        { name: 'London', lat: 51.5072, lon: -.1276 },
        { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
        { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503 }
      ];
      const hubMaterial = new THREE.MeshBasicMaterial({ color: 0xb7edff });
      const hubGeometry = new THREE.SphereGeometry(.018, 10, 10);
      const hubPoints = hubs.map((hub) => {
        const point = globePoint(hub.lat, hub.lon);
        const marker = new THREE.Mesh(hubGeometry, hubMaterial);
        marker.position.copy(point);
        rig.add(marker);
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(.037, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: .2 })
        );
        halo.position.copy(point);
        rig.add(halo);
        return point;
      });
      const routePairs = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,5]];
      routePairs.forEach(([from, to], index) => {
        const start = hubPoints[from].clone();
        const end = hubPoints[to].clone();
        const control = start.clone().add(end).multiplyScalar(.5).normalize().multiplyScalar(1.48 + (index % 3) * .045);
        const curve = new THREE.QuadraticBezierCurve3(start, control, end);
        const route = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(42)),
          new THREE.LineBasicMaterial({ color: index % 2 ? 0x38bdf8 : 0x8bdcff,
            transparent: true, opacity: .34, depthWrite: false })
        );
        rig.add(route);
        const pulse = new THREE.Mesh(
          new THREE.SphereGeometry(.022, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xe4f8ff, transparent: true, opacity: .95 })
        );
        rig.add(pulse);
        arcPulses.push({ mesh: pulse, curve, progress: index / routePairs.length, speed: .0018 + (index % 3) * .00035 });
      });

      const ringSpecs = [
        [1.58, .009, 0x38bdf8, .62, [1.05, .18, -.42]],
        [1.82, .007, 0x2563eb, .44, [-.55, 1.0, .72]],
        [1.43, .005, 0xb7eaff, .28, [.42, -.82, 1.1]]
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
      particleBase = positions.slice();
      particleVelocity = new Float32Array(positions.length);
      const particleGeometry = new THREE.BufferGeometry();
      const positionAttribute = new THREE.BufferAttribute(positions, 3);
      positionAttribute.setUsage(THREE.DynamicDrawUsage);
      particleGeometry.setAttribute('position', positionAttribute);
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
        const trackWorldPointer = (event) => {
          pointerX = (event.clientX / Math.max(1, innerWidth) - .5) * 2;
          pointerY = (event.clientY / Math.max(1, innerHeight) - .5) * 2;
        };
        addEventListener('pointermove', trackWorldPointer, { passive: true });
        addEventListener('blur', () => { pointerX = 0; pointerY = 0; });
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
        // Cinematic, scroll-scrubbed typography and card depth across the full site.
        gsap.utils.toArray('main > section:not(#home) .head h2').forEach((heading) => {
          gsap.fromTo(heading, { y: 30, opacity: 0, filter: 'blur(7px)' }, {
            y: 0, opacity: 1, filter: 'blur(0px)', ease: 'none',
            scrollTrigger: { trigger: heading, start: 'top 90%', end: 'top 58%', scrub: .8 }
          });
        });
        gsap.utils.toArray('main > section:not(#home) .card').forEach((card) => {
          gsap.fromTo(card, { y: 26, rotateX: 3, opacity: 0 }, {
            y: 0, rotateX: 0, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 72%', scrub: .7 }
          });
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
