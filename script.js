const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress span');
const cursor = document.querySelector('.custom-cursor');
const modal = document.querySelector('#project-modal');
const modalContent = {
  vtel: {
    kicker: '01 / Embedded systems',
    title: 'V-TEL Telemetry Board',
    what: 'RC aircraft don\'t give you much room to work with — every gram and every pin matters. I set out to build a single board that could capture camera feed, IMU, GPS, and environmental data simultaneously without adding real weight or complexity to the airframe.',
    how: 'I designed a four-layer ESP32 board in KiCad from scratch, routing power and signal layers to keep noise out of the analog sensor lines. On the firmware side, I moved away from polling and wrote interrupt-driven C/C++ so every sample landed at a consistent interval — polling alone was introducing enough jitter to distort the flight data. Once the logs were on the SD card, I built a Python pipeline to turn raw sensor streams into reconstructed 3D flight paths I could actually inspect after a flight.',
    results: 'The board was strong enough that PCBWay engineers selected it for full sponsorship. More importantly, fixing the sampling aliasing meant the data was finally trustworthy — every flight test after that produced logs I could actually build on.'
  },
  sigma: {
    kicker: '02 / Wearable technology',
    title: 'SIGMA Wearable',
    what: 'Standard radio drops out fast in mountainous terrain, which is exactly where hikers most need to be found. I wanted to build a wearable that could still get an SOS out when normal signal couldn\'t.',
    how: 'I built an end-to-end RF mesh network so a signal could hop between nodes instead of relying on one direct link. Early testing showed packet loss was a bigger problem than range, so I added parity checks to catch and recover corrupted packets, which cut loss by 50%. Once reliability was solved, I pushed on distance — pairing the mesh with a 20 dBm amplifier extended range by 10×. To close the loop, I built a companion website that bridged the mesh to Wi-Fi so a first responder could watch hiker status update live.',
    results: 'The project won 1st Place at IEEE Tech-A-Thon. What I\'m most proud of is the order I solved it in — reliability first, then range — since a fast signal that doesn\'t arrive intact isn\'t worth much in an emergency.'
  },
  doom: {
    kicker: '03 / Low-level computing',
    title: 'DOOM on an ARM MCU',
    what: 'I wanted to see how close I could push a microcontroller never designed for gaming to running an actual game — memory limits, display drivers, and all.',
    how: 'The biggest fight was memory. I profiled every allocation and stripped the codebase down until I was running at 99% memory utilization, which meant almost no margin for error in how I managed buffers. To get sound working without blowing the memory budget, I offloaded audio to an SD card and streamed 2 GB of sound assets on demand rather than holding them in memory. Getting the SPI display to keep pace with the game loop took its own round of tuning and I ended up overclocking the display so that rendering never fell behind input.',
    results: 'It runs at 14 fps. That sounds like a low bar, but on hardware this constrained, getting DOOM playable at all is proof that with the right low-level optimization, "impossible" is often just "under-optimized."'
  },
  buck: {
    kicker: '04 / Power electronics',
    title: 'Buck Converter',
    what: 'Initially designed for a class lab, I wanted to iterate on the DC-DC converter  — starting from requirements and simulation rather than jumping straight to a breadboard.',
    how: 'I simulated both a diode-based and a synchronous dual-MOSFET topology in LTspice, and saw roughly a 10% efficiency advantage. The feedback loop is built around a TLV2372 error amplifier referenced to 1.25 V for stable regulation, then handled the PCB layout myself — adding thermal relief vias under both MOSFETs into a bottom copper pour, and sizing a 4.7 µH inductor and 220 µF ceramic capacitor to keep switching ripple in check.',
    results: 'The design has held up! I got 5 A continuous output at over 90% efficiency.'
  }
};  

let lastTrigger;
const closeModal = () => { modal.classList.remove('open'); document.body.classList.remove('modal-open'); lastTrigger?.focus(); };
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('.write-up-trigger');
  if (!trigger) return;
  event.preventDefault(); const content = modalContent[trigger.dataset.project]; if (!content) return; lastTrigger = trigger;
  document.querySelector('#modal-kicker').textContent = content.kicker;
  document.querySelector('#modal-title').textContent = content.title;
  document.querySelector('#modal-what').textContent = content.what;
  document.querySelector('#modal-how').textContent = content.how;
  document.querySelector('#modal-results').textContent = content.results;
  modal.classList.add('open'); document.body.classList.add('modal-open'); modal.querySelector('.modal-close').focus();
});
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

if (!reducedMotion) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  const updateScroll = () => {
    document.querySelectorAll('.parallax').forEach((image) => {
      const rect = image.getBoundingClientRect();
      const offset = (innerHeight / 2 - (rect.top + rect.height / 2)) * 0.035;
      image.style.transform = `translateY(${offset}px) scale(${1 + Math.max(0, 1 - Math.abs(offset) / 80) * .025})`;
    });
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    progress.style.height = `${maxScroll ? scrollY / maxScroll * 100 : 0}%`;
  };
  addEventListener('scroll', updateScroll, { passive: true }); updateScroll();

  if (matchMedia('(pointer: fine)').matches) {
    let x = -100, y = -100, tx = -100, ty = -100;
    addEventListener('mousemove', (event) => { tx = event.clientX; ty = event.clientY; });
    document.querySelectorAll('a, .project').forEach((element) => {
      element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    const follow = () => { x += (tx - x) * .42; y += (ty - y) * .42; cursor.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; requestAnimationFrame(follow); };
    follow();
  }
} else document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
