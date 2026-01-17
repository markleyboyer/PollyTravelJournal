/**
 * Nomad Sketchbook Data Schema
 * Hierarchy: Trips > Chapters/Pages > Media Nodes
 */

export const INITIAL_STATE = {
  currentTripId: 'trip-vibrant-kerala',
  currentPageId: 'kochi-arrival',
  sidebarMode: 'TRIP', // 'TRIP' or 'PAGE'
  showMapLayer: false,
  showTickler: false,
  zoomLevel: 1, // 1 for normal, 2 for deep dive magnifying glass

  trips: [
    {
      id: 'trip-vibrant-kerala',
      title: 'Vibrant Kerala 2026',
      date: '2026-01-10',
      thumbnail: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      description: 'Journey through Kochi, Munnar, and the Backwaters.',
      pages: ['kochi-arrival', 'houseboat-life', 'munnar-club'],
      tags: ['india', 'kerala', 'backwaters', 'munnar'],
      gpsRoute: [
        { lat: 9.9312, lng: 76.2673 },
        { lat: 9.5983, lng: 76.4312 },
        { lat: 10.0889, lng: 77.0595 }
      ]
    }
  ],

  pages: {
    'kochi-arrival': {
      id: 'kochi-arrival',
      tripId: 'trip-vibrant-kerala',
      title: 'Arrival in Kochi',
      date: '2026-01-10',
      nodes: ['node-kochi-text', 'node-kochi-photo'],
      tags: ['kochi', 'arrival']
    },
    'houseboat-life': {
      id: 'houseboat-life',
      tripId: 'trip-vibrant-kerala',
      title: 'Backwater Houseboat',
      date: '2026-01-12',
      nodes: ['node-houseboat-voice', 'node-houseboat-photo'],
      tags: ['backwaters', 'houseboat']
    },
    'munnar-club': {
      id: 'munnar-club',
      tripId: 'trip-vibrant-kerala',
      title: 'High Range Club, Munnar',
      date: '2026-01-15',
      nodes: ['node-munnar-text', 'node-munnar-sketch'],
      tags: ['munnar', 'history', 'tea']
    }
  },

  nodes: {
    'node-kochi-text': {
      id: 'node-kochi-text',
      type: 'TEXT',
      content: 'Fort Kochi greets us with its colonial charm and the smell of fresh fish from the Chinese nets.',
      x: 100,
      y: 150,
      width: 400,
      height: 100,
      style: { fontSize: '24px', fontFamily: 'Outfit', color: '#1e293b' }
    },
    'node-kochi-photo': {
      id: 'node-kochi-photo',
      type: 'PHOTO',
      src: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
      x: 100,
      y: 300,
      width: 600,
      height: 450,
      hasBackgroundRemoved: false
    },
    'node-houseboat-voice': {
      id: 'node-houseboat-voice',
      type: 'VOICE',
      src: '#',
      transcription: 'The gentle lap of water against the hull. Pure serenity in the backwaters.',
      x: 100,
      y: 100,
      width: 300,
      height: 80
    },
    'node-houseboat-photo': {
      id: 'node-houseboat-photo',
      type: 'PHOTO',
      src: 'https://images.unsplash.com/photo-1550503991-acc214777d9c?auto=format&fit=crop&w=800&q=80',
      x: 450,
      y: 200,
      width: 400,
      height: 300,
      hasBackgroundRemoved: true
    },
    'node-munnar-text': {
      id: 'node-munnar-text',
      type: 'TEXT',
      content: 'The High Range Club feels like stepping back in time. Surrounded by tea estates and rolling mists.',
      x: 150,
      y: 100,
      width: 350,
      height: 150,
      style: { fontSize: '20px', fontFamily: 'Inter', fontWeight: '300', color: '#1e293b' }
    },
    'node-munnar-sketch': {
      id: 'node-munnar-sketch',
      type: 'SKETCH',
      data: '',
      x: 50,
      y: 300,
      width: 900,
      height: 800
    }
  },

  tickler: [
    { id: 't-1', text: 'Visit the Gobi desert next year', date: '2026-06-01' },
    { id: 't-2', text: 'Buy new watercolor set', date: '2025-04-10' }
  ],

  ical: [
    { id: 'e-1', title: 'Flight to Leh', date: '2025-05-15', category: 'travel' },
    { id: 'e-2', title: 'Lunch with George', date: '2025-05-20', category: 'personal' }
  ]
};
