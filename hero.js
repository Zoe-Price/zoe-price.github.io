document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    const cityLights = document.createElement('div');
    cityLights.className = 'city-lights';
    hero.appendChild(cityLights);

    // Create city lights with varying sizes and timings
    for (let i = 0; i < 75; i++) {
        const light = document.createElement('div');
        light.className = 'light';

        // Randomly assign different sizes
        const random = Math.random();
        if (random > 0.7) {
            light.classList.add('large');
        } else if (random < 0.3) {
            light.classList.add('small');
        }

        // Random positions
        light.style.left = `${Math.random() * 100}%`;
        light.style.top = `${Math.random() * 100}%`;

        // Custom animation timing
        light.style.setProperty('--twinkle-duration', `${2 + Math.random() * 3}s`);
        light.style.setProperty('--twinkle-delay', `${Math.random() * 3}s`);

        cityLights.appendChild(light);
    }

    // Create spotlight effect
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    hero.appendChild(spotlight);

    // Mouse movement effect
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        spotlight.style.opacity = '1';
        spotlight.style.transform = `translate(${x - 150}px, ${y - 150}px)`;
    });

    hero.addEventListener('mouseleave', () => {
        spotlight.style.opacity = '0';
    });

    // Parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        const heroContent = document.querySelector('.hero-content');

        // Parallax effect for hero image
        heroImage.style.transform = `scale(1.1) translateY(${scrolled * 0.2}px)`;

        // Fade out hero content on scroll
        if (scrolled > 0) {
            heroContent.style.opacity = Math.max(0, 1 - (scrolled * 0.003));
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        } else {
            heroContent.style.opacity = 1;
            heroContent.style.transform = 'none';
        }
    });
});