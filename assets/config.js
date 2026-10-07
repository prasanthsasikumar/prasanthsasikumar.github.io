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
   trips   Places you visited. from: the place id you lived in at the time (the arc
           starts there). A replay flies them in order; hovering shows the label. */
window.SITE = {
  map: {
    area: { lon0: -14, lon1: 292, lat0: 62, lat1: -48 },
    places: {
      ker: { name: 'Kerala', note: '2010', lat: 8.52, lon: 76.94, side: -1, dy: -14 },
      chc: { name: 'Christchurch', note: '2017', lat: -43.53, lon: 172.64, side: -1, dy: 14 },
      akl: { name: 'Auckland', note: '2019', lat: -36.85, lon: 174.76, side: -1, dy: -14 },
      sg: { name: 'Singapore', note: 'now', lat: 1.35, lon: 103.82, side: 1, dy: 16, home: true },
      cmb: { name: 'Colombo', note: 'team', lat: 6.93, lon: 79.85, side: -1, dy: 16 },
    },
    routes: [['ker', 'chc'], ['chc', 'akl'], ['akl', 'sg'], ['sg', 'cmb', true]],
    trips: [],
  },
};
