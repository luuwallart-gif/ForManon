// ===== MENU BURGER =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });
}

// ===== COMPTEUR ANIMÉ (statistiques) =====
const counters = document.querySelectorAll('[data-count]');
let countStarted = false;

function animateCounters() {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-count');
    let count = 0;
    const increment = target / 60;

    const update = () => {
      count += increment;
      if (count < target) {
        counter.textContent = Math.ceil(count);
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    };
    update();
  });
}

// Déclenche le compteur quand la section est visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
  window.addEventListener('scroll', () => {
    const top = statsSection.getBoundingClientRect().top;
    if (top < window.innerHeight && !countStarted) {
      countStarted = true;
      animateCounters();
    }
  });
}

// ===== ANIMATION AU SCROLL (reveal) =====
const revealElements = document.querySelectorAll('.card, .disease-card, .symptom, .stat-item');
revealElements.forEach(el => el.classList.add('reveal'));

const revealOnScroll = () => {
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 80) {
      el.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== FORMULAIRE DE CONTACT =====
const form = document.getElementById('contact-form');
if (form) {
  const formMessage = document.getElementById('form-message');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom').value;
    formMessage.textContent = `Merci ${nom} 💜 Votre message a bien été envoyé !`;
    form.reset();
  });
}
