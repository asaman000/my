/**
 * Aman Sahu Portfolio Admin Panel Logic
 * Manages Login, Tabs, CRUD tables, forms, and local storage bindings.
 */

// 1. Credentials Configuration
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

document.addEventListener("DOMContentLoaded", () => {
    // Check session login state
    checkAuthStatus();

    // Bind login form
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

    // Bind logout button
    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // Bind sidebar tabs
    initSidebarTabs();

    // Bind forms
    initFormHandlers();

    // Bind system reset
    const resetBtn = document.getElementById("system-reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", handleSystemReset);
    }

    // Initialize Theme switch
    initThemeSwitcher();
});

function initThemeSwitcher() {
    const toggle = document.getElementById("theme-toggle");
    const body = document.body;
    if (!toggle) return;

    // Check cached preference
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
        body.classList.add("light-theme");
        updateToggleIcons(true);
    }

    toggle.addEventListener("click", () => {
        body.classList.toggle("light-theme");
        const isLight = body.classList.contains("light-theme");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        updateToggleIcons(isLight);
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
   AUTHENTICATION CHECK
   ========================================== */
function checkAuthStatus() {
    const isLogged = sessionStorage.getItem("adminLoggedIn") === "true";
    const overlay = document.getElementById("login-overlay");
    const dashboard = document.getElementById("admin-dashboard");

    if (isLogged) {
        overlay.classList.add("hidden");
        dashboard.classList.add("visible");
        loadDashboardData();
    } else {
        overlay.classList.remove("hidden");
        dashboard.classList.remove("visible");
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const user = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-password").value.trim();
    const errorMsg = document.getElementById("login-error-msg");

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem("adminLoggedIn", "true");
        errorMsg.style.display = "none";

        // Clear login form fields
        document.getElementById("admin-login-form").reset();

        // Toggle view states
        checkAuthStatus();
        showToast("Authenticated successfully!", "success");
    } else {
        errorMsg.style.display = "block";
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to sign out?")) {
        sessionStorage.removeItem("adminLoggedIn");
        checkAuthStatus();
        showToast("Signed out successfully.", "success");
    }
}

/* ==========================================
   SIDEBAR TABS CONTROLLER
   ========================================== */
function initSidebarTabs() {
    const tabs = document.querySelectorAll(".sidebar-tab[data-panel]");
    const panels = document.querySelectorAll(".admin-content-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const targetPanelId = tab.dataset.panel;
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });
}

/* ==========================================
   LOAD SYSTEM DATA ON LOGIN
   ========================================== */
function loadDashboardData() {
    if (!window.PortfolioStorage) return;

    // Load Profile
    const profile = window.PortfolioStorage.getProfile();
    if (profile) {
        document.getElementById("prof-name").value = profile.name;
        document.getElementById("prof-title").value = profile.title;
        document.getElementById("prof-avatar").value = profile.avatar || "";
        document.getElementById("prof-intro").value = profile.intro;
        document.getElementById("prof-about").value = profile.about;
        document.getElementById("prof-exp-num").value = profile.yearsOfExperience;
        document.getElementById("prof-proj-num").value = profile.completedProjects;
        document.getElementById("prof-client-num").value = profile.happyClients;
    }

    // Load Experience table
    renderExperienceTable();

    // Load Skills table
    renderSkillsTable();

    // Load Website Projects table
    renderWebProjectsTable();

    // Load Video Projects table
    renderVideoProjectsTable();

    // Load Socials Forms
    renderSocialsForm();
}

/* ==========================================
   CRUD: EXPERIENCE TIMELINE
   ========================================== */
function renderExperienceTable() {
    const exps = window.PortfolioStorage.getExperience() || [];
    const tbody = document.getElementById("experience-table-body");
    if (!tbody) return;

    if (exps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No timeline items found.</td></tr>`;
        return;
    }

    tbody.innerHTML = exps.map(item => `
        <tr>
            <td style="font-weight: 600; color: var(--accent-blue);">${item.period}</td>
            <td>${item.role}</td>
            <td>${item.company}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editExperienceItem('${item.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteExperienceItem('${item.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteExperienceItem(id) {
    if (confirm("Are you sure you want to delete this experience timeline item?")) {
        const exps = window.PortfolioStorage.getExperience() || [];
        const filtered = exps.filter(item => item.id !== id);
        window.PortfolioStorage.setExperience(filtered);
        renderExperienceTable();
        showToast("Experience item deleted successfully.", "success");
    }
}

function editExperienceItem(id) {
    const exps = window.PortfolioStorage.getExperience() || [];
    const item = exps.find(x => x.id === id);
    if (!item) return;

    document.getElementById("modal-exp-title").textContent = "Edit Timeline Event";
    document.getElementById("exp-id").value = item.id;
    document.getElementById("exp-period").value = item.period;
    document.getElementById("exp-role").value = item.role;
    document.getElementById("exp-company").value = item.company;
    document.getElementById("exp-desc").value = item.description;
    document.getElementById("exp-services").value = item.services ? item.services.join(", ") : "";

    openModal('modal-experience');
}

function openExpModal() {
    document.getElementById("modal-exp-title").textContent = "Add Timeline Event";
    document.getElementById("form-experience").reset();
    document.getElementById("exp-id").value = "";
    openModal('modal-experience');
}

/* ==========================================
   CRUD: PROFESSIONAL SKILLS
   ========================================== */
function renderSkillsTable() {
    const skills = window.PortfolioStorage.getSkills() || [];
    const tbody = document.getElementById("skills-table-body");
    if (!tbody) return;

    if (skills.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No skills created.</td></tr>`;
        return;
    }

    tbody.innerHTML = skills.map((item, idx) => `
        <tr>
            <td style="font-weight:600;">${item.name}</td>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:100px; height:6px; background-color: var(--bg-secondary); border-radius:3px; overflow:hidden; border: 1px solid var(--border-glass);">
                        <div style="width:${item.value}%; height:100%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));"></div>
                    </div>
                    <span>${item.value}%</span>
                </div>
            </td>
            <td><span class="badge-tag" style="border-color: var(--border-glass); color: var(--text-secondary);">${item.category}</span></td>
            <td>
                <button class="btn-icon btn-edit" onclick="editSkillItem(${idx})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteSkillItem(${idx})" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteSkillItem(index) {
    if (confirm("Are you sure you want to delete this skill?")) {
        const skills = window.PortfolioStorage.getSkills() || [];
        skills.splice(index, 1);
        window.PortfolioStorage.setSkills(skills);
        renderSkillsTable();
        showToast("Skill deleted successfully.", "success");
    }
}

function editSkillItem(index) {
    const skills = window.PortfolioStorage.getSkills() || [];
    const item = skills[index];
    if (!item) return;

    document.getElementById("modal-skill-title").textContent = "Edit Skill Entry";
    document.getElementById("skill-id-ref").value = index; // Store array index as ref
    document.getElementById("skill-name").value = item.name;
    document.getElementById("skill-value").value = item.value;
    document.getElementById("skill-category").value = item.category;

    updateRangeValLabel(item.value);
    openModal('modal-skill');
}

function openSkillModal() {
    document.getElementById("modal-skill-title").textContent = "Add Skill Entry";
    document.getElementById("form-skill").reset();
    document.getElementById("skill-id-ref").value = "";
    updateRangeValLabel(50);
    openModal('modal-skill');
}

function updateRangeValLabel(val) {
    document.getElementById("range-val-lbl").textContent = val + "%";
}
window.updateRangeValLabel = updateRangeValLabel; // Global hook for html event inline

/* ==========================================
   CRUD: WEB PROJECTS
   ========================================== */
function renderWebProjectsTable() {
    const projects = window.PortfolioStorage.getWebProjects() || [];
    const tbody = document.getElementById("web-projects-table-body");
    if (!tbody) return;

    if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No web projects.</td></tr>`;
        return;
    }

    tbody.innerHTML = projects.map(item => `
        <tr>
            <td><img src="${item.image}" class="cell-image" alt="thumb"></td>
            <td style="font-weight:600;">${item.title}</td>
            <td>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    ${item.tech.map(t => `<span class="badge-tag" style="font-size:0.7rem; padding:1px 5px;">${t}</span>`).join('')}
                </div>
            </td>
            <td>
                <button class="btn-icon btn-edit" onclick="editWebProjectItem('${item.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteWebProjectItem('${item.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteWebProjectItem(id) {
    if (confirm("Are you sure you want to delete this web project?")) {
        const projects = window.PortfolioStorage.getWebProjects() || [];
        const filtered = projects.filter(x => x.id !== id);
        window.PortfolioStorage.setWebProjects(filtered);
        renderWebProjectsTable();
        showToast("Web project deleted successfully.", "success");
    }
}

function editWebProjectItem(id) {
    const projects = window.PortfolioStorage.getWebProjects() || [];
    const item = projects.find(x => x.id === id);
    if (!item) return;

    document.getElementById("modal-web-title").textContent = "Edit Web Project";
    document.getElementById("web-id").value = item.id;
    document.getElementById("web-proj-title").value = item.title;
    document.getElementById("web-proj-desc").value = item.description;
    document.getElementById("web-proj-image").value = item.image;
    document.getElementById("web-proj-tech").value = item.tech ? item.tech.join(", ") : "";
    document.getElementById("web-proj-link").value = item.link;

    openModal('modal-web-project');
}

function openWebProjModal() {
    document.getElementById("modal-web-title").textContent = "Add Web Project";
    document.getElementById("form-web-project").reset();
    document.getElementById("web-id").value = "";
    openModal('modal-web-project');
}

/* ==========================================
   CRUD: VIDEO PROJECTS
   ========================================== */
function renderVideoProjectsTable() {
    const videos = window.PortfolioStorage.getVideoProjects() || [];
    const tbody = document.getElementById("video-projects-table-body");
    if (!tbody) return;

    if (videos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No video projects.</td></tr>`;
        return;
    }

    tbody.innerHTML = videos.map(item => `
        <tr>
            <td><img src="${item.thumbnail}" class="cell-image" alt="thumb"></td>
            <td style="font-weight:600;">${item.title}</td>
            <td><span class="badge-tag" style="border-color:var(--border-glass); color:var(--text-secondary);">${item.category}</span></td>
            <td>
                <button class="btn-icon btn-edit" onclick="editVideoItem('${item.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteVideoItem('${item.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteVideoItem(id) {
    if (confirm("Are you sure you want to delete this video portfolio item?")) {
        const videos = window.PortfolioStorage.getVideoProjects() || [];
        const filtered = videos.filter(x => x.id !== id);
        window.PortfolioStorage.setVideoProjects(filtered);
        renderVideoProjectsTable();
        showToast("Video portfolio item deleted.", "success");
    }
}

function editVideoItem(id) {
    const videos = window.PortfolioStorage.getVideoProjects() || [];
    const item = videos.find(x => x.id === id);
    if (!item) return;

    document.getElementById("modal-video-title").textContent = "Edit Video Entry";
    document.getElementById("video-id").value = item.id;
    document.getElementById("vid-title").value = item.title;
    document.getElementById("vid-desc").value = item.description;
    document.getElementById("vid-thumbnail").value = item.thumbnail;
    document.getElementById("vid-link").value = item.link;
    document.getElementById("vid-category").value = item.category;

    openModal('modal-video-project');
}

function openVideoProjModal() {
    document.getElementById("modal-video-title").textContent = "Add Video Entry";
    document.getElementById("form-video-project").reset();
    document.getElementById("video-id").value = "";
    openModal('modal-video-project');
}

/* ==========================================
   SOCIAL CONNECTIONS
   ========================================== */
function renderSocialsForm() {
    const socials = window.PortfolioStorage.getSocialLinks() || [];
    const container = document.getElementById("socials-inputs-container");
    if (!container) return;

    container.innerHTML = socials.map((soc, idx) => `
        <div class="form-row" style="margin-bottom: 20px;">
            <input type="hidden" name="social-id-${idx}" value="${soc.id}">
            <div class="form-group">
                <label class="form-label">Platform Name</label>
                <input type="text" name="social-platform-${idx}" class="form-input" value="${soc.platform}" required readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Profile / Connection Link URL</label>
                <input type="url" name="social-url-${idx}" class="form-input" value="${soc.url}" placeholder="https://..." required>
            </div>
        </div>
    `).join('');
}

/* ==========================================
   FORM SUBMISSIONS
   ========================================== */
function initFormHandlers() {
    // 1. Profile submit
    const profForm = document.getElementById("form-profile");
    if (profForm) {
        profForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const updated = {
                name: document.getElementById("prof-name").value.trim(),
                title: document.getElementById("prof-title").value.trim(),
                avatar: document.getElementById("prof-avatar").value.trim(),
                intro: document.getElementById("prof-intro").value.trim(),
                about: document.getElementById("prof-about").value.trim(),
                yearsOfExperience: parseInt(document.getElementById("prof-exp-num").value) || 0,
                completedProjects: parseInt(document.getElementById("prof-proj-num").value) || 0,
                happyClients: parseInt(document.getElementById("prof-client-num").value) || 0
            };
            window.PortfolioStorage.setProfile(updated);
            showToast("Profile details updated successfully!", "success");
        });
    }

    // 2. Experience submit (Add & Edit combined)
    const expForm = document.getElementById("form-experience");
    if (expForm) {
        expForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("exp-id").value;
            const period = document.getElementById("exp-period").value.trim();
            const role = document.getElementById("exp-role").value.trim();
            const company = document.getElementById("exp-company").value.trim();
            const description = document.getElementById("exp-desc").value.trim();

            // Clean up services array
            const servicesStr = document.getElementById("exp-services").value.trim();
            const services = servicesStr ? servicesStr.split(",").map(s => s.trim()).filter(Boolean) : [];

            const exps = window.PortfolioStorage.getExperience() || [];

            if (id) {
                // Edit mode
                const idx = exps.findIndex(x => x.id === id);
                if (idx !== -1) {
                    exps[idx] = { id, period, role, company, description, services };
                }
            } else {
                // Add mode
                const newId = "exp_" + Date.now();
                exps.push({ id: newId, period, role, company, description, services });
            }

            window.PortfolioStorage.setExperience(exps);
            renderExperienceTable();
            closeModal('modal-experience');
            showToast("Timeline experience event updated.", "success");
        });
    }

    // 3. Skill submit
    const skillForm = document.getElementById("form-skill");
    if (skillForm) {
        skillForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const idRef = document.getElementById("skill-id-ref").value;
            const name = document.getElementById("skill-name").value.trim();
            const value = parseInt(document.getElementById("skill-value").value) || 50;
            const category = document.getElementById("skill-category").value;

            const skills = window.PortfolioStorage.getSkills() || [];

            if (idRef !== "") {
                // Edit mode (idx matches range index)
                const idx = parseInt(idRef);
                if (skills[idx]) {
                    skills[idx] = { name, value, category };
                }
            } else {
                // Add mode
                skills.push({ name, value, category });
            }

            window.PortfolioStorage.setSkills(skills);
            renderSkillsTable();
            closeModal('modal-skill');
            showToast("Skill index updated successfully.", "success");
        });
    }

    // 4. Web project submit
    const webForm = document.getElementById("form-web-project");
    if (webForm) {
        webForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("web-id").value;
            const title = document.getElementById("web-proj-title").value.trim();
            const description = document.getElementById("web-proj-desc").value.trim();
            const image = document.getElementById("web-proj-image").value.trim();
            const link = document.getElementById("web-proj-link").value.trim();

            // Clean up tech array
            const techStr = document.getElementById("web-proj-tech").value.trim();
            const tech = techStr ? techStr.split(",").map(t => t.trim()).filter(Boolean) : [];

            const projects = window.PortfolioStorage.getWebProjects() || [];

            if (id) {
                // Edit
                const idx = projects.findIndex(x => x.id === id);
                if (idx !== -1) {
                    projects[idx] = { id, title, description, image, link, tech };
                }
            } else {
                // Add
                const newId = "web_" + Date.now();
                projects.push({ id: newId, title, description, image, link, tech });
            }

            window.PortfolioStorage.setWebProjects(projects);
            renderWebProjectsTable();
            closeModal('modal-web-project');
            showToast("Website project database updated.", "success");
        });
    }

    // 5. Video project submit
    const vidForm = document.getElementById("form-video-project");
    if (vidForm) {
        vidForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("video-id").value;
            const title = document.getElementById("vid-title").value.trim();
            const description = document.getElementById("vid-desc").value.trim();
            const thumbnail = document.getElementById("vid-thumbnail").value.trim();
            const link = document.getElementById("vid-link").value.trim();
            const category = document.getElementById("vid-category").value.trim();

            const videos = window.PortfolioStorage.getVideoProjects() || [];

            if (id) {
                // Edit
                const idx = videos.findIndex(x => x.id === id);
                if (idx !== -1) {
                    videos[idx] = { id, title, description, thumbnail, link, category };
                }
            } else {
                // Add
                const newId = "vid_" + Date.now();
                videos.push({ id: newId, title, description, thumbnail, link, category });
            }

            window.PortfolioStorage.setVideoProjects(videos);
            renderVideoProjectsTable();
            closeModal('modal-video-project');
            showToast("Video reel project database updated.", "success");
        });
    }

    // 6. Socials submit
    const socForm = document.getElementById("form-socials");
    if (socForm) {
        socForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const socials = window.PortfolioStorage.getSocialLinks() || [];

            const updated = socials.map((soc, idx) => {
                const id = soc.id;
                const url = document.querySelector(`input[name="social-url-${idx}"]`).value.trim();
                return { ...soc, url };
            });

            window.PortfolioStorage.setSocialLinks(updated);
            renderSocialsForm();
            showToast("Social links synced successfully.", "success");
        });
    }
}

/* ==========================================
   SYSTEM SEED RESETTER
   ========================================== */
function handleSystemReset() {
    if (confirm("WARNING: This will overwrite any edits with the default demo portfolio data. Continue?")) {
        window.PortfolioStorage.resetToDefault();
        loadDashboardData();
        showToast("Database seeded with defaults.", "success");
    }
}

/* ==========================================
   MODAL AND TOAST VISUAL ALERTS
   ========================================== */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;

    toast.textContent = message;

    if (type === "error") {
        toast.classList.add("error");
    } else {
        toast.classList.remove("error");
    }

    toast.classList.add("show");

    // Fade out after 3.5s
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

// Bind closures and hooks globally for modal close clicks
window.openModal = openModal;
window.closeModal = closeModal;
window.editExperienceItem = editExperienceItem;
window.deleteExperienceItem = deleteExperienceItem;
window.openExpModal = openExpModal;
window.editSkillItem = editSkillItem;
window.deleteSkillItem = deleteSkillItem;
window.openSkillModal = openSkillModal;
window.editWebProjectItem = editWebProjectItem;
window.deleteWebProjectItem = deleteWebProjectItem;
window.openWebProjModal = openWebProjModal;
window.editVideoItem = editVideoItem;
window.deleteVideoItem = deleteVideoItem;
window.openVideoProjModal = openVideoProjModal;
