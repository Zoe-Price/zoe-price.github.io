# zoe-price.github.io

# Boston WebApp

Interactive visualizations showcasing MBTA transit patterns and Boston Celtics performance metrics.


### 1. MBTA Transit Visualization
- Circular layout showing transit lines and stations
- Inner ring: Transit routes
- Outer ring: Individual stations
- Interactive hover features with ridership details
- Proportional segment sizing based on passenger activity

### 2. Celtics Performance Dashboard
- Radar charts for player comparison
- Bar charts for basic statistics
- Scatter plot for metric correlations
- Line chart for game-by-game trends

## Technical Stack

- D3.js (v7)
- Modern web browsers
- Local web server

## Quick Start

1. **Setup**
```bash
git clone [repository-url]
cd [project-directory]
python -m http.server 8000
```

2. **File Structure**
```
project/
├── index.html
├── styles/
├── scripts/
│   ├── mbta.js
│   ├── celtics/
│   │   ├── radar.js
│   │   ├── bar.js
│   │   ├── scatter.js
│   │   └── line.js
└── data/
    ├── mbta_ridership.csv
    └── celtics/
        ├── advanced_stats.csv
        └── game_stats.csv
```

## Key Features

### MBTA Visualization
- Transit system overview
- Ridership patterns
- Station-specific metrics
- Interactive elements

### Celtics Dashboard
- Player performance comparison
- Statistical analysis
- Game progression tracking
- Multiple metric options

## Data Sources
- MBTA ridership data
- Celtics game statistics
- Advanced player metrics

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Usage Tips
- Hover over elements for detailed information
- Use dropdowns to change metrics
- Click buttons to toggle different views
- Drag to zoom where applicable



