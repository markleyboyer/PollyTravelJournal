import { INITIAL_STATE } from './state.js';

class Store {
    constructor(initialState) {
        this.state = initialState;
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Actions
    setSidebarMode(mode) {
        this.setState({ sidebarMode: mode });
    }

    selectTrip(tripId) {
        this.setState({
            currentTripId: tripId,
            sidebarMode: 'PAGE',
            currentPageId: this.state.trips.find(t => t.id === tripId)?.pages[0] || null
        });
    }

    selectPage(pageId) {
        this.setState({ currentPageId: pageId });
    }

    toggleMapLayer() {
        this.setState({ showMapLayer: !this.state.showMapLayer });
    }

    setZoomLevel(level) {
        this.setState({ zoomLevel: level });
    }

    addNode(type) {
        const pageId = this.state.currentPageId;
        if (!pageId) return;

        const id = `node-${Date.now()}`;
        const newNode = {
            id,
            type,
            x: 100,
            y: 100,
            width: type === 'TEXT' ? 300 : 400,
            height: type === 'TEXT' ? 100 : 300,
            content: type === 'TEXT' ? 'New text note...' : '',
            src: type === 'PHOTO' ? 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&w=800&q=80' : '',
            style: type === 'TEXT' ? { fontSize: '18px', fontFamily: 'Inter', color: '#1e293b' } : {}
        };

        const newNodes = { ...this.state.nodes, [id]: newNode };
        const newPages = { ...this.state.pages };
        newPages[pageId] = {
            ...newPages[pageId],
            nodes: [...newPages[pageId].nodes, id]
        };

        this.setState({ nodes: newNodes, pages: newPages });
    }

    updateNode(id, updates) {
        if (!this.state.nodes[id]) return;
        const newNodes = {
            ...this.state.nodes,
            [id]: { ...this.state.nodes[id], ...updates }
        };
        this.setState({ nodes: newNodes });
    }

    toggleSilhouette(id) {
        if (!this.state.nodes[id]) return;
        this.updateNode(id, { hasBackgroundRemoved: !this.state.nodes[id].hasBackgroundRemoved });
    }

    deleteNode(id) {
        const pageId = this.state.currentPageId;
        if (!pageId || !this.state.pages[pageId].nodes.includes(id)) return;

        const newNodes = { ...this.state.nodes };
        delete newNodes[id];

        const newPages = { ...this.state.pages };
        newPages[pageId] = {
            ...newPages[pageId],
            nodes: newPages[pageId].nodes.filter(nid => nid !== id)
        };

        this.setState({ nodes: newNodes, pages: newPages });
    }
}

export const store = new Store(INITIAL_STATE);
