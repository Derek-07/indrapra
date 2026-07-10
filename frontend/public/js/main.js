document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple active link state update on click
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// --- Dynamic Project Data & Logic ---
const projectsData = {
    'azure': {
        title: 'The Azure Residence',
        tag: 'Residential Space',
        description: 'A luxurious living space that seamlessly blends dark teal accents with golden architectural highlights. This space was designed to maximize natural light while maintaining a moody, cinematic atmosphere at night.',
        heroImage: 'asset/project_livingroom_1783442814598.jpg',
        gallery: [
            'asset/idea_bedroom_1783442834138.jpg',
            'asset/project_kitchen_1783442824055.jpg'
        ]
    },
    'marble': {
        title: 'Marble Peak Kitchen',
        tag: 'Culinary Design',
        description: 'Move over standard kitchens. This culinary masterpiece features dark charcoal cabinets paired with premium white marble to create a striking visual contrast that serves as the heart of the home.',
        heroImage: 'asset/project_kitchen_1783442824055.jpg',
        gallery: [
            'asset/card_residential_1783441988273.jpg',
            'asset/project_livingroom_1783442814598.jpg'
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the project details page
    if (document.getElementById('detail-title')) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (projectId && projectsData[projectId]) {
            const project = projectsData[projectId];
            document.getElementById('detail-title').innerText = project.title;
            document.getElementById('detail-tag').innerText = project.tag;
            document.getElementById('detail-desc').innerText = project.description;
            document.getElementById('detail-hero-img').src = project.heroImage;
            
            const galleryContainer = document.getElementById('detail-gallery');
            galleryContainer.innerHTML = ''; // clear loading
            project.gallery.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                galleryContainer.appendChild(img);
            });
        } else {
            document.getElementById('detail-title').innerText = "Project Not Found";
            document.getElementById('detail-desc').innerText = "We couldn't find the project you are looking for.";
        }
    }
});

// --- Interactive Testimonial Slider ---
const testimonials = [
    { text: "Indraprastha Construction handled our project with professionalism and precision. Everything was well-organized.", author: "— Sarah Collins, Business Owner" },
    { text: "Their attention to detail and commitment to quality is unmatched. Truly the best builders in the city.", author: "— Michael Chang, Homeowner" },
    { text: "Delivered on time and within budget. The glassmorphism and modern designs exceeded our expectations.", author: "— Emma Roberts, Tech Startup CEO" }
];
let currentTestimonial = 0;

window.prevTestimonial = function() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    updateTestimonial();
};

window.nextTestimonial = function() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonial();
};

function updateTestimonial() {
    const textEl = document.getElementById('testimonial-text');
    const authEl = document.getElementById('testimonial-author');
    if (textEl && authEl) {
        textEl.style.opacity = 0;
        authEl.style.opacity = 0;
        setTimeout(() => {
            textEl.innerText = testimonials[currentTestimonial].text;
            authEl.innerText = testimonials[currentTestimonial].author;
            textEl.style.opacity = 1;
            authEl.style.opacity = 1;
        }, 300);
    }
}

// --- Dark Mode Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');

function updateThemeIcons() {
    if (!darkIcon || !lightIcon) return;
    if (document.documentElement.classList.contains('dark')) {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
    } else {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    }
}

// Check initial theme preference
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
updateThemeIcons();

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
        updateThemeIcons();
    });
}

// --- Scroll Animations (IntersectionObserver) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-10', '-translate-x-10', 'translate-x-10', 'translate-y-5', 'scale-95');
            entry.target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0', 'scale-100');
            // Adding a transition utility class dynamically if missing
            entry.target.classList.add('transition-all', 'duration-700', 'ease-out');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
});
// --- Security: Prevent Inspect Element and Text Selection ---
document.addEventListener('contextmenu', event => event.preventDefault()); // Block right-click

document.addEventListener('keydown', function(e) {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+I or Cmd+Option+I (Inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+C or Cmd+Option+C (Inspect Element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+J or Cmd+Option+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
    }
    // Ctrl+U or Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
});

// --- Custom Cursor Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .cursor-pointer');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // --- WhatsApp Floating Button ---
    const waButton = document.createElement('a');
    waButton.href = 'https://wa.me/1234567890?text=Hello%20Indraprastha%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services.';
    waButton.target = '_blank';
    waButton.classList.add('whatsapp-float');
    waButton.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.286 5.286 0 00-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.528 5.833L.044 24l6.305-1.654A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.996c-1.802 0-3.513-.473-5.012-1.328L2.525 21.84l1.196-4.354C2.793 15.938 2.27 14.025 2.27 12c0-5.36 4.37-9.73 9.73-9.73s9.73 4.37 9.73 9.73-4.37 9.73-9.73 9.73z"/></svg>';
    document.body.appendChild(waButton);
});


// --- Cost Estimator Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const estTypeBtns = document.querySelectorAll('.est-type-btn');
    const estArea = document.getElementById('est-area');
    const estQuality = document.getElementById('est-quality');
    const estResult = document.getElementById('est-result');

    if (estArea && estResult) {
        let currentRate = 150; // default residential rate

        function calculateEstimate() {
            const area = parseFloat(estArea.value) || 0;
            const qualityMultiplier = parseFloat(estQuality.value);
            // Quality 1 = x1, 2 = x1.5, 3 = x2.2
            let multiplier = 1;
            if (qualityMultiplier === 2) multiplier = 1.5;
            if (qualityMultiplier === 3) multiplier = 2.2;

            const total = area * currentRate * multiplier;
            
            // Format as currency
            estResult.innerText = '$' + total.toLocaleString('en-US');
        }

        estTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                estTypeBtns.forEach(b => {
                    b.classList.remove('border-brandGold', 'bg-brandGold', 'text-brandTeal');
                    b.classList.add('border-white/30', 'text-white');
                    b.classList.remove('hover:bg-white/10'); // remove hover from active
                });
                
                this.classList.remove('border-white/30', 'text-white');
                this.classList.add('border-brandGold', 'bg-brandGold', 'text-brandTeal');
                
                currentRate = parseFloat(this.getAttribute('data-value'));
                calculateEstimate();
            });
        });

        estArea.addEventListener('input', calculateEstimate);
        estQuality.addEventListener('input', calculateEstimate);

        // Initial calc
        calculateEstimate();
    }
});


// --- AI Assistant UI (Premium Add-on Mockup) ---
document.addEventListener('DOMContentLoaded', () => {
    // Inject AI Assistant button and chat window
    const aiHTML = `
        <div id="ai-assistant-wrapper" class="fixed bottom-6 left-6 z-50">
            <!-- Chat Window (Hidden by default) -->
            <div id="ai-chat-window" class="hidden w-80 bg-white dark:bg-darkSurface rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-4 transform transition-all scale-95 opacity-0 origin-bottom-left">
                <!-- Header -->
                <div class="bg-brandTeal text-white p-4 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-brandGold flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm">AI Assistant</h4>
                            <p class="text-[10px] text-brandGold uppercase tracking-widest">Premium Feature</p>
                        </div>
                    </div>
                    <button id="ai-close-btn" class="text-white hover:text-brandGold transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <!-- Chat Area -->
                <div class="h-64 p-4 overflow-y-auto bg-gray-50 dark:bg-darkBg flex flex-col gap-3">
                    <div class="self-start bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[85%]">
                        Hello! I am Indraprastha's AI Assistant. How can I help you today?
                    </div>
                </div>
                
                <!-- Input Area -->
                <div class="p-3 bg-white dark:bg-darkSurface border-t border-gray-100 dark:border-gray-800">
                    <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden px-3 py-1">
                        <input type="text" placeholder="Type your message..." class="w-full bg-transparent text-sm py-2 outline-none dark:text-white" disabled>
                        <button class="text-brandGold p-1 opacity-50 cursor-not-allowed">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Floating Button -->
            <button id="ai-toggle-btn" class="w-14 h-14 bg-brandGold text-white rounded-full shadow-[0_4px_14px_rgba(199,159,57,0.4)] flex items-center justify-center hover:scale-110 transition-transform relative group">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                
                <!-- Tooltip -->
                <div class="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap hidden md:block">
                    Chat with AI
                </div>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', aiHTML);

    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiCloseBtn = document.getElementById('ai-close-btn');

    function toggleChat() {
        if (aiChatWindow.classList.contains('hidden')) {
            aiChatWindow.classList.remove('hidden');
            setTimeout(() => {
                aiChatWindow.classList.remove('scale-95', 'opacity-0');
                aiChatWindow.classList.add('scale-100', 'opacity-100');
            }, 10);
        } else {
            aiChatWindow.classList.remove('scale-100', 'opacity-100');
            aiChatWindow.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                aiChatWindow.classList.add('hidden');
            }, 300); // match transition duration
        }
    }

    aiToggleBtn.addEventListener('click', toggleChat);
    aiCloseBtn.addEventListener('click', toggleChat);
});



// --- Secret Admin Access (Triple Click Footer) ---
document.addEventListener('DOMContentLoaded', () => {
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
        if (div.innerText && div.innerText.includes('2026 Indraprastha Construction')) {
            let clickCount = 0;
            let clickTimer;
            div.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 3) {
                    window.location.href = '/admin';
                }
                clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 1000); // Reset count after 1 second
            });
        }
    });
});
