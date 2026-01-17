import { store } from './src/store/index.js';
import './src/style.css';

/**
 * Nomad Sketchbook - Main Controller
 */

class App {
    constructor() {
        this.appEl = document.getElementById('app');
        this.sidebarContent = document.getElementById('sidebar-content');
        this.sidebarTitle = document.getElementById('sidebar-title');
        this.canvas = document.getElementById('canvas');
        this.modeBtn = document.getElementById('toggle-sidebar-mode');

        this.init();
    }

    init() {
        // Subscribe to store updates
        store.subscribe((state) => this.render(state));

        // Initial Render
        this.render(store.getState());

        // Setup Event Listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle Sidebar Mode
        this.modeBtn.addEventListener('click', () => {
            const { sidebarMode } = store.getState();
            store.setSidebarMode(sidebarMode === 'TRIP' ? 'PAGE' : 'TRIP');
        });

        // Toggle Map Layer
        document.getElementById('toggle-map-layer').addEventListener('click', () => {
            store.toggleMapLayer();
        });

        // Toggle Zoom (Deep Dive)
        document.getElementById('toggle-zoom').addEventListener('click', () => {
            const { zoomLevel } = store.getState();
            const newZoom = zoomLevel === 1 ? 2 : 1;
            store.setZoomLevel(newZoom);
        });

        // Toggle Tickler Drawer
        document.getElementById('toggle-tickler').addEventListener('click', () => {
            const drawer = document.getElementById('tickler-drawer');
            drawer.classList.toggle('hidden');
        });
    }

    render(state) {
        this.renderSidebar(state);
        this.renderCanvas(state);
        this.renderHeader(state);
        this.renderMapLayer(state);
        this.updateZoom(state);
    }

    renderSidebar(state) {
        const { sidebarMode, trips, currentTripId, pages, currentPageId } = state;

        this.sidebarTitle.textContent = sidebarMode === 'TRIP' ? 'Expeditions' : 'Entries';
        this.sidebarContent.innerHTML = '';

        if (sidebarMode === 'TRIP') {
            trips.forEach(trip => {
                const el = this.createThumbnail(trip.thumbnail, trip.title, trip.date, trip.id === currentTripId);
                el.addEventListener('click', () => store.selectTrip(trip.id));
                this.sidebarContent.appendChild(el);
            });
        } else {
            const trip = trips.find(t => t.id === currentTripId);
            if (trip) {
                trip.pages.forEach(pageId => {
                    const page = pages[pageId];
                    const el = this.createThumbnail(null, page.title, page.date, page.id === currentPageId, true);
                    el.addEventListener('click', () => store.selectPage(page.id));
                    this.sidebarContent.appendChild(el);
                });
            }
        }
    }

    createThumbnail(imgSrc, title, subtitle, isActive, isPage = false) {
        const div = document.createElement('div');
        div.className = `thumb-item ${isActive ? 'active' : ''} ${isPage ? 'page-thumb' : ''}`;

        let imgHtml = imgSrc
            ? `<img src="${imgSrc}" class="thumb-img" alt="${title}">`
            : `<div class="thumb-placeholder">📄</div>`;

        div.innerHTML = `
      ${imgHtml}
      <div class="thumb-info">
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>
    `;
        return div;
    }

    renderCanvas(state) {
        const { currentPageId, pages, nodes } = state;
        this.canvas.innerHTML = '';

        const page = pages[currentPageId];
        if (!page) {
            this.canvas.innerHTML = '<div class="canvas-empty">Select a page to begin sketching</div>';
            return;
        }

        page.nodes.forEach(nodeId => {
            const node = nodes[nodeId];
            if (node) {
                const nodeEl = this.createNode(node);
                this.canvas.appendChild(nodeEl);
            }
        });

        // Handle Map Layer placeholder
        const mapLayer = document.createElement('div');
        mapLayer.id = 'map-layer';
        mapLayer.className = `map-layer ${state.showMapLayer ? '' : 'hidden'}`;
        mapLayer.innerHTML = '<div class="map-placeholder">GPS Breadcrumbs Overlay (Gaia GPS)</div>';
        this.canvas.appendChild(mapLayer);
    }

    createNode(node) {
        const el = document.createElement('div');
        el.className = `node node-${node.type.toLowerCase()}`;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.style.width = node.width ? `${node.width}px` : 'auto';
        el.style.height = node.height ? `${node.height}px` : 'auto';

        switch (node.type) {
            case 'TEXT':
                el.innerHTML = `<div class="node-text-content" style="${Object.entries(node.style || {}).map(([k, v]) => `${k}:${v}`).join(';')}">${node.content}</div>`;
                break;
            case 'PHOTO':
                el.innerHTML = `<img src="${node.src}" class="${node.hasBackgroundRemoved ? 'bg-removed' : ''}" alt="Travel Photo">`;
                break;
            case 'VOICE':
                el.innerHTML = `
          <div class="voice-node">
            <button class="btn-play">▶</button>
            <div class="waveform-stub"></div>
            <p class="transcription">${node.transcription}</p>
          </div>
        `;
                break;
            case 'SKETCH':
                el.innerHTML = `<canvas class="sketch-canvas" width="${node.width}" height="${node.height}"></canvas>`;
                break;
        }
        return el;
    }

    renderHeader(state) {
        const { currentTripId, currentPageId, trips, pages } = state;
        const trip = trips.find(t => t.id === currentTripId);
        const page = pages[currentPageId];

        document.getElementById('trip-breadcrumb').textContent = trip ? trip.title : 'No Trip Selected';
        document.getElementById('page-breadcrumb').textContent = page ? page.title : '...';
        document.getElementById('toggle-zoom').textContent = `Zoom [${state.zoomLevel}x]`;
    }

    renderMapLayer(state) {
        // Placeholder logic for map visibility
    }

    updateZoom(state) {
        const container = document.querySelector('.canvas-container');
        if (state.zoomLevel === 2) {
            container.classList.add('zoom-2x');
            this.canvas.style.transform = 'scale(1.5)';
        } else {
            container.classList.remove('zoom-2x');
            this.canvas.style.transform = 'scale(0.8)'; // Fit to view by default
        }
    }
}

new App();
