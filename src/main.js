import { store } from './src/store/index.js';
import './style.css';

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
        this.map = null;
        this.mapLayer = null;

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

        // Node Creation Menu
        const addBtn = document.getElementById('add-item-btn');
        const addMenu = document.getElementById('add-menu');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => addMenu.classList.add('hidden'));

        addMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                store.addNode(type);
                addMenu.classList.add('hidden');
            });
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
                    if (!page) return;
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
        const page = pages[currentPageId];

        // Only re-render nodes if needed to avoid flickering (simplified for now)
        this.canvas.innerHTML = '';

        if (!page) {
            this.canvas.innerHTML = '<div class="canvas-empty">Select a page to begin sketching</div>';
            return;
        }

        page.nodes.forEach(nodeId => {
            const node = nodes[nodeId];
            if (node) {
                const nodeEl = this.createNode(node);
                this.canvas.appendChild(nodeEl);
                this.setupDraggable(nodeEl, node.id);
            }
        });

        // Map layer container
        const mapLayer = document.createElement('div');
        mapLayer.id = 'map-layer';
        mapLayer.className = `map-layer ${state.showMapLayer ? '' : 'map-hidden'}`;
        this.canvas.appendChild(mapLayer);
    }

    setupDraggable(el, nodeId) {
        let isDragging = false;
        let startX, startY;

        el.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-controls')) return;
            isDragging = true;
            startX = e.clientX - el.offsetLeft;
            startY = e.clientY - el.offsetTop;
            el.style.zIndex = 1000;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.style.zIndex = '';
                store.updateNode(nodeId, {
                    x: parseInt(el.style.left),
                    y: parseInt(el.style.top)
                });
            }
        });
    }

    createNode(node) {
        const el = document.createElement('div');
        el.className = `node node-${node.type.toLowerCase()} ${node.hasBackgroundRemoved ? 'silhouette' : ''}`;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.style.width = node.width ? `${node.width}px` : 'auto';
        el.style.height = node.height ? `${node.height}px` : 'auto';

        const controls = `
      <div class="node-controls">
        ${node.type === 'PHOTO' ? `<button class="node-btn silhouette-btn">${node.hasBackgroundRemoved ? 'Show BG' : 'Silhouette'}</button>` : ''}
        <button class="node-btn delete-btn">×</button>
      </div>
    `;

        switch (node.type) {
            case 'TEXT':
                el.innerHTML = `${controls}<div class="node-text-content" style="${Object.entries(node.style || {}).map(([k, v]) => `${k}:${v}`).join(';')}">${node.content}</div>`;
                break;
            case 'PHOTO':
                el.innerHTML = `${controls}<img src="${node.src}" alt="Travel Photo">`;
                const silBtn = el.querySelector('.silhouette-btn');
                if (silBtn) silBtn.addEventListener('click', () => store.toggleSilhouette(node.id));
                break;
            default:
                el.innerHTML = `${controls}<div class="node-placeholder">${node.type} Node</div>`;
        }

        el.querySelector('.delete-btn').addEventListener('click', () => store.deleteNode(node.id));

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
        if (!state.showMapLayer) {
            if (this.map) {
                this.map.remove();
                this.map = null;
            }
            return;
        }

        const trip = state.trips.find(t => t.id === state.currentTripId);
        if (!trip || !trip.gpsRoute || trip.gpsRoute.length === 0) return;

        if (!this.map) {
            this.map = L.map('map-layer').setView([trip.gpsRoute[0].lat, trip.gpsRoute[0].lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(this.map);

            const points = trip.gpsRoute.map(p => [p.lat, p.lng]);
            L.polyline(points, { color: '#3b82f6', weight: 4 }).addTo(this.map);
            this.map.fitBounds(points);
        }
    }

    updateZoom(state) {
        const container = document.querySelector('.canvas-container');
        if (state.zoomLevel === 2) {
            container.classList.add('zoom-2x');
            this.canvas.style.transform = 'scale(1.5)';
        } else {
            container.classList.remove('zoom-2x');
            this.canvas.style.transform = 'scale(0.8)';
        }
    }
}

new App();
