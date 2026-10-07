/* Site config: the hero map.
   Edit this file to make the map yours. Everything else is in index.html.

   area    The slice of the world to show, in degrees. lon0 is the left edge, lon1 the
           right edge (go past 180 to wrap the Americas onto the right), lat0 the top,
           lat1 the bottom. The map keeps its aspect ratio inside the right half of the hero.
   places  Where you have lived or worked. Keys are short ids used by routes and trips.
           name, note: the label ("SINGAPORE · NOW"). side: 1 puts the label right of
           the dot, -1 left. dy: label offset up (negative) or down (positive), in px.
           home: true gives the place a heartbeat ring (use it once, for where you are now).
   routes  Moves between places, drawn in order: [fromId, toId] or [fromId, toId, true]
           for a dashed "remote" link (a team, a collaborator).
   areaMobile  Optional tighter slice for phones (under 980 px wide). Trips outside it are hidden.
   trips   Places you visited. from: the place id you lived in at the time (the arc
           starts there). A replay flies them in order; hovering shows the label. */
window.SITE = {
  map: {
    area: { lon0: -14, lon1: 292, lat0: 62, lat1: -48 },
    areaMobile: { lon0: 62, lon1: 192, lat0: 46, lat1: -48 },
    places: {
      ker: { name: 'Kerala', note: '2010', lat: 8.52, lon: 76.94, side: -1, dy: -14 },
      chc: { name: 'Christchurch', note: '2017', lat: -43.53, lon: 172.64, side: -1, dy: 14 },
      akl: { name: 'Auckland', note: '2019', lat: -36.85, lon: 174.76, side: -1, dy: -14 },
      sg: { name: 'Singapore', note: 'now', lat: 1.35, lon: 103.82, side: 1, dy: 16, home: true },
      cmb: { name: 'Colombo', note: 'team', lat: 6.93, lon: 79.85, side: -1, dy: 16 },
    },
    routes: [['ker', 'chc'], ['chc', 'akl'], ['akl', 'sg'], ['sg', 'cmb', true]],
    trips: [
      { name: 'Fiji', note: 'visited', lat: -17.76, lon: 177.44, from: 'akl' },
      { name: 'Sydney', note: 'ISMAR 2023', lat: -33.87, lon: 151.21, from: 'sg' },
      { name: 'Orlando', note: 'IEEE VR 2024', lat: 28.54, lon: -81.38, from: 'sg', side: -1 },
      { name: 'Istanbul', note: 'XR Hack 2024', lat: 41.01, lon: 28.98, from: 'sg' },
      { name: 'Delhi', note: '2025', lat: 28.61, lon: 77.21, from: 'sg' },
      { name: 'Guwahati', note: '2025', lat: 26.14, lon: 91.74, from: 'sg' },
      { name: 'Tokyo', note: '2025', lat: 35.68, lon: 139.69, from: 'sg' },
      { name: 'New York', note: '2025', lat: 40.71, lon: -74.01, from: 'sg', side: -1 },
      { name: 'Seattle', note: 'Meta summits', lat: 47.61, lon: -122.33, from: 'sg', side: -1 },
      { name: 'Phuket', note: '2025', lat: 7.88, lon: 98.39, from: 'sg' },
      { name: 'Seoul', note: '2025', lat: 37.57, lon: 126.98, from: 'sg' },
      { name: 'Dagstuhl', note: 'Seminar 2025', lat: 49.53, lon: 6.89, from: 'sg' },
      { name: 'Abu Dhabi', note: '2026', lat: 24.45, lon: 54.38, from: 'sg' },
      { name: 'Barcelona', note: 'CHI 2026', lat: 41.39, lon: 2.17, from: 'sg', dy: 14 },
      { name: 'Okinawa', note: 'AHs 2026', lat: 26.21, lon: 127.68, from: 'sg' },
      { name: 'Osaka', note: '2026', lat: 34.69, lon: 135.5, from: 'sg', dy: 14 },
      { name: 'Philadelphia', note: '2026', lat: 39.95, lon: -75.17, from: 'sg', side: -1, dy: 14 },
      { name: 'Boston', note: '2026', lat: 42.36, lon: -71.06, from: 'sg', side: -1 },
      { name: 'France', note: 'visited', lat: 48.86, lon: 2.35, from: 'sg' },
      { name: 'Vietnam', note: 'visited', lat: 21.03, lon: 105.85, from: 'sg' },
      { name: 'China', note: 'visited', lat: 39.9, lon: 116.4, from: 'sg' },
    ],
  },
};
