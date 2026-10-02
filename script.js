/**
 * VEGUPATHIRAJAN GOTHANDARAMAN - CINEMATIC 3D DEVELOPER PORTFOLIO
 * Core Engine: Three.js 3D Spatial Canvas, Web Audio API Synthesizer,
 * Cyber Terminal, 3D Tilt Parallax & Interactive Holographic Systems.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (Sci-Fi Sound FX Engine - Zero External Files)
  // =========================================================================
  class CyberAudio {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.ambientOsc = null;
      this.ambientGain = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.init();
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.playWarp();
        this.startAmbience();
      } else {
        this.stopAmbience();
      }
      return this.enabled;
    }

    playHover() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {}
    }

    playClick() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    playWarp() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(960, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
      } catch (e) {}
    }

    playTerminalKey() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freqs = [600, 750, 900, 1050];
        const f = freqs[Math.floor(Math.random() * freqs.length)];
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
      } catch (e) {}
    }

    startAmbience() {
      if (!this.ctx || this.ambientOsc) return;
      try {
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        this.ambientOsc.type = 'sawtooth';
        this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Deep A1 drone

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);

        this.ambientGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

        this.ambientOsc.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);
        this.ambientOsc.start();
      } catch (e) {}
    }

    stopAmbience() {
      if (this.ambientOsc) {
        try {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
          setTimeout(() => {
            if (this.ambientOsc) {
              this.ambientOsc.stop();
              this.ambientOsc.disconnect();
              this.ambientOsc = null;
            }
          }, 500);
        } catch (e) {
          this.ambientOsc = null;
        }
      }
    }
  }

  const soundSystem = new CyberAudio();

  // Attach Audio UI Toggle
  const audioBtn = document.getElementById('audioToggle');
  const audioLabel = document.getElementById('audioLabel');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isMuted = soundSystem.toggle();
      audioBtn.classList.toggle('audio-on', isMuted);
      if (audioLabel) {
        audioLabel.textContent = isMuted ? 'AUDIO: ON' : 'AUDIO: OFF';
      }
    });
  }

  // Bind sound events across elements
  document.querySelectorAll('[data-hover-sound]').forEach(el => {
    el.addEventListener('mouseenter', () => soundSystem.playHover());
  });
  document.querySelectorAll('[data-click-sound]').forEach(el => {
    el.addEventListener('click', () => soundSystem.playClick());
  });

  // =========================================================================
  // 2. THREE.JS 3D SPATIAL CANVAS ENGINE
  // =========================================================================
  const canvas = document.getElementById('webgl-canvas');
  let scene, camera, renderer;
  let coreGroup, centralCore, ring1, ring2, ring3, satellites = [];
  let starField;
  let mouseX = 0, mouseY = 0;
  let targetCameraX = 0, targetCameraY = 0;
  let scrollProgress = 0;

  function initThreeScene() {
    if (typeof THREE === 'undefined' || !canvas) {
      console.warn("Three.js not found, falling back to 2D canvas.");
      initFallback2DCanvas();
      return;
    }

    try {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030712, 0.015);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 16);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lights
      const ambientLight = new THREE.AmbientLight(0x081b33, 1.2);
      scene.add(ambientLight);

      const cyanPoint = new THREE.PointLight(0x00f0ff, 3, 50);
      cyanPoint.position.set(5, 5, 8);
      scene.add(cyanPoint);

      const purplePoint = new THREE.PointLight(0xa855f7, 2.5, 50);
      purplePoint.position.set(-6, -4, 6);
      scene.add(purplePoint);

      // 1. Quantum Core Group
      coreGroup = new THREE.Group();
      scene.add(coreGroup);

      // Central Icosahedron Wireframe Core
      const coreGeo = new THREE.IcosahedronGeometry(2.4, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        wireframe: true,
        emissive: 0x004466,
        roughness: 0.2,
        metalness: 0.9
      });
      centralCore = new THREE.Mesh(coreGeo, coreMat);
      coreGroup.add(centralCore);

      // Inner Glowing Solid Core
      const innerGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: false,
        transparent: true,
        opacity: 0.35
      });
      const innerCore = new THREE.Mesh(innerGeo, innerMat);
      centralCore.add(innerCore);

      // 2. Orbital Tech Rings
      // Ring 1 (Cyan)
      const ringGeo1 = new THREE.TorusGeometry(3.6, 0.03, 16, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });
      ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      coreGroup.add(ring1);

      // Ring 2 (Purple)
      const ringGeo2 = new THREE.TorusGeometry(4.4, 0.035, 16, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.75 });
      ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = Math.PI / 3;
      coreGroup.add(ring2);

      // Ring 3 (Emerald)
      const ringGeo3 = new THREE.TorusGeometry(5.2, 0.025, 16, 100);
      const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.65 });
      ring3 = new THREE.Mesh(ringGeo3, ringMat3);
      ring3.rotation.y = Math.PI / 4;
      coreGroup.add(ring3);

      // 3. Orbiting Data Satellites
      const satGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
      const satColors = [0x00f0ff, 0xa855f7, 0x10b981, 0x38bdf8];
      for (let i = 0; i < 8; i++) {
        const satMat = new THREE.MeshBasicMaterial({
          color: satColors[i % satColors.length],
          wireframe: true
        });
        const sat = new THREE.Mesh(satGeo, satMat);
        const radius = 3.6 + (i % 3) * 0.9;
        const angle = (i / 8) * Math.PI * 2;
        sat.userData = { radius, angle, speed: 0.008 + (i * 0.003) };
        coreGroup.add(sat);
        satellites.push(sat);
      }

      // 4. Cosmic Particle Matrix (Starfield & Data Dust)
      const particleCount = 1800;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const color1 = new THREE.Color(0x00f0ff);
      const color2 = new THREE.Color(0xa855f7);
      const color3 = new THREE.Color(0x10b981);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80;
        positions[i + 1] = (Math.random() - 0.5) * 80;
        positions[i + 2] = (Math.random() - 0.5) * 70;

        const mixedColor = Math.random() < 0.4 ? color1 : (Math.random() < 0.7 ? color2 : color3);
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 0.75
      });
      starField = new THREE.Points(particleGeo, particleMat);
      scene.add(starField);

      // Listeners
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('scroll', onScroll);

      animateThree();
    } catch (err) {
      console.error("Three.js setup error:", err);
      initFallback2DCanvas();
    }
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  function animateThree() {
    requestAnimationFrame(animateThree);

    // Mouse Parallax Lerp
    targetCameraX += (mouseX * 2.5 - targetCameraX) * 0.05;
    targetCameraY += (mouseY * 2.5 - targetCameraY) * 0.05;

    // Scroll Travel Camera Coordinates
    const scrollAngle = scrollProgress * Math.PI * 2;
    camera.position.x = targetCameraX + Math.sin(scrollAngle * 0.5) * 2.5;
    camera.position.y = targetCameraY - (scrollProgress * 6) + 1;
    camera.position.z = 16 - (Math.sin(scrollProgress * Math.PI) * 4);
    camera.lookAt(0, -scrollProgress * 2, 0);

    // Core Rotation
    if (centralCore) {
      centralCore.rotation.x += 0.005;
      centralCore.rotation.y += 0.008;
    }
    if (ring1) ring1.rotation.z += 0.006;
    if (ring2) ring2.rotation.y += 0.009;
    if (ring3) ring3.rotation.x += 0.007;

    // Satellites orbital motion
    satellites.forEach(sat => {
      sat.userData.angle += sat.userData.speed;
      sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
      sat.position.y = Math.sin(sat.userData.angle) * sat.userData.radius * 0.5;
      sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius * 0.8;
      sat.rotation.x += 0.02;
      sat.rotation.y += 0.03;
    });

    // Starfield gentle rotation
    if (starField) {
      starField.rotation.y += 0.0004;
      starField.rotation.x += 0.0002;
    }

    renderer.render(scene, camera);
  }

  // Fallback 2D Animated Canvas if WebGL is unsupported
  function initFallback2DCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 2 + 1
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#00f0ff';

      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }
    loop();
  }

  // =========================================================================
  // 3. CINEMATIC PRELOADER SEQUENCE
  // =========================================================================
  const preloader = document.getElementById('preloader');
  const preloaderLog = document.getElementById('preloaderLog');
  const preloaderFill = document.getElementById('preloaderFill');
  const preloaderPercent = document.getElementById('preloaderPercent');
  const btnEnter = document.getElementById('btnEnter');

  const bootLogs = [
    "[01/04] INITIALIZING SPATIAL 3D CANVAS...",
    "[02/04] COMPILING QUANTUM PARTICLES & SHADERS...",
    "[03/04] MOUNTING VEGUPATHIRAJAN AI SYSTEM...",
    "[04/04] SYSTEM READY. ENTERING NEURAL REALM..."
  ];

  let currentPercent = 0;
  let logIdx = 0;

  function runPreloader() {
    const interval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 15) + 8;
      if (currentPercent > 100) currentPercent = 100;

      if (preloaderFill) preloaderFill.style.width = currentPercent + '%';
      if (preloaderPercent) preloaderPercent.textContent = currentPercent + '%';

      if (currentPercent > 25 && logIdx === 0) {
        logIdx = 1;
        if (preloaderLog) preloaderLog.textContent = bootLogs[1];
      } else if (currentPercent > 55 && logIdx === 1) {
        logIdx = 2;
        if (preloaderLog) preloaderLog.textContent = bootLogs[2];
      } else if (currentPercent > 85 && logIdx === 2) {
        logIdx = 3;
        if (preloaderLog) preloaderLog.textContent = bootLogs[3];
      }

      if (currentPercent >= 100) {
        clearInterval(interval);
        setTimeout(dismissPreloader, 400);
      }
    }, 90);
  }

  function dismissPreloader() {
    if (preloader) {
      preloader.classList.add('fade-out');
      soundSystem.playWarp();
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }
  }

  if (btnEnter) {
    btnEnter.addEventListener('click', dismissPreloader);
  }

  // =========================================================================
  // 4. TYPEWRITER SCRAMBLE SUBTITLE
  // =========================================================================
  const typewriterEl = document.getElementById('heroTypewriter');
  const titles = [
    "Architecting Intelligent Python Automations & Custom ETL Pipelines.",
    "Deploying Semantic Search & RAG Assistants (FAISS + Llama 3).",
    "Integrating Google Gemini & OpenAI LLM APIs into Production.",
    "Engineering 1-Click WhatsApp Lead Workflows for Retailers.",
    "Deploying Resilient Cloud Infrastructure on AWS EC2 & Netlify."
  ];

  let titleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function typeWriter() {
    if (!typewriterEl) return;
    const currentText = titles[titleIdx];

    if (isDeleting) {
      charIdx--;
      typewriterEl.textContent = currentText.substring(0, charIdx);
    } else {
      charIdx++;
      typewriterEl.textContent = currentText.substring(0, charIdx);
    }

    let typeSpeed = isDeleting ? 30 : 60;

    if (!isDeleting && charIdx === currentText.length) {
      typeSpeed = 2200; // Pause at full line
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      titleIdx = (titleIdx + 1) % titles.length;
      typeSpeed = 400;
    }

    setTimeout(typeWriter, typeSpeed);
  }

  // =========================================================================
  // 5. 3D INTERACTIVE CARD TILT (Perspective Parallax)
  // =========================================================================
  function initTiltCards() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    tiltElements.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // =========================================================================
  // 6. INTERACTIVE NEURAL CONSOLE / CYBER TERMINAL
  // =========================================================================
  const terminalInput = document.getElementById('terminalInput');
  const terminalHistory = document.getElementById('terminalHistory');
  const terminalScreen = document.getElementById('terminalScreen');
  const commandChips = document.querySelectorAll('.t-chip, .t-cmd-chip');

  const termCommands = {
    help: `AVAILABLE COMMANDS:
  • <span class="t-highlight">skills</span>       - Inspect full technical proficiencies
  • <span class="t-highlight">projects</span>     - Browse featured production projects
  • <span class="t-highlight">resume</span>       - View professional summary & download links
  • <span class="t-highlight">contact</span>      - Display direct WhatsApp, email & phone
  • <span class="t-highlight">hire</span>         - Quick invitation to connect for jobs/projects
  • <span class="t-highlight">bio</span>          - Engineering dossier & background
  • <span class="t-highlight">matrix</span>       - Trigger cyber matrix rain sequence
  • <span class="t-highlight">sudo hire vegupathi</span> - Special authorization sequence
  • <span class="t-highlight">clear</span>        - Clear terminal screen buffer`,

    skills: `CORE TECHNICAL STACK:
  [🐍 PROGRAMMING &amp; AUTOMATION]
    - Python 3, OOP, File Handling, Web Scraping (BeautifulSoup, Requests)
    - Custom ETL Pipelines, Scheduled Background Daemons, JSON Manipulation
  [🧠 GENERATIVE AI &amp; RAG]
    - FAISS Vector DB Indexing, Sentence-Transformers, Semantic Embeddings
    - Local LLM Execution via Ollama (Llama 3) on Colab GPUs
    - Google Gemini API &amp; OpenAI API Integrations, Structured Outputs
  [🌐 WEB &amp; COMMERCE]
    - HTML5, Tailwind CSS, JavaScript (ES6), Mobile-First UI
    - WhatsApp Business Link API with dynamic SKU parameterization
  [☁️ CLOUD &amp; TOOLS]
    - AWS EC2 Linux deployment, SSH, Git &amp; GitHub, MySQL (XAMPP)`,

    projects: `FEATURED PRODUCTION REPOSITORIES:
  1. <span class="t-highlight">AI Document Search &amp; Assistant (RAG System)</span>
     • Tech: Python, FAISS, Llama 3, Ollama, Sentence-Transformers, Colab GPU
     • Chunking, vector embeddings, grounded local LLM Q&A.
  2. <span class="t-highlight">AI-Powered Data Automation &amp; Reporting Tools</span>
     • Tech: Python, Gemini API, OpenAI API, REST APIs, JSON
     • Automated text extraction, summarizing, and JSON export pipelines.
  3. <span class="t-highlight">Retail Boutique Showcase &amp; WhatsApp Lead Engine</span>
     • Tech: HTML5, Tailwind CSS, JavaScript, WhatsApp API, Netlify
     • Live at: https://demo-project614713.netlify.app/
  4. <span class="t-highlight">Python Web Scraper &amp; File Pipeline Suite</span>
     • Tech: Python, BeautifulSoup, Requests, CSV/Excel Automation`,

    resume: `VEGUPATHIRAJAN GOTHANDARAMAN - RESUME SUMMARY:
  • Role: Junior Python Developer | AI Integrations • Automation • Web
  • Education: Diploma in Computer Science &amp; Engg. (First Class, 2024)
  • Experience: Freelance Python &amp; Web Developer (May 2024 - Present)
  • Live Web Resume: <a href="resume.html" target="_blank" class="t-highlight">Open resume.html &rarr;</a>
  • Direct PDF: <a href="resume.pdf" download class="t-highlight">Download resume.pdf &rarr;</a>`,

    contact: `COMMUNICATION CHANNELS:
  • WhatsApp: <a href="https://wa.me/919360206902" target="_blank" class="t-highlight">+91 93602 06902</a>
  • Email: <a href="mailto:vegupathi666@gmail.com" class="t-highlight">vegupathi666@gmail.com</a>
  • LinkedIn: <a href="https://www.linkedin.com/in/vegupathi-g/" target="_blank" class="t-highlight">linkedin.com/in/vegupathi-g</a>
  • GitHub: <a href="https://github.com/vegudev" target="_blank" class="t-highlight">github.com/vegudev</a>`,

    hire: `LOOKING TO HIRE A DEDICATED PYTHON DEVELOPER?
  Vegupathirajan brings high initiative, rapid learning, and proven ability
  to automate workflows and integrate cutting-edge AI APIs.
  Click to launch WhatsApp directly:
  👉 <a href="https://wa.me/919360206902?text=Hello%20Vegupathirajan,%20we%20want%20to%20hire%20you!" target="_blank" class="t-highlight">Open WhatsApp Chat &rarr;</a>`,

    bio: `AGENT DOSSIER // VEGUPATHIRAJAN GOTHANDARAMAN:
  Self-driven Junior Python Developer based in Chennai, Tamil Nadu.
  Passionate about converting complex manual tasks into elegant automated
  scripts and connecting real-world businesses with modern Generative AI tooling.`,

    whoami: `GUEST_AGENT // You are an esteemed recruiter, tech lead, or fellow builder visiting Vegupathi's Neural Matrix.`,

    date: `SYS_TIMESTAMP: ${new Date().toUTCString()} (Local: Chennai IST)`,

    matrix: `<span class="output-success">01001001 01001110 01001001 01010100 00100000 01000011 01001111 01010010 01000101
WAKE UP, RECRUITER... THE NEURAL MATRIX HAS YOU.
FOLLOW THE CYAN RABBIT: VEGUPATHIRAJAN GOTHANDARAMAN.</span>`,

    "sudo hire vegupathi": `<span class="output-success">[ACCESS GRANTED: ROOT CLEARANCE]
🎉 EXCELLENT DECISION! Initiating direct contact protocol...
Redirecting to WhatsApp with Vegupathirajan:
<a href="https://wa.me/919360206902?text=Hi%20Vegupathi!%20I%20executed%20'sudo%20hire%20vegupathi'%20on%20your%20portfolio!" target="_blank" class="t-highlight">👉 CONNECT ON WHATSAPP (+91 93602 06902) &rarr;</a></span>`
  };

  function handleTerminalCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    soundSystem.playTerminalKey();

    // Echo input
    const echoLine = document.createElement('div');
    echoLine.className = 'term-line cmd';
    echoLine.innerHTML = `vegudev@quantum:~$ ${escapeHtml(cmdRaw)}`;
    terminalHistory.appendChild(echoLine);

    if (cmd === 'clear') {
      terminalHistory.innerHTML = '';
      if (terminalInput) terminalInput.value = '';
      return;
    }

    const responseLine = document.createElement('div');
    responseLine.className = 'term-line output-text';

    if (cmd in termCommands) {
      responseLine.innerHTML = termCommands[cmd];
    } else if (cmd === 'cat resume.txt') {
      responseLine.innerHTML = termCommands['resume'];
    } else {
      responseLine.className = 'term-line output-error';
      responseLine.innerHTML = `Command not recognized: '${escapeHtml(cmd)}'. Type <span class="t-highlight">'help'</span> for instructions.`;
    }

    terminalHistory.appendChild(responseLine);

    if (terminalInput) terminalInput.value = '';
    if (terminalScreen) {
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    }
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        handleTerminalCommand(terminalInput.value);
      }
    });
  }

  commandChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) {
        handleTerminalCommand(cmd);
      }
    });
  });

  // =========================================================================
  // 7. PROJECT BLUEPRINT MODAL
  // =========================================================================
  const blueprintModal = document.getElementById('blueprintModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const modalCloseBottom = document.getElementById('modalCloseBottom');

  const blueprints = {
    rag: {
      title: "AI DOCUMENT SEARCH & ASSISTANT (RAG SYSTEM)",
      content: `
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Architecture Blueprint</h4>
        <div class="blueprint-flow">
[ RAW DOCUMENTS (.txt, .pdf) ]
              │
              ▼
   [ Text Chunking Engine ]
              │
              ▼
  [ Sentence-Transformers ] ──> Vector Embeddings (384-dim)
              │
              ▼
      [ FAISS Index ] <── Query Embedding
              │
              ▼
   [ Top-K Context Match ]
              │
              ▼
[ Local Llama 3 (Ollama / Colab GPU) ] ──> Grounded, Factual Response
        </div>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Technical Highlights</h4>
        <ul style="margin-left: 20px; margin-bottom: 16px;">
          <li><b>Vector Indexing:</b> Fast similarity matching using FAISS for low-latency section retrieval.</li>
          <li><b>Local LLM Inference:</b> Connected to local Llama 3 running via Ollama on Google Colab GPU environment.</li>
          <li><b>Hallucination Prevention:</b> Prompt engineered to ground all replies strictly in retrieved context.</li>
        </ul>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Core Stack</h4>
        <p>Python, FAISS, Sentence-Transformers, Llama 3, Ollama, Google Colab</p>
      `
    },
    automation: {
      title: "AI-POWERED DATA AUTOMATION & REPORTING TOOLS",
      content: `
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Architecture Blueprint</h4>
        <div class="blueprint-flow">
[ Unstructured Data Ingestion (Logs, Raw Text, Web Dumps) ]
              │
              ▼
  [ Python Extraction Handler ] ──> Schema Normalization
              │
              ▼
 [ Google Gemini / OpenAI API ] ──> Few-Shot Classification & Extraction
              │
              ▼
[ Resilient Response Validator ] ──> Rate Limit Throttling & Retries
              │
              ▼
   [ Structured JSON Output ] ──> Automated CSV / Database Sink
        </div>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Technical Highlights</h4>
        <ul style="margin-left: 20px; margin-bottom: 16px;">
          <li><b>Resilient APIs:</b> Robust error handling with exponential backoff against API rate limits.</li>
          <li><b>Schema Enforcement:</b> Guarantees structured JSON outputs suitable for downstream database ingestion.</li>
          <li><b>Efficiency:</b> Replaces hours of manual text classification with sub-second API pipelines.</li>
        </ul>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Core Stack</h4>
        <p>Python, Google Gemini API, OpenAI API, REST APIs, JSON Engine</p>
      `
    },
    retail: {
      title: "RETAIL BOUTIQUE WEB APP & WHATSAPP LEAD ENGINE",
      content: `
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Architecture Blueprint</h4>
        <div class="blueprint-flow">
[ Mobile Shopper Visits Catalogue ]
              │
              ▼
[ Responsive Showcase UI (Tailwind CSS) ] ──> Filter by Sarees / Salwars / Kurtis
              │
              ▼
  [ Tap 'Enquire / Order' Button ]
              │
              ▼
[ Dynamic WhatsApp URL Builder ] ──> Injects: "Hi, I want to order [SKU: #SL-104]"
              │
              ▼
[ Direct Merchant WhatsApp Chat ] ──> Instant Customer Lead & Conversion!
        </div>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Technical Highlights</h4>
        <ul style="margin-left: 20px; margin-bottom: 16px;">
          <li><b>Conversion Focused:</b> Bypasses tedious cart checkouts; connects shoppers straight to store owners.</li>
          <li><b>Performance:</b> Static JAMstack build deployed on Netlify, achieving sub-second loads on mobile 4G.</li>
          <li><b>Bilingual UI:</b> Seamless bilingual English & Tamil navigation.</li>
        </ul>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Core Stack</h4>
        <p>HTML5, Tailwind CSS, JavaScript, WhatsApp API, Netlify</p>
      `
    },
    scraper: {
      title: "PYTHON WEB SCRAPER & FILE PIPELINE SUITE",
      content: `
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Architecture Blueprint</h4>
        <div class="blueprint-flow">
[ Target Web Endpoints ]
              │
              ▼
 [ Requests with Headers &amp; Rate Delays ]
              │
              ▼
[ BeautifulSoup HTML Parser ] ──> Extracts tables, cards, pricing metadata
              │
              ▼
 [ Data Cleaning &amp; Validation ] ──> Eliminates duplicates and anomalies
              │
              ▼
[ Automated Excel/CSV Export ] ──> Direct Delivery to Client Storage
        </div>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Technical Highlights</h4>
        <ul style="margin-left: 20px; margin-bottom: 16px;">
          <li><b>Headless Reliability:</b> Custom session headers and backoff delays to prevent IP throttling.</li>
          <li><b>Data Hygiene:</b> Automatic normalization of currency symbols, whitespace, and timestamps.</li>
        </ul>
        <h4 style="color: var(--neon-cyan); margin-bottom: 8px;">Core Stack</h4>
        <p>Python 3, BeautifulSoup4, Requests, CSV, Pandas</p>
      `
    }
  };

  document.querySelectorAll('.btn-holo-blueprint').forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.getAttribute('data-project');
      if (pKey && blueprints[pKey]) {
        modalTitle.textContent = blueprints[pKey].title;
        modalBody.innerHTML = blueprints[pKey].content;
        blueprintModal.classList.add('active');
        soundSystem.playWarp();
      }
    });
  });

  function closeModal() {
    if (blueprintModal) blueprintModal.classList.remove('active');
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCloseBottom) modalCloseBottom.addEventListener('click', closeModal);
  if (blueprintModal) {
    blueprintModal.addEventListener('click', e => {
      if (e.target === blueprintModal) closeModal();
    });
  }
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // =========================================================================
  // 8. SKILLS MATRIX FILTER
  // =========================================================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      soundSystem.playClick();

      const filterVal = tab.getAttribute('data-filter');
      skillCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'block';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 9. TRANSMISSION DISPATCHER (Contact Form & Copy Email)
  // =========================================================================
  const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
  const btnSendEmail = document.getElementById('btnSendEmail');
  const senderName = document.getElementById('senderName');
  const senderSubject = document.getElementById('senderSubject');
  const senderMessage = document.getElementById('senderMessage');

  if (btnSendWhatsApp) {
    btnSendWhatsApp.addEventListener('click', () => {
      const name = senderName ? senderName.value.trim() : '';
      const subject = senderSubject ? senderSubject.value.trim() : '';
      const msg = senderMessage ? senderMessage.value.trim() : '';

      const text = `Hi Vegupathirajan,\nMy name is: ${name || 'A Website Visitor'}\nRegarding: ${subject || 'Project / Hiring'}\nMessage: ${msg || 'I am interested in your developer services.'}`;
      const url = `https://wa.me/919360206902?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      soundSystem.playClick();
    });
  }

  if (btnSendEmail) {
    btnSendEmail.addEventListener('click', () => {
      const name = senderName ? senderName.value.trim() : '';
      const subject = senderSubject ? senderSubject.value.trim() : 'Project / Hiring Discussion';
      const msg = senderMessage ? senderMessage.value.trim() : '';

      const body = `Hi Vegupathirajan,\n\nSender: ${name}\n\n${msg}\n\nBest regards,\n${name}`;
      const mailtoUrl = `mailto:vegupathi666@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      soundSystem.playClick();
    });
  }

  // Copy Email Button
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const copyEmailText = document.getElementById('copyEmailText');
  if (btnCopyEmail && copyEmailText) {
    btnCopyEmail.addEventListener('click', () => {
      const email = btnCopyEmail.getAttribute('data-email') || 'vegupathi666@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyEmailText.textContent = "COPIED TO CLIPBOARD!";
        soundSystem.playClick();
        setTimeout(() => {
          copyEmailText.textContent = "COPY EMAIL";
        }, 2200);
      });
    });
  }

  // =========================================================================
  // 10. CUSTOM CYBER CURSOR
  // =========================================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing) {
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', e => {
      dotX = e.clientX;
      dotY = e.clientY;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
    });

    function renderRing() {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderRing);
    }
    renderRing();

    // Hover triggers
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [data-tilt]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // =========================================================================
  // 11. MOBILE NAVIGATION TOGGLE
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  const mobileClose = document.getElementById('mobileClose');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', () => {
      mobilePanel.classList.add('open');
      soundSystem.playClick();
    });
  }
  if (mobileClose && mobilePanel) {
    mobileClose.addEventListener('click', () => {
      mobilePanel.classList.remove('open');
      soundSystem.playClick();
    });
  }
  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobilePanel) mobilePanel.classList.remove('open');
    });
  });

  // =========================================================================
  // 12. STAT NUMBER COUNTER OBSERVER
  // =========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-count'), 10) || 0;
          let count = 0;
          const step = Math.max(1, Math.floor(target / 40));
          const timer = setInterval(() => {
            count += step;
            if (count >= target) {
              count = target;
              clearInterval(timer);
            }
            entry.target.textContent = count;
          }, 25);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(s => observer.observe(s));
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initThreeScene();
    runPreloader();
    typeWriter();
    initTiltCards();
    console.log("%c⚡ VEGUPATHIRAJAN NEURAL MATRIX INITIALIZED [60 FPS] ⚡", "color: #00f0ff; font-weight: bold; font-size: 14px;");
  });

})();
