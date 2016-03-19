#!/usr/bin/env python
import sys
import os
import shutil
import errno
import logging
import collections
import geojson
import math

DATA_DIR = "./data/"
LOG_FILE = DATA_DIR + "log"

try:
	file_handle = os.open(LOG_FILE, os.O_CREAT | os.O_APPEND | os.O_WRONLY)
except OSError as e:
	if e.errno == errno.EEXIST:
		pass
	else:
		raise

logging.basicConfig(filename=LOG_FILE)

def main():
	filepath = sys.argv[1]
	level = sys.argv[2]

	logger = logging.getLogger("(" + filepath + "," + level + ")")
	logger.addHandler(logging.StreamHandler())
	logger.setLevel(logging.DEBUG)

	logger.info("GeoJSON processing started")

	zoom = { # [GEOJSON_ZOOM_CONST] These zoom levels must match the server
		"region": 6,
		"province": 8,
		"municipality": 10,
		"barangay": 12,
	}[level]

	tiles = collections.defaultdict(list)

	# Read GeoJson file
	with open(filepath, "r") as infile:
		gj = geojson.loads(infile.read())

		# For each feature, put into appropriate tile
		for feature in gj.features:
			bounds = (sys.maxint,sys.maxint, -sys.maxint-1,-sys.maxint-1) # min x,y; max x,y
			for tile in [deg2num(lat,lon,zoom) for lon,lat in geojson.utils.coords(feature)]:
				x = tile[0]
				y = tile[1]
				bounds = (
					min(bounds[0], tile[0]),
					min(bounds[1], tile[1]),
					max(bounds[2], tile[0]),
					max(bounds[3], tile[1])
				)
			center = ((bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2)
			key = (int(center[0]), int(center[1]))
			tiles[key].append(feature)

		logger.info("Read " + str(len(gj.features)) + " features")
		logger.info("Compiled " + str(len(tiles)) + " tiles")

		# Save tiles
		root = os.path.join(DATA_DIR, level)
		if(os.path.exists(root)):
			shutil.rmtree(root)
			logger.info("Removed old tile data")
		for tile,features in tiles.iteritems():
			fc = geojson.FeatureCollection(features)

			dirpath = os.path.join(root, str(tile[0]))
			tilepath = os.path.join(dirpath, str(tile[1]) + ".json")

			mkdir_p(dirpath, 0775)
			with os.fdopen(os.open(tilepath, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0664), "w") as outfile:
				outfile.write(geojson.dumps(fc))

	logger.info("GeoJSON processing finished")

# http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Python
def deg2num(lat_deg, lon_deg, zoom):
	lat_rad = math.radians(lat_deg)
	n = 2.0 ** zoom
	xtile = int((lon_deg + 180.0) / 360.0 * n)
	ytile = int((1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n)
	return (xtile, ytile)

# http://stackoverflow.com/a/600612
def mkdir_p(path, mode):
	try:
		os.makedirs(path, mode)
	except OSError as exc: # Python >2.5
		if exc.errno == errno.EEXIST and os.path.isdir(path):
			pass
		else: raise

try:
	main()
except Exception:
	logging.exception("GeoJSON processing failed!")
