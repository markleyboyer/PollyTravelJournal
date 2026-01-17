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
}

export const store = new Store(INITIAL_STATE);
