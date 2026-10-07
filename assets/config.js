/* Site config: the hero map.
   Edit this file to make the map yours. Everything else is in index.html.

   area    The slice of the world to show, in degrees. lon0 is the left edge, lon1 the
           right edge (go past 180 to wrap the Americas onto the right), lat0 the top,
           lat1 the bottom. The map keeps its aspect ratio inside the right half of the hero.
   places  Where you have lived or worked. Keys are short ids used by routes and trips.
           name, note: the label ("SINGAPORE · NOW"); note is optional. side: 1 puts the label right of
           the dot, -1 left. dy: label offset up (negative) or down (positive), in px.
           home: true gives the place a heartbeat ring (use it once, for where you are now).
   routes  Moves between places, drawn in order: [fromId, toId] or [fromId, toId, true]
           for a dashed "remote" link (a team, a collaborator).
   areaMobile  Optional tighter slice for phones (under 980 px wide). Trips outside it are hidden.
   trips   Places you visited. from: the place id you lived in at the time (the arc
           starts there). note is optional (an event name reads well). Arcs fly from
           each origin continuously; hovering a destination shows its label. */
window.SITE = {
  map: {
    area: { lon0: -14, lon1: 292, lat0: 62, lat1: -48 },
    areaMobile: { lon0: 62, lon1: 192, lat0: 46, lat1: -48 },
    places: {
      ker: { name: 'Kerala', note: 'home', lat: 8.52, lon: 76.94, side: -1, dy: -14 },
      chc: { name: 'Christchurch', note: 'Masters', lat: -43.53, lon: 172.64, side: -1, dy: 14 },
      wlg: { name: 'Wellington', note: 'Work', lat: -41.29, lon: 174.78, side: -1, dy: 1 },
      akl: { name: 'Auckland', note: 'PhD', lat: -36.85, lon: 174.76, side: -1, dy: -14 },
      sg: { name: 'Singapore', note: 'now', lat: 1.35, lon: 103.82, side: 1, dy: 16, home: true },
      cmb: { name: 'Colombo', note: 'team', lat: 6.93, lon: 79.85, side: -1, dy: 16 },
      nyc: { name: 'New York', note: 'team', lat: 40.71, lon: -74.01, side: -1, dy: -14 },
    },
    routes: [['ker', 'chc'], ['chc', 'wlg'], ['wlg', 'akl'], ['akl', 'sg'], ['sg', 'cmb', true], ['sg', 'nyc', true]],
    trips: [
      { name: 'Brisbane', lat: -27.47, lon: 153.03, from: 'akl' },
      { name: 'Fiji', lat: -17.76, lon: 177.44, from: 'akl' },
      { name: 'Sydney', lat: -33.87, lon: 151.21, from: 'sg' },
      { name: 'Orlando', note: 'IEEE VR', lat: 28.54, lon: -81.38, from: 'sg', side: -1 },
      { name: 'Istanbul', note: 'XR Hack', lat: 41.01, lon: 28.98, from: 'sg' },
      { name: 'Delhi', lat: 28.61, lon: 77.21, from: 'sg' },
      { name: 'Guwahati', lat: 26.14, lon: 91.74, from: 'sg' },
      { name: 'Nepal', lat: 27.72, lon: 85.32, from: 'sg', dy: -16 },
      { name: 'Bhutan', lat: 27.47, lon: 89.64, from: 'sg', dy: -16 },
      { name: 'Tokyo', lat: 35.68, lon: 139.69, from: 'sg' },
      { name: 'Seattle', note: 'Meta', lat: 47.61, lon: -122.33, from: 'sg', side: -1 },
      { name: 'Seoul', lat: 37.57, lon: 126.98, from: 'sg' },
      { name: 'Luxembourg', lat: 49.61, lon: 6.13, from: 'sg', dy: -16 },
      { name: 'Dagstuhl', note: 'Seminar', lat: 49.53, lon: 6.89, from: 'sg', dy: 14 },
      { name: 'Abu Dhabi', lat: 24.45, lon: 54.38, from: 'sg' },
      { name: 'Barcelona', note: 'CHI', lat: 41.39, lon: 2.17, from: 'sg', dy: 14 },
      { name: 'France', lat: 48.86, lon: 2.35, from: 'sg', dy: -16 },
      { name: 'Okinawa', note: 'Augmented Humans', lat: 26.21, lon: 127.68, from: 'sg' },
      { name: 'Osaka', lat: 34.69, lon: 135.5, from: 'sg', dy: 14 },
      { name: 'Philadelphia', lat: 39.95, lon: -75.17, from: 'sg', side: -1, dy: 14 },
      { name: 'Boston', lat: 42.36, lon: -71.06, from: 'sg', side: -1 },
      { name: 'China', lat: 39.9, lon: 116.4, from: 'sg' },
    ],
  },
};
