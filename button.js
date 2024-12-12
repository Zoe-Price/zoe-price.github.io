document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('highlightGrid');
    const items = Array.from(grid.children);
    let isAnimating = false;

    function updateCarousel(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const firstItem = items[0];
        const lastItem = items[items.length - 1];

        if (direction === 'next') {
            grid.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            grid.style.transform = 'translateX(-33.33%)';

            setTimeout(() => {
                grid.style.transition = 'none';
                grid.style.transform = 'translateX(0)';
                grid.appendChild(firstItem);
                items.push(items.shift()); // Update array order
                isAnimating = false;
            }, 500);
        } else {
            grid.style.transition = 'none';
            grid.insertBefore(lastItem, grid.firstChild);
            items.unshift(items.pop()); // Update array order
            grid.style.transform = 'translateX(-33.33%)';

            setTimeout(() => {
                grid.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                grid.style.transform = 'translateX(0)';
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }, 50);
        }
    }

    document.querySelector('.next').addEventListener('click', () => updateCarousel('next'));
    document.querySelector('.prev').addEventListener('click', () => updateCarousel('prev'));
});
