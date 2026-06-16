/**
 * Core Data Seeding and Storage System
 * Initializes portfolio content collections if they do not exist.
 */

const DEFAULT_PROFILE = {
    name: "Aman Sahu",
    title: "Web Designer & Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    intro: "Designs that move fast, sell smart, and never sleep.",
    about: "I design experiences that captivate audiences and turn every interaction into action. By bridging visual aesthetics, high-conversion landing page layouts, and clean frontend code, I help startups level up.",
    yearsOfExperience: 5,
    completedProjects: 120,
    happyClients: 80
};

const DEFAULT_EXPERIENCE = [
    {
        id: "exp_1",
        role: "Lead Interactive Developer",
        company: "Aura Studios",
        period: "2024 - Present",
        description: "Leading frontend visual engineering with Three.js, GLSL shaders, and GSAP. Architecting high-performance WebGL portfolios and immersive campaign sites.",
        services: ["Interactive Development", "WebGL Engineering", "Creative Tech Consulting"]
    },
    {
        id: "exp_2",
        role: "Motion Graphics Designer",
        company: "Horizon Media",
        period: "2022 - 2024",
        description: "Produced high-fidelity YouTube video intros, dynamic kinetic typography overlays, and 3D product visualizations using After Effects, Cinema 4D, and Premiere Pro.",
        services: ["Video Production", "VFX & Compositing", "3D Camera Mapping"]
    },
    {
        id: "exp_3",
        role: "Full-Stack Web Developer",
        company: "Nexus Digital",
        period: "2021 - 2022",
        description: "Created customized interactive marketing platforms, optimized site load speeds, and integrated smooth micro-animations using vanilla CSS transitions and native JS.",
        services: ["Frontend Performance", "API Integrations", "Responsive UI Design"]
    }
];

const DEFAULT_SKILLS = [
    { name: "Three.js / WebGL / Shaders", value: 88, category: "Frontend" },
    { name: "GSAP / ScrollTrigger / CSS Anims", value: 92, category: "Frontend" },
    { name: "HTML5 / CSS3 / ES6+ JS", value: 95, category: "Frontend" },
    { name: "After Effects / VFX", value: 90, category: "Creative" },
    { name: "Blender / 3D Asset Creation", value: 78, category: "Creative" },
    { name: "Premiere Pro / Sound Design", value: 85, category: "Creative" },
    { name: "Figma / Design Systems", value: 85, category: "Tools" },
    { name: "Git / Webpack / Web Performance", value: 80, category: "Tools" }
];

const DEFAULT_WEB_PROJECTS = [
    {
        id: "web_1",
        title: "Lumina Interactive Agency",
        description: "A high-performance interactive WebGL marketing agency page utilizing Three.js neon particle waves, mouse-responsive vortex fields, and smooth GSAP page section fades.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
        tech: ["HTML5", "CSS3", "JavaScript", "Three.js", "GSAP"],
        link: "https://example.com/lumina"
    },
    {
        id: "web_2",
        title: "Nebula Cryptospace Hub",
        description: "Cryptocurrency token visualizer tracking real-time API pricing. Leverages beautiful glassmorphism dashboards, custom canvas charts, and CSS variables for day/night glows.",
        image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop&q=60",
        tech: ["HTML5", "Vanilla JS", "ChartJS", "CSS Variables"],
        link: "https://example.com/nebula"
    },
    {
        id: "web_3",
        title: "Vortex 3D Product Configurator",
        description: "An online interactive product viewer. Users can dynamically switch product colors, trigger assembly/disassembly animations, and customize shaders in real time.",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
        tech: ["Three.js", "GSAP", "CSS Grid", "JavaScript"],
        link: "https://example.com/vortex"
    }
];

const DEFAULT_VIDEO_PROJECTS = [
    {
        id: "vid_1",
        title: "Neon Cyberpunk VFX Reel 2026",
        description: "An intense, fast-paced portfolio reel highlighting cyberpunk visual effects, After Effects expressions, audio sync overlays, and stylized title animations.",
        thumbnail: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&auto=format&fit=crop&q=60",
        link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "Motion Graphics"
    },
    {
        id: "vid_2",
        title: "Aero Drone Commercial Ad",
        description: "Kinetic typography commercial detailing product specifications with custom 3D element tracking shots and smooth cinematic overlays.",
        thumbnail: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
        link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "Commercial"
    },
    {
        id: "vid_3",
        title: "Synthwave Sound Waveform",
        description: "An audio-reactive digital backdrop animation synced using Cinema 4D modifiers and custom Premiere sound-wave expressions.",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
        link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "VFX / 3D"
    }
];

const DEFAULT_SOCIAL_LINKS = [
    { id: "soc_1", platform: "GitHub", url: "https://github.com", icon: "fab fa-github" },
    { id: "soc_2", platform: "LinkedIn", url: "https://linkedin.com", icon: "fab fa-linkedin-in" },
    { id: "soc_3", platform: "YouTube", url: "https://youtube.com", icon: "fab fa-youtube" },
    { id: "soc_4", platform: "Dribbble", url: "https://dribbble.com", icon: "fab fa-dribbble" }
];

// Helper to interact with Local Storage safely
const storage = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error retrieving key ${key} from LocalStorage:`, e);
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error saving key ${key} to LocalStorage:`, e);
            return false;
        }
    }
};

// Seeding function called once on scripts loading or explicitly
function initializeLocalStorage() {
    const currentProfile = storage.get("profileData");
    if (!currentProfile || !currentProfile.avatar) {
        storage.set("profileData", DEFAULT_PROFILE);
    }
    if (!storage.get("experienceData")) {
        storage.set("experienceData", DEFAULT_EXPERIENCE);
    }
    if (!storage.get("skillsData")) {
        storage.set("skillsData", DEFAULT_SKILLS);
    }
    if (!storage.get("websiteProjects")) {
        storage.set("websiteProjects", DEFAULT_WEB_PROJECTS);
    }
    if (!storage.get("videoProjects")) {
        storage.set("videoProjects", DEFAULT_VIDEO_PROJECTS);
    }
    if (!storage.get("socialLinks")) {
        storage.set("socialLinks", DEFAULT_SOCIAL_LINKS);
    }
}

// Make initialize run immediately when this script gets imported
initializeLocalStorage();

// Export access utility objects to global window scope for ease of use across main.js & admin.js
window.PortfolioStorage = {
    getProfile: () => storage.get("profileData"),
    setProfile: (data) => storage.set("profileData", data),

    getExperience: () => storage.get("experienceData"),
    setExperience: (data) => storage.set("experienceData", data),

    getSkills: () => storage.get("skillsData"),
    setSkills: (data) => storage.set("skillsData", data),

    getWebProjects: () => storage.get("websiteProjects"),
    setWebProjects: (data) => storage.set("websiteProjects", data),

    getVideoProjects: () => storage.get("videoProjects"),
    setVideoProjects: (data) => storage.set("videoProjects", data),

    getSocialLinks: () => storage.get("socialLinks"),
    setSocialLinks: (data) => storage.set("socialLinks", data),

    resetToDefault: () => {
        storage.set("profileData", DEFAULT_PROFILE);
        storage.set("experienceData", DEFAULT_EXPERIENCE);
        storage.set("skillsData", DEFAULT_SKILLS);
        storage.set("websiteProjects", DEFAULT_WEB_PROJECTS);
        storage.set("videoProjects", DEFAULT_VIDEO_PROJECTS);
        storage.set("socialLinks", DEFAULT_SOCIAL_LINKS);
        return true;
    }
};
