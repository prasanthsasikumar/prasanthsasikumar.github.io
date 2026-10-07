"""Rebuild assets/world.png, the land mask behind the hero map.

You only need this if world.png is lost or you want a different resolution.
Source: Natural Earth 50m land (public domain), https://www.naturalearthdata.com/

    pip install pillow
    python3 tools/make_world_mask.py

The mask is 720 x 288 pixels: 0.5 degrees per pixel, longitude -180..180,
latitude 84..-60. White is land. assets/site.js reads it with these same numbers
(LAT_TOP = 84, RES = 0.5), so change both together if you change them.
"""
import json
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

URL = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_land.geojson"
OUT = Path(__file__).resolve().parent.parent / "assets" / "world.png"
RES, LAT_TOP, LAT_BOTTOM, SUPER = 0.5, 84, -60, 4

land = json.load(urllib.request.urlopen(URL))
width, height = int(360 / RES), int((LAT_TOP - LAT_BOTTOM) / RES)
image = Image.new("L", (width * SUPER, height * SUPER), 0)
draw = ImageDraw.Draw(image)


def pixel(lon, lat):
    return ((lon + 180) / RES * SUPER, (LAT_TOP - lat) / RES * SUPER)


for feature in land["features"]:
    geometry = feature["geometry"]
    polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    for rings in polygons:
        draw.polygon([pixel(*point[:2]) for point in rings[0]], fill=255)
        for hole in rings[1:]:
            draw.polygon([pixel(*point[:2]) for point in hole], fill=0)

# Supersample then threshold low, so small islands (Singapore, Fiji) survive.
mask = image.resize((width, height), Image.BOX).point(lambda v: 255 if v > 40 else 0).convert("1")
mask.save(OUT, optimize=True)
print(f"wrote {OUT} ({width}x{height})")
