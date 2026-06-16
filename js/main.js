/**
 * Alex Rivers Portfolio - Main JS Logic
 * Orchestrates preloader, Three.js particles, GSAP transitions, Cursor follower, Light/Dark theme, and Dynamic Rendering.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial Seeding Check
    if (window.PortfolioStorage) {
        renderAllContent();
    } else {
        console.error("Storage module data.js not loaded properly.");
    }

    // 2. Preloader Animation
    initPreloader();

    // 3. Custom Cursor Follower
    initCustomCursor();

    // 4. Day & Night Theme Switcher
    initThemeSwitcher();



    // 6. GSAP ScrollTrigger Animations
    initScrollAnimations();

    // 7. Event Interceptors & Lightbox
    initInteractions();
});

/* ==========================================
   PRELOADER INITIALIZATION
   ========================================== */
function initPreloader() {
    const preloader = document.getElementById("preloader");
    const bar = document.getElementById("preloader-bar");
    const percent = document.getElementById("preloader-percent");
    
    if (!preloader) return;

    // Failsafe for offline / blocked CDNs
    if (typeof gsap === 'undefined') {
        preloader.style.display = "none";
        return;
    }

    let count = 0;
    const interval = setInterval(() => {
        count += Math.floor(Math.random() * 10) + 5;
        if (count >= 100) {
            count = 100;
            clearInterval(interval);
            
            // GSAP Preloader Out
            gsap.timeline()
                .to(bar, { width: "100%", duration: 0.3 })
                .to(percent, { opacity: 0, duration: 0.2 })
                .to("#preloader-logo", { y: -50, opacity: 0, duration: 0.4, ease: "power2.in" })
                .to(preloader, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    duration: 0.8,
                    ease: "power4.inOut"
                })
                .set(preloader, { display: "none" })
                .from("#hero .hero-subtitle", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.2")
                .from("#hero .hero-title", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
                .from("#hero .hero-description", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
                .from("#hero .hero-buttons", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.4")
                .from("#hero .hero-visual", { scale: 0.8, opacity: 0, duration: 1, ease: "elastic.out(1, 0.75)" }, "-=0.6")
                .from("#header", { y: -100, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.8");
        } else {
            if (bar) bar.style.width = count + "%";
            if (percent) percent.textContent = count + "%";
        }
    }, 60);
}

/* ==========================================
   CUSTOM CURSOR SYSTEM
   ========================================== */
function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const follower = document.getElementById("custom-cursor-follower");
    
    if (!cursor || !follower) return;

    // Hover effects on active items
    const setupCursorHovers = () => {
        const hoverables = document.querySelectorAll("a, button, .btn-neon, .glass-card, .video-thumb-container, .theme-toggle, .mobile-menu-btn");
        hoverables.forEach(el => {
            el.addEventListener("mouseenter", () => {
                cursor.classList.add("hover");
                follower.classList.add("hover");
            });
            el.addEventListener("mouseleave", () => {
                cursor.classList.remove("hover");
                follower.classList.remove("hover");
            });
        });
    };

    // Initialize hover states (and repeat when dynamic DOM updates occur)
    setupCursorHovers();
    window.updateCursorHovers = setupCursorHovers;

    // Failsafe for offline / missing GSAP
    if (typeof gsap === 'undefined') {
        document.addEventListener("mousemove", (e) => {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
            follower.style.left = e.clientX + "px";
            follower.style.top = e.clientY + "px";
        });
        return;
    }

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    // Track mouse coordinates
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dynamic placement for primary cursor dot
        cursor.style.left = mouseX + "px";
        cursor.style.top = mouseY + "px";
    });

    // Lagged movement for outer follower circle using GSAP ticker
    gsap.ticker.add(() => {
        posX += (mouseX - posX) * 0.15;
        posY += (mouseY - posY) * 0.15;
        
        follower.style.left = posX + "px";
        follower.style.top = posY + "px";
    });
}

/* ==========================================
   THEME MANAGER (LIGHT / DARK SWITCH)
   ========================================== */
let currentThreeTheme = "dark"; // Export state reference for canvas

function initThemeSwitcher() {
    const toggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Check cached preference
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
        body.classList.add("light-theme");
        currentThreeTheme = "light";
        updateToggleIcons(true);
    }

    toggle.addEventListener("click", () => {
        body.classList.toggle("light-theme");
        
        const isLight = body.classList.contains("light-theme");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        currentThreeTheme = isLight ? "light" : "dark";

        updateToggleIcons(isLight);

        // Global event to update Three.js colors dynamically
        window.dispatchEvent(new CustomEvent("themeChanged", { detail: currentThreeTheme }));
    });

    function updateToggleIcons(isLight) {
        const darkIcon = toggle.querySelector('.theme-toggle-icon[data-theme="dark"]');
        const lightIcon = toggle.querySelector('.theme-toggle-icon[data-theme="light"]');
        if (darkIcon && lightIcon) {
            if (isLight) {
                darkIcon.classList.remove("active");
                lightIcon.classList.add("active");
            } else {
                lightIcon.classList.remove("active");
                darkIcon.classList.add("active");
            }
        }
    }
}


/* ==========================================
   GSAP SCROLLTRIGGER ENGINE
   ========================================== */
function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP or ScrollTrigger not loaded. Skipping scroll animations.");
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Fade-in sections with dynamic headers
    const sectionHeaders = document.querySelectorAll(".framer-section-header");
    sectionHeaders.forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Device Mock Frames reveal
    const projectCards = document.querySelectorAll(".tablet-mock-frame");
    projectCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%"
            },
            opacity: 0,
            scale: 0.96,
            y: 40,
            duration: 0.7,
            delay: (index % 2) * 0.2,
            ease: "power2.out"
        });
    });

    // Video Cards reveal
    const videoCards = document.querySelectorAll(".video-card-frame");
    videoCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%"
            },
            opacity: 0,
            scale: 0.96,
            y: 35,
            duration: 0.6,
            delay: (index % 3) * 0.15,
            ease: "power2.out"
        });
    });

    // Timeline Items reveal
    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item, index) => {
        const tcard = item.querySelector(".timeline-card");
        if (tcard) {
            gsap.from(tcard, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%"
                },
                opacity: 0,
                x: 40,
                duration: 0.7,
                ease: "power2.out"
            });
        }
    });

    // Toolkit rows animate bar fills on scroll trigger
    gsap.utils.toArray(".toolkit-row").forEach(row => {
        const bar = row.querySelector(".tool-bar-fill");
        const val = row.dataset.value;
        
        gsap.to(bar, {
            scrollTrigger: {
                trigger: row,
                start: "top 90%"
            },
            width: val + "%",
            duration: 1.5,
            ease: "power2.out"
        });
    });
}

/* ==========================================
   DYNAMIC CONTENT RENDERING
   ========================================== */
function renderAllContent() {
    const storage = window.PortfolioStorage;

    // 1. Populate Profile details
    const profile = storage.getProfile();
    if (profile) {
        const avatarEl = document.getElementById("hero-avatar");
        if (avatarEl && profile.avatar) {
            avatarEl.src = profile.avatar;
        }
        document.getElementById("hero-name-header").textContent = profile.name;
        document.getElementById("hero-title-header").textContent = profile.title;
        document.getElementById("hero-headline").textContent = profile.intro;
        document.getElementById("hero-subtitle").textContent = profile.about;
        
        // Dynamically bind Profile Statistics
        const satisfiedLabel = document.getElementById("hero-satisfied-label");
        if (satisfiedLabel) {
            satisfiedLabel.textContent = `${profile.happyClients || 50}+ Satisfied Customers`;
        }
        
        const statExp = document.getElementById("hero-stat-exp");
        const statProj = document.getElementById("hero-stat-proj");
        const statClients = document.getElementById("hero-stat-clients");
        if (statExp) statExp.textContent = `${profile.yearsOfExperience || 5}+`;
        if (statProj) statProj.textContent = `${profile.completedProjects || 120}+`;
        if (statClients) statClients.textContent = `${profile.happyClients || 80}+`;
    }

    // 2. Populate Social Links (Horizontal social cards)
    const socials = storage.getSocialLinks();
    const socialsContainer = document.getElementById("social-links-wrapper");
    if (socials && socialsContainer) {
        socialsContainer.innerHTML = socials.map(soc => `
            <a href="${soc.url}" target="_blank" rel="noopener" class="social-card-btn" title="${soc.platform}">
                <i class="${soc.icon}"></i>
            </a>
        `).join('');
    }

    // 3. Populate Website Projects (Tablet mock frames)
    const webProjects = storage.getWebProjects();
    const webGrid = document.getElementById("website-projects-grid");
    if (webProjects && webGrid) {
        webGrid.innerHTML = webProjects.map(proj => `
            <div class="tablet-mock-frame">
                <div class="tablet-header-bar">
                    <div class="tablet-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <div class="tablet-url-bar">${proj.link ? proj.link.replace("https://", "").replace("http://", "") : "example.com"}</div>
                </div>
                <div class="tablet-screen" onclick="openVideoModal('${proj.link}')">
                    <img src="${proj.image}" alt="${proj.title}" loading="lazy">
                    <div class="tablet-screen-overlay">
                        <div class="overlay-details-framer">
                            <div>
                                <h3>${proj.title}</h3>
                                <p>${proj.description.substring(0, 80)}...</p>
                            </div>
                            <div class="tablet-launch-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
                        </div>
                    </div>
                </div>
                <div class="tablet-footer-card">
                    <div>
                        <h3>${proj.title}</h3>
                        <p>${proj.tech ? proj.tech.join(" • ") : ""}</p>
                    </div>
                    <a href="${proj.link}" target="_blank" rel="noopener" class="tablet-launch-btn" title="Live Site">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    // 3.5 Populate Video Projects (Cinematic cards with play overlay)
    const videoProjects = storage.getVideoProjects();
    const videoGrid = document.getElementById("video-projects-grid");
    if (videoProjects && videoGrid) {
        videoGrid.innerHTML = videoProjects.map(proj => `
            <div class="video-card-frame">
                <div class="video-thumbnail-container" onclick="openVideoModal('${proj.link}')">
                    <img src="${proj.thumbnail}" alt="${proj.title}" loading="lazy">
                    <div class="video-play-overlay">
                        <div class="play-btn-circle">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="video-footer-details">
                    <h3>${proj.title}</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <span class="framer-badge" style="font-size:0.7rem; padding:3px 10px; margin:0;">${proj.category}</span>
                        <a href="${proj.link}" target="_blank" rel="noopener" style="font-size:0.85rem; color:var(--accent-blue); font-weight:600;"><i class="fa-brands fa-youtube"></i> Watch</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 3.6 Populate Experience Timeline
    const experiences = storage.getExperience();
    const expContainer = document.getElementById("experience-timeline-container");
    if (experiences && expContainer) {
        expContainer.innerHTML = experiences.map(exp => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-card glass-card">
                    <div class="timeline-header">
                        <div class="timeline-company-role">
                            <h3>${exp.role}</h3>
                            <h4>${exp.company}</h4>
                        </div>
                        <span class="timeline-period">${exp.period}</span>
                    </div>
                    <p class="timeline-desc">${exp.description}</p>
                    <div class="timeline-services">
                        ${exp.services ? exp.services.map(srv => `
                            <span class="timeline-service-tag">${srv}</span>
                        `).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 4. Populate Skills (Toolkit progress bar layout)
    const skills = storage.getSkills();
    const toolkitContainer = document.getElementById("toolkit-list-wrapper");
    if (skills && toolkitContainer) {
        toolkitContainer.innerHTML = skills.map(sk => `
            <div class="toolkit-row" data-value="${sk.value}">
                <div class="tool-icon-box">
                    <i class="${getToolIcon(sk.name)}"></i>
                </div>
                <div class="tool-details">
                    <div class="tool-name-header">
                        <span class="tool-name">${sk.name}</span>
                        <span class="tool-percent">${sk.value}%</span>
                    </div>
                    <div class="tool-bar-track">
                        <div class="tool-bar-fill" style="width: 0%;"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update current copyright year
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // Re-bind hover events for dynamically created elements
    if (window.updateCursorHovers) {
        window.updateCursorHovers();
    }
}

// Maps standard tools to their respective FontAwesome icons
function getToolIcon(name) {
    const n = name.toLowerCase();
    if (n.includes("figma")) return "fa-brands fa-figma";
    if (n.includes("photoshop") || n.includes("adobe")) return "fa-solid fa-image";
    if (n.includes("framer")) return "fa-solid fa-layer-group";
    if (n.includes("slack")) return "fa-brands fa-slack";
    if (n.includes("lemonsqueezy")) return "fa-solid fa-lemon";
    if (n.includes("three.js") || n.includes("webgl") || n.includes("shader")) return "fa-solid fa-cube";
    if (n.includes("gsap") || n.includes("animation")) return "fa-solid fa-wand-magic-sparkles";
    if (n.includes("html") || n.includes("css") || n.includes("js") || n.includes("javascript")) return "fa-solid fa-code";
    if (n.includes("git")) return "fa-brands fa-git-alt";
    return "fa-solid fa-circle-check";
}

/* ==========================================
   INTERACTIONS & NAV EVENT HANDLERS
   ========================================== */
function initInteractions() {
    // 1. Bottom Dock Active Class on scroll navigation
    const sections = document.querySelectorAll("section");
    const dockLinks = document.querySelectorAll(".dock-link");

    window.addEventListener("scroll", () => {
        let current = "";
        const scrollPos = window.scrollY + 120; // Trigger offset

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = section.getAttribute("id");
            }
        });

        dockLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // 2. Smooth Anchors Nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 30; // Offset adjustments for floating bottom dock visibility
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 3. Contact Form Simulated Submit
    const contactForm = document.getElementById("portfolio-contact-form");
    const alertBox = document.getElementById("contact-form-alert");
    
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector("button[type='submit']");
            const originText = submitBtn.innerHTML;
            
            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Message <i class="fa-solid fa-spinner fa-spin" style="margin-left:8px;"></i>';
            
            setTimeout(() => {
                // Success trigger
                submitBtn.disabled = false;
                submitBtn.innerHTML = originText;
                
                alertBox.className = "form-alert success";
                alertBox.innerHTML = `<strong>Success!</strong> Your message has been received. I'll get back to you shortly.`;
                
                contactForm.reset();
                
                // Hide alert after 5s
                setTimeout(() => {
                    alertBox.style.display = "none";
                }, 5000);
            }, 1800);
        });
    }

    // 4. Video Lightbox Modal actions
    const lightbox = document.getElementById("video-lightbox");
    const closeBtn = document.getElementById("lightbox-close-btn");
    
    if (closeBtn && lightbox) {
        closeBtn.addEventListener("click", () => {
            closeVideoModal();
        });

        // Close when clicking overlay backdrop
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                closeVideoModal();
            }
        });
    }
}

/* ==========================================
   VIDEO LIGHTBOX UTILITIES (GLOBAL SCOPE)
   ========================================== */
function openVideoModal(url) {
    const lightbox = document.getElementById("video-lightbox");
    const iframe = document.getElementById("lightbox-iframe");
    
    if (!lightbox || !iframe) return;

    // Convert youtube watch links to embed link if standard structure
    let embedUrl = url;
    if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    iframe.src = embedUrl;
    lightbox.classList.add("active");
    
    // Disable primary body scroll
    document.body.style.overflow = "hidden";
}

function closeVideoModal() {
    const lightbox = document.getElementById("video-lightbox");
    const iframe = document.getElementById("lightbox-iframe");
    
    if (!lightbox || !iframe) return;

    lightbox.classList.remove("active");
    iframe.src = "";
    
    // Enable body scroll
    document.body.style.overflow = "auto";
}

// Attach openVideoModal globally to handle click bindings from template
window.openVideoModal = openVideoModal;
