document.addEventListener('DOMContentLoaded', () => {

  // HEADER SCROLL EFFECT

  const header = document.getElementById('header');

  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  const backToTop = document.getElementById('back-to-top');

  function updateBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });



  const sections = document.querySelectorAll('section[id]');
  const navPills = document.querySelectorAll('.nav-pill');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navPills.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
        mobileNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Combined scroll handler (throttled)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHeader();
        updateBackToTop();
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  });


  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // HAMBURGER MENU

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });


  // SMOOTH SCROLL

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // HERO STORY LOGIC
  const storyImages = document.querySelectorAll('.story-img');
  const progressBars = document.querySelectorAll('.progress-bar');
  const storyThumbs = document.querySelectorAll('.thumb');
  let currentStoryIndex = 0;
  let storyInterval;
  const storyDuration = 5000; // 5 seconds per story

  function showStory(index) {
    currentStoryIndex = index;

    // Update Images
    storyImages.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });

    // Update Thumbnails
    storyThumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });

    // Update Progress Bars
    progressBars.forEach((bar, i) => {
      bar.classList.remove('active', 'viewed');
      if (i < index) {
        bar.classList.add('viewed');
      } else if (i === index) {
        bar.classList.add('active');
        // Reset animation
        const barInner = bar.querySelector('::after');
        bar.style.animation = 'none';
        void bar.offsetWidth; // trigger reflow
        bar.style.animation = `progress-fill ${storyDuration}ms linear forwards`;
      }
    });
  }

  function nextStory() {
    let nextIndex = (currentStoryIndex + 1) % storyImages.length;
    showStory(nextIndex);
  }

  function startStoryTimer() {
    clearInterval(storyInterval);
    storyInterval = setInterval(nextStory, storyDuration);
  }

  if (storyImages.length > 0) {
    showStory(0);
    startStoryTimer();

    storyThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.getAttribute('data-index'));
        showStory(index);
        startStoryTimer(); // Reset timer on manual click
      });
    });

    // Optional: Pause on hover
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) {
      storyContainer.addEventListener('mouseenter', () => clearInterval(storyInterval));
      storyContainer.addEventListener('mouseleave', startStoryTimer);
    }
  }


  // STACKED CARD SLIDER (HOBBIES)

  const stackedCards = document.querySelectorAll('.stacked-card');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  const stackedSlider = document.getElementById('stacked-slider');
  let currentStackedIndex = 0;
  const totalStacked = stackedCards.length;
  let stackedInterval;

  function updateStackedCards() {
    stackedCards.forEach((card, i) => {
      // Calculate position relative to current index
      let position = i - currentStackedIndex;
      if (position < 0) {
        position += totalStacked;
      }

      card.setAttribute('data-position', position);
    });

    // Update dots
    if (indicatorDots) {
      indicatorDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentStackedIndex);
      });
    }
  }

  function nextStackedCard() {
    if (totalStacked === 0) return;
    const currentCard = document.querySelector('.stacked-card[data-position="0"]');
    if (currentCard) {
      currentCard.classList.add('swipe-left');

      setTimeout(() => {
        currentCard.classList.remove('swipe-left');
        currentStackedIndex = (currentStackedIndex + 1) % totalStacked;
        updateStackedCards();
      }, 450); // Matches CSS transition duration
    }
  }

  function prevStackedCard() {
    if (totalStacked === 0) return;
    // To go previous, we bring the last card in the stack to the front
    currentStackedIndex = (currentStackedIndex - 1 + totalStacked) % totalStacked;
    const previousCard = stackedCards[currentStackedIndex];

    // Position it off-screen to the right first
    previousCard.style.transition = 'none';
    previousCard.style.transform = 'translateX(120%) rotate(15deg)';
    previousCard.style.opacity = '0';
    previousCard.style.zIndex = '5';

    // Force reflow
    void previousCard.offsetWidth;

    // Animate it in
    previousCard.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)';

    updateStackedCards();

    setTimeout(() => {
      previousCard.style = ''; // Clear inline styles
    }, 450);
  }

  // Initialize stacked cards
  if (stackedCards.length > 0) {
    updateStackedCards();

    // Swipe logic
    let sStartX = 0;
    let sEndX = 0;
    let isDragging = false;

    stackedSlider.addEventListener('touchstart', (e) => {
      sStartX = e.changedTouches[0].screenX;
      isDragging = true;
    }, { passive: true });

    stackedSlider.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      sEndX = e.changedTouches[0].screenX;
      isDragging = false;
      handleStackedSwipe();
    }, { passive: true });

    stackedSlider.addEventListener('mousedown', (e) => {
      sStartX = e.clientX;
      isDragging = true;
      e.preventDefault(); // Prevents image/text native drag interference
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      sEndX = e.clientX;
      isDragging = false;
      handleStackedSwipe();
    });

    function handleStackedSwipe() {
      const diff = sStartX - sEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextStackedCard(); // Swipe left -> next
        } else {
          prevStackedCard(); // Swipe right -> previous
        }
      }
    }
  }

  const copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email');
      const txtCopied = window.currentLang === 'en' ? i18n.en.copy_btn_copied : i18n.fr.copy_btn_copied;
      const txtCopy = window.currentLang === 'en' ? i18n.en.copy_btn : i18n.fr.copy_btn;
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.innerHTML = `<i class="fas fa-check"></i> <span>${txtCopied}</span>`;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = `<i class="far fa-copy"></i> <span>${txtCopy}</span>`;
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtn.innerHTML = `<i class="fas fa-check"></i> <span>${txtCopied}</span>`;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = `<i class="far fa-copy"></i> <span>${txtCopy}</span>`;
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  }


  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===========================
  // MULTI-LANGUAGE (i18n) & DARK MODE
  // ===========================
  window.i18n = {
    fr: {
      nav_portfolio: "Portfolio", nav_about: "À propos", nav_projects: "Projets", nav_contact: "Contact", nav_cv: "Voir CV",
      hero_label: "Développeur Web & Mobile à Kinshasa", hero_tagline: "Ancien étudiant en informatique. Maintenant je code pour créer des solutions.",
      hero_availability: "Disponible pour de nouveaux projets", hero_lang_label: "LANGUES PARLÉES", hero_languages: "Français • Lingala • Anglais",
      slide1_title: "Développeur passionné", slide1_desc: "Création d'expériences digitales uniques.",
      slide2_title: "Application Fitness", slide2_desc: "Suivi sportif mobile avec Flutter.",
      slide3_title: "Portfolio", slide3_desc: "Site vitrine professionnel.",
      slide4_title: "App Météo", slide4_desc: "Prévisions en temps réel.",
      hero_story_caption_0: "Matthew Bolia — Développeur",
      hero_story_caption_1: "Application Fitness — Flutter",
      hero_story_caption_2: "Portfolio Personnel — HTML/CSS/JS",
      hero_story_caption_3: "Application Météo — JavaScript",
      swipe_hint: "← Glisser ou appuyer →",
      about_label: "À PROPOS", about_title: "Qui suis-je ?", about_desc: "Développeur passionné par la création d'applications web et mobiles modernes. Formé et constamment en apprentissage, je maîtrise aussi bien la conception frontend que l'intégration backend. Ancien étudiant en informatique, j'applique aujourd'hui avec rigueur mon souci du détail au développement digital.",
      copy_btn: "Copier", copy_btn_copied: "Copié !",
      skills_label: "COMPÉTENCES", skills_technical: "Compétences techniques", skills_soft: "Savoir-être", skills_ai: "Intelligence Artificielle",
      skill_teamwork: "Travail d'équipe", skill_empathy: "Empathie", skill_detail: "Souci du détail", skill_adapt: "Adaptabilité",
      projects_label: "PROJETS", projects_title: "Ce que j'ai construit", projects_subtitle: "Quelques projets sur lesquels j'ai travaillé récemment",
      btn_view_project: "Voir projet",
      project1_desc: "Application mobile de suivi sportif développée avec Flutter et Firebase. Interface intuitive et performante.",
      project2_title: "Portfolio Personnel", project2_desc: "Portfolio professionnel avec animations premium, mode sombre, multilingue et design responsive moderne.",
      project3_desc: "Application météo avec géolocalisation et prévisions en temps réel via API externe.",
      cta_card_title: "Votre Projet ?", cta_card_desc: "Construisons quelque chose d'incroyable ensemble", cta_card_btn: "Me contacter",
      contact_label: "Me contacter", contact_title: "Discutons ?", contact_desc: "Je suis disponible pour de nouveaux projets et collaborations. Si vous cherchez un développeur motivé avec des compétences solides et un engagement envers l'apprentissage continu, je serais ravi de discuter de votre projet.",
      facts_title: "Faits en bref", fact_loc_lbl: "Localisation", fact_loc_val: "Kinshasa, RDC", fact_status_lbl: "Statut", fact_status_val: "Étudiant / Freelance", fact_search_lbl: "Recherche", fact_search_val: "Projets & Collaborations", fact_lang_lbl: "Langues", fact_lang_val: "Français, Lingala, Anglais",
      hobbies_label: "QUAND JE NE CODE PAS", hobbies_title: "$ La vie en dehors du terminal",
      hobby1_title: "Films & Séries", hobby1_desc: "J'adore regarder des séries et films pour me détendre.",
      hobby2_title: "Jeux Vidéo", hobby2_desc: "Le gaming est ma façon de décompresser après le code.",
      hobby3_title: "Musique", hobby3_desc: "J'écoute de la musique en codant et dans la vie.",
      hobby4_title: "Apprentissage", hobby4_desc: "Toujours en train d'apprendre de nouvelles technologies.",
      footer_brand_desc: "Développeur Web & Mobile créant des expériences digitales depuis Kinshasa.",
      footer_sections: "SECTIONS", nav_home: "Accueil", footer_links: "LIENS", footer_cv: "CV", footer_socials: "RÉSEAUX", footer_rights: "Tous droits réservés.",
      education_label: "PARCOURS ACADÉMIQUE",
      edu_upn_title: "Université Pédagogique Nationale (UPN)",
      edu_upn_desc: "Études supérieures en Informatique. Approfondissement des concepts algorithmiques et du développement logiciel.",
      edu_kaya_title: "Institu Technique Kaya",
      edu_kaya_desc: "Formation technique initiale en informatique et nouvelles technologies."
    },
    en: {
      nav_portfolio: "Portfolio", nav_about: "About", nav_projects: "Projects", nav_contact: "Contact", nav_cv: "View Resume",
      hero_label: "Web & Mobile Developer in Kinshasa", hero_tagline: "Former CS student. Now I code to build solutions.",
      hero_availability: "Available for new projects", hero_lang_label: "SPOKEN LANGUAGES", hero_languages: "French • Lingala • English",
      slide1_title: "Passionate Developer", slide1_desc: "Creating unique digital experiences.",
      slide2_title: "Fitness App", slide2_desc: "Mobile fitness tracking with Flutter.",
      slide3_title: "Portfolio", slide3_desc: "Professional showcase website.",
      slide4_title: "Weather App", slide4_desc: "Real-time weather forecasts.",
      hero_story_caption_0: "Matthew Bolia — Developer",
      hero_story_caption_1: "Fitness App — Flutter",
      hero_story_caption_2: "Personal Portfolio — HTML/CSS/JS",
      hero_story_caption_3: "Weather App — JavaScript",
      swipe_hint: "← Swipe or tap →",
      about_label: "ABOUT", about_title: "Who am I?", about_desc: "Passionate developer crafting modern web and mobile applications. Self-taught and constantly learning, I master both frontend design and backend integration. As a former computer science student, I now apply my strong attention to detail to digital development.",
      copy_btn: "Copy", copy_btn_copied: "Copied!",
      skills_label: "SKILLS", skills_technical: "Technical Skills", skills_soft: "Soft Skills", skills_ai: "Artificial Intelligence",
      skill_teamwork: "Teamwork", skill_empathy: "Empathy", skill_detail: "Attention to detail", skill_adapt: "Adaptability",
      projects_label: "PROJECTS", projects_title: "What I've built", projects_subtitle: "A few projects I've worked on recently",
      btn_view_project: "View project",
      project1_desc: "Mobile fitness tracking application built with Flutter and Firebase. Intuitive and performant interface.",
      project2_title: "Personal Portfolio", project2_desc: "Professional portfolio with premium animations, dark mode, multilingual support and modern responsive design.",
      project3_desc: "Weather application with user geolocation and real-time forecasts via external API.",
      cta_card_title: "Your Project?", cta_card_desc: "Let's build something amazing together", cta_card_btn: "Contact me",
      contact_label: "Get in touch", contact_title: "Let's talk?", contact_desc: "I am available for new projects and collaborations. If you're looking for a highly motivated developer with solid skills and a commitment to continuous learning, I'd love to discuss your project.",
      facts_title: "Quick facts", fact_loc_lbl: "Location", fact_loc_val: "Kinshasa, DRC", fact_status_lbl: "Status", fact_status_val: "Student / Freelancer", fact_search_lbl: "Seeking", fact_search_val: "Projects & Collaborations", fact_lang_lbl: "Languages", fact_lang_val: "French, Lingala, English",
      hobbies_label: "WHEN I'M NOT CODING", hobbies_title: "$ Life outside the terminal",
      hobby1_title: "Movies & Shows", hobby1_desc: "I love watching series to relax.",
      hobby2_title: "Gaming", hobby2_desc: "Gaming is my way to unwind after coding.",
      hobby3_title: "Music", hobby3_desc: "I listen to music while coding and in daily life.",
      hobby4_title: "Learning", hobby4_desc: "Always exploring new tech and tools.",
      footer_brand_desc: "Web & Mobile Developer crafting digital experiences from Kinshasa.",
      footer_sections: "SECTIONS", nav_home: "Home", footer_links: "LINKS", footer_cv: "Resume", footer_socials: "SOCIALS", footer_rights: "All rights reserved.",
      education_label: "ACADEMIC JOURNEY",
      edu_upn_title: "National Pedagogical University (UPN)",
      edu_upn_desc: "Higher studies in Computer Science. In-depth study of algorithmic concepts and software development.",
      edu_kaya_title: "Kaya Technical Institu",
      edu_kaya_desc: "Initial technical training in computer science and new technologies."
    }
  };

  const langToggle = document.getElementById('lang-toggle');
  window.currentLang = localStorage.getItem('theme_lang') || 'fr'; // 'fr' or 'en'

  function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.i18n[window.currentLang][key]) {
        el.textContent = window.i18n[window.currentLang][key];
      }
    });
    if(langToggle) {
      const flagCode = window.currentLang === 'en' ? 'gb' : 'fr';
      langToggle.innerHTML = `<img src="https://flagcdn.com/w40/${flagCode}.png" alt="${window.currentLang.toUpperCase()}" class="lang-flag" />`;
    }
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      window.currentLang = window.currentLang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('theme_lang', window.currentLang);
      updateLanguage();
    });
    updateLanguage(); // init
  }

  const themeToggle = document.getElementById('theme-toggle');
  let currentTheme = localStorage.getItem('theme_mode') || 'light';

  function updateTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if(themeToggle) {
      themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', currentTheme);
      updateTheme();
    });
    updateTheme(); // init
  }

  updateHeader();
  updateBackToTop();
  updateActiveNavLink();

  // RANDOM SKILLS DISPLAY
  function initRandomSkills() {
    const skills = [
      { id: 'flutter', url: 'https://skillicons.dev/icons?i=flutter' },
      { id: 'dart', url: 'https://skillicons.dev/icons?i=dart' },
      { id: 'js', url: 'https://skillicons.dev/icons?i=js' },
      { id: 'html', url: 'https://skillicons.dev/icons?i=html' },
      { id: 'css', url: 'https://skillicons.dev/icons?i=css' },
      { id: 'php', url: 'https://skillicons.dev/icons?i=php' },
      { id: 'firebase', url: 'https://skillicons.dev/icons?i=firebase' },
      { id: 'nodejs', url: 'https://skillicons.dev/icons?i=nodejs' },
      { id: 'cloudinary', url: 'https://skillicons.dev/icons?i=cloudinary' },
      { id: 'gcp', url: 'https://skillicons.dev/icons?i=gcp' },
      { id: 'aws', url: 'https://skillicons.dev/icons?i=aws' },
      { id: 'mongodb', url: 'https://skillicons.dev/icons?i=mongodb' },
      { id: 'github', url: 'https://skillicons.dev/icons?i=github' },
      { id: 'git', url: 'https://skillicons.dev/icons?i=git' },
      { id: 'figma', url: 'https://skillicons.dev/icons?i=figma' },
      { id: 'antigravity', url: '', iconClass: 'fas fa-rocket' }
    ];
    
    const displayEl = document.getElementById('random-skill');
    if (!displayEl) return;

    function updateSkill() {
      displayEl.style.opacity = '0';
      displayEl.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        const item = skills[Math.floor(Math.random() * skills.length)];
        if (item.url) {
          displayEl.innerHTML = `<img src="${item.url}" alt="${item.id}" style="width:32px; height:32px; vertical-align:middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">`;
        } else {
          displayEl.innerHTML = `<i class="${item.iconClass}" style="font-size:1.8rem; color:#1A237E; vertical-align:middle;"></i>`;
        }
        displayEl.style.opacity = '1';
        displayEl.style.transform = 'translateY(0)';
      }, 400);
    }

    setInterval(updateSkill, 2500);
    updateSkill(); // initial call
  }
  initRandomSkills();

  // ============================================
  // CUSTOM INTERACTIVE CURSOR (Premium feel)
  // ============================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');

  // Disable on touch devices to avoid issues
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice && cursorDot && cursorOutline) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Immediate dot
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
      cursorDot.style.opacity = '1';
      cursorOutline.style.opacity = '1';
    });

    function animateCursor() {
      // Lerp for smooth lag
      const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
      outlineX = lerp(outlineX, mouseX, 0.15);
      outlineY = lerp(outlineY, mouseY, 0.15);

      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects on buttons, links and images
    const interactables = document.querySelectorAll('a, button, .thumb, .project-card, .social-pill, .btn-cv');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        // Avoid white/light overlay on the CV button specifically
        if (el.classList.contains('btn-cv')) {
          cursorOutline.style.backgroundColor = 'transparent';
          cursorOutline.style.borderColor = 'rgba(26, 35, 126, 0.4)';
        } else {
          cursorOutline.style.backgroundColor = 'rgba(26, 35, 126, 0.1)';
          cursorOutline.style.borderColor = 'rgba(26, 35, 126, 0.3)';
        }
        cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.backgroundColor = 'transparent';
        cursorOutline.style.borderColor = '#1A237E';
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });


    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorOutline.style.opacity = '0';
    });
  }

  // ============================================
  // SCROLL PROGRESS BAR LOGIC (Premium)
  // ============================================
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }
  });

});
