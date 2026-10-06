/* ==========================================================================
   HOPE FITNESS — ULTRA SMOOTH INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
   * 1. AMBIENT PARTICLE CANVAS
   * ------------------------------------------------------------------------ */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    draw() {
      ctx.fillStyle = `rgba(255, 31, 61, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactive push
      if (mouse.x !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * 3;
          this.y -= (dy / distance) * force * 3;
        }
      }
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 15000), 75);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.strokeStyle = `rgba(255, 31, 61, ${0.15 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });


  /* ------------------------------------------------------------------------
   * 2. CUSTOM MAGNETIC CURSOR & SCROLL PROGRESS
   * ------------------------------------------------------------------------ */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const progressBar = document.getElementById('progress-bar');
  const mainNav = document.getElementById('main-nav');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    if (cursorRing) {
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    }
    requestAnimationFrame(renderRing);
  }
  renderRing();

  // Hover scale for clickable elements
  const interactables = document.querySelectorAll('a, button, .gallery-card, .program-card, .stats-glass-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Scroll Handler
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

    if (progressBar) progressBar.style.width = `${progress}%`;
    if (mainNav) mainNav.classList.toggle('scrolled', scrollY > 40);
  });


  /* ------------------------------------------------------------------------
   * 3. SYNTHESIZED WEB AUDIO FEEDBACK (OPTIONAL TOGGLE)
   * ------------------------------------------------------------------------ */
  let soundEnabled = false;
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIconOff = soundToggleBtn ? soundToggleBtn.querySelector('.sound-off') : null;
  const soundIconOn = soundToggleBtn ? soundToggleBtn.querySelector('.sound-on') : null;

  let audioCtx = null;

  function playSynthTone(freq = 440, type = 'sine', duration = 0.08) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundIconOff && soundIconOn) {
        soundIconOff.classList.toggle('hidden', soundEnabled);
        soundIconOn.classList.toggle('hidden', !soundEnabled);
      }
      if (soundEnabled) playSynthTone(880, 'sine', 0.12);
    });
  }

  // Play audio on button clicks
  document.querySelectorAll('.btn, .tab-btn, .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => playSynthTone(520, 'triangle', 0.06));
  });


  /* ------------------------------------------------------------------------
   * 4. 3D HERO CARD PARALLAX TILT
   * ------------------------------------------------------------------------ */
  const heroScene = document.getElementById('hero-scene');
  const tiltElements = document.querySelectorAll('.tilt-element');

  if (heroScene && window.innerWidth > 900) {
    heroScene.addEventListener('mousemove', (e) => {
      const rect = heroScene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      tiltElements.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth')) || 1;
        const rotateX = -y * 20 * depth;
        const rotateY = x * 20 * depth;
        el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${depth * 20}px)`;
      });
    });

    heroScene.addEventListener('mouseleave', () => {
      tiltElements.forEach((el) => {
        el.style.transform = '';
      });
    });
  }


  /* ------------------------------------------------------------------------
   * 5. ANIMATED STAT COUNTERS
   * ------------------------------------------------------------------------ */
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease Out Cubic
        const currentVal = target * easeProgress;

        counter.innerText = currentVal.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target.toFixed(decimals);
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        animateCounters();
        countersAnimated = true;
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.querySelector('.statement-section');
  if (statsSection) observer.observe(statsSection);


  /* ------------------------------------------------------------------------
   * 6. TRAINING PROGRAM ACCORDION
   * ------------------------------------------------------------------------ */
  const programCards = document.querySelectorAll('.program-card');

  programCards.forEach(card => {
    card.addEventListener('click', () => {
      programCards.forEach(c => {
        if (c !== card) c.classList.remove('active');
      });
      card.classList.toggle('active');
    });
  });


  /* ------------------------------------------------------------------------
   * 7. GALLERY FILTER & LIGHTBOX MODAL
   * ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
          card.style.opacity = '1';
        } else {
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // Lightbox Modal
  const imageModal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');
  const zoomBtns = document.querySelectorAll('.gallery-zoom-btn');

  zoomBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = btn.getAttribute('data-src');
      const caption = btn.getAttribute('data-caption');

      if (imageModal && modalImg && modalCaption) {
        modalImg.src = src;
        modalCaption.innerText = caption;
        imageModal.classList.add('active');
      }
    });
  });

  if (modalClose && imageModal) {
    modalClose.addEventListener('click', () => imageModal.classList.remove('active'));
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) imageModal.classList.remove('active');
    });
  }


  /* ------------------------------------------------------------------------
   * 8. INTERACTIVE BMI & CALORIE CALCULATOR
   * ------------------------------------------------------------------------ */
  const heightInput = document.getElementById('calc-height');
  const weightInput = document.getElementById('calc-weight');
  const ageInput = document.getElementById('calc-age');
  const genderInput = document.getElementById('calc-gender');
  const goalInput = document.getElementById('calc-goal');
  const calculateBtn = document.getElementById('btn-calculate');

  const heightVal = document.getElementById('height-val');
  const weightVal = document.getElementById('weight-val');
  const resBmi = document.getElementById('res-bmi');
  const resCategory = document.getElementById('res-category');
  const resCalories = document.getElementById('res-calories');
  const resTip = document.getElementById('res-tip');
  const resProgram = document.getElementById('res-program');

  if (heightInput && heightVal) {
    heightInput.addEventListener('input', () => heightVal.innerText = heightInput.value);
  }
  if (weightInput && weightVal) {
    weightInput.addEventListener('input', () => weightVal.innerText = weightInput.value);
  }

  function calculateFitnessMetrics() {
    const height = parseFloat(heightInput.value) / 100; // in meters
    const weight = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value) || 25;
    const gender = genderInput.value;
    const goal = goalInput.value;

    if (!height || !weight) return;

    // BMI Formula = weight / (height * height)
    const bmi = (weight / (height * height)).toFixed(1);
    resBmi.innerText = bmi;

    // Category
    let category = '';
    let categoryColor = '#10b981';

    if (bmi < 18.5) {
      category = 'UNDERWEIGHT';
      categoryColor = '#3b82f6';
    } else if (bmi < 25) {
      category = 'NORMAL WEIGHT';
      categoryColor = '#10b981';
    } else if (bmi < 30) {
      category = 'OVERWEIGHT';
      categoryColor = '#f59e0b';
    } else {
      category = 'OBESE';
      categoryColor = '#ff1f3d';
    }

    resCategory.innerText = category;
    resCategory.style.color = categoryColor;
    resCategory.style.borderColor = categoryColor;

    // BMR Formula (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height * 100) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;
    let tdee = bmr * 1.45; // Moderate exercise factor

    if (goal === 'muscle') {
      tdee += 350;
      resTip.innerText = 'High protein intake (2.0g/kg) with heavy progressive strength training.';
      resProgram.innerText = 'HYPERTROPHY & HEAVY IRON';
    } else if (goal === 'fatloss') {
      tdee -= 400;
      resTip.innerText = 'Moderate deficit with daily high-intensity cardio & strength retention.';
      resProgram.innerText = 'HIIT & FAT LOSS SHREDDING';
    } else {
      resTip.innerText = 'Balanced maintenance calories to build functional endurance.';
      resProgram.innerText = 'STRENGTH & CONDITIONING';
    }

    resCalories.innerHTML = `${Math.round(tdee).toLocaleString()} <span>kcal/day</span>`;
  }

  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateFitnessMetrics);
    calculateFitnessMetrics(); // Initial calc
  }


  /* ------------------------------------------------------------------------
   * 9. WEEKLY SCHEDULE TIMETABLE
   * ------------------------------------------------------------------------ */
  const scheduleData = {
    mon: [
      { time: '06:00 AM - 07:30 AM', title: 'Heavy Chest & Triceps Blitz', coach: 'Coach Vikram' },
      { time: '08:00 AM - 09:15 AM', title: 'Morning Conditioning & HIIT', coach: 'Coach Priya' },
      { time: '05:00 PM - 06:30 PM', title: 'Hypertrophy Bench & Upper Body', coach: 'Coach Rahul' },
      { time: '07:00 PM - 08:30 PM', title: 'Evening Heavy Powerlifting', coach: 'Head Coach Aman' }
    ],
    tue: [
      { time: '06:00 AM - 07:30 AM', title: 'Deadlifts & Back Isolation', coach: 'Coach Aman' },
      { time: '08:00 AM - 09:15 AM', title: 'Core & Abdominal Burnout', coach: 'Coach Priya' },
      { time: '05:00 PM - 06:30 PM', title: 'Lat Pulldown & Row Mechanics', coach: 'Coach Vikram' },
      { time: '07:00 PM - 08:30 PM', title: 'Biceps & Forearms Pump', coach: 'Coach Rahul' }
    ],
    wed: [
      { time: '06:00 AM - 07:30 AM', title: 'Leg Day & Squat Racks', coach: 'Head Coach Aman' },
      { time: '08:00 AM - 09:15 AM', title: 'Hamstrings & Glutes Focus', coach: 'Coach Priya' },
      { time: '05:00 PM - 06:30 PM', title: 'Quad Hypertrophy & Press', coach: 'Coach Vikram' },
      { time: '07:00 PM - 08:30 PM', title: 'Calves & Leg Conditioning', coach: 'Coach Rahul' }
    ],
    thu: [
      { time: '06:00 AM - 07:30 AM', title: 'Shoulders & Military Press', coach: 'Coach Rahul' },
      { time: '08:00 AM - 09:15 AM', title: 'Cardio Treadmill Intervals', coach: 'Coach Priya' },
      { time: '05:00 PM - 06:30 PM', title: 'Delt Isolation & Traps', coach: 'Coach Vikram' },
      { time: '07:00 PM - 08:30 PM', title: 'Mobility & Joint Flexibility', coach: 'Head Coach Aman' }
    ],
    fri: [
      { time: '06:00 AM - 07:30 AM', title: 'Arms Superset Mayhem', coach: 'Coach Vikram' },
      { time: '08:00 AM - 09:15 AM', title: 'Fat Loss HIIT & Rowers', coach: 'Coach Priya' },
      { time: '05:00 PM - 06:30 PM', title: 'Chest & Back Compound Sets', coach: 'Coach Rahul' },
      { time: '07:00 PM - 08:30 PM', title: 'Night Beast Workout', coach: 'Head Coach Aman' }
    ],
    sat: [
      { time: '07:00 AM - 08:30 AM', title: 'Full Body Functional Circuit', coach: 'All Coaches' },
      { time: '09:00 AM - 10:30 AM', title: 'Max Rep Power Challenge', coach: 'Head Coach Aman' },
      { time: '05:00 PM - 07:00 PM', title: 'Weekend Heavy Open Floor', coach: 'Coach Vikram' }
    ]
  };

  const scheduleTabs = document.querySelectorAll('#schedule-tabs .tab-btn');
  const scheduleContent = document.getElementById('schedule-content');

  function renderSchedule(day) {
    if (!scheduleContent) return;
    const items = scheduleData[day] || [];
    scheduleContent.innerHTML = `
      <div class="schedule-grid">
        ${items.map(item => `
          <div class="slot-card">
            <span class="slot-time">${item.time}</span>
            <h4 class="slot-title">${item.title}</h4>
            <span class="slot-coach">👤 ${item.coach}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  scheduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      scheduleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSchedule(tab.getAttribute('data-day'));
    });
  });

  renderSchedule('mon');


  /* ------------------------------------------------------------------------
   * 10. MEMBERSHIP BILLING TOGGLE
   * ------------------------------------------------------------------------ */
  const billingToggle = document.getElementById('billing-toggle');
  const lblMonthly = document.getElementById('lbl-monthly');
  const lblQuarterly = document.getElementById('lbl-quarterly');
  const amountEls = document.querySelectorAll('.amount');
  const pricePeriod1 = document.getElementById('price-period-1');
  const pricePeriod2 = document.getElementById('price-period-2');

  let isQuarterly = false;

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isQuarterly = !isQuarterly;
      billingToggle.classList.toggle('active', isQuarterly);
      if (lblMonthly) lblMonthly.classList.toggle('active', !isQuarterly);
      if (lblQuarterly) lblQuarterly.classList.toggle('active', isQuarterly);

      amountEls.forEach(el => {
        const val = isQuarterly ? el.getAttribute('data-quarterly') : el.getAttribute('data-monthly');
        el.innerText = val;
      });

      if (pricePeriod1) pricePeriod1.innerText = isQuarterly ? '/ quarter*' : '/ month*';
      if (pricePeriod2) pricePeriod2.innerText = isQuarterly ? '/ quarter' : '/ month';
    });
  }


  /* ------------------------------------------------------------------------
   * 11. SECURE SERVER-SIDE LEAD CAPTURE
   * ------------------------------------------------------------------------ */
  const joinModal = document.getElementById('join-modal');
  const joinModalClose = document.getElementById('join-modal-close');
  const joinForm = document.getElementById('join-form');
  const formSuccess = document.getElementById('form-success');
  const formPlanSelect = document.getElementById('form-plan');

  function openJoinModal(planName = '') {
    if (!joinModal) return;
    if (planName && formPlanSelect) {
      const option = [...formPlanSelect.options].find(o => o.text.includes(planName) || o.value.includes(planName));
      if (option) formPlanSelect.value = option.value;
    }
    joinModal.classList.add('active');
  }

  document.querySelectorAll('#open-join-modal-nav, #open-join-modal-hero, .open-join-modal-plan, #btn-claim-plan').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openJoinModal(btn.getAttribute('data-plan') || '');
    });
  });

  if (joinModalClose && joinModal) joinModalClose.addEventListener('click', () => joinModal.classList.remove('active'));
  if (joinModal) joinModal.addEventListener('click', (e) => { if (e.target === joinModal) joinModal.classList.remove('active'); });

  async function submitLead(payload) {
    const response = await fetch('https://hope-fitness-secure-admin.onrender.com/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Unable to submit your enquiry.');
    return data;
  }

  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = joinForm.querySelector('button[type="submit"]');
      const name = document.getElementById('form-name').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const plan = formPlanSelect ? formPlanSelect.value : '';

      submitButton.disabled = true;
      submitButton.querySelector('span').textContent = 'SUBMITTING...';

      try {
        await submitLead({ name, phone, interestedPlan: plan });
        joinForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.remove('hidden');
          const p = formSuccess.querySelector('p');
          if (p) p.textContent = 'Thank you! Your enquiry has been received. Hope Fitness will contact you shortly.';
        }
        const waMsg = `Hi Hope Fitness Kharar! New Website Inquiry:%0A👤 Name: ${encodeURIComponent(name)}%0A📞 Phone: ${encodeURIComponent(phone)}%0A🏋️ Plan: ${encodeURIComponent(plan)}`;
        setTimeout(() => {
          window.open(`https://wa.me/919988350560?text=${waMsg}`, '_blank', 'noopener,noreferrer');
          joinModal?.classList.remove('active');
          setTimeout(() => {
            joinForm.style.display = 'flex';
            formSuccess?.classList.add('hidden');
            joinForm.reset();
            submitButton.disabled = false;
            submitButton.querySelector('span').textContent = 'CONFIRM MY BOOKING';
          }, 400);
        }, 1200);
      } catch (error) {
        alert(error.message);
        submitButton.disabled = false;
        submitButton.querySelector('span').textContent = 'CONFIRM MY BOOKING';
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 12. BACK TO TOP & SMOOTH ANCHORS
   * ------------------------------------------------------------------------ */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
