#!/usr/bin/env python
import sys
import logging
import argparse
import csv
import json

logging.basicConfig()
logger = logging.getLogger("geojson-hasc-to-psgc")
logger.setLevel(logging.DEBUG)

def main():
	parser = argparse.ArgumentParser(description="Convert HASC codes to PSGC in GeoJSON features.")
	parser.add_argument("-p", "--map", required=True, help="2-column CSV file containing HASC-to-PSGC mapping")
	parser.add_argument("-g", "--geojson", required=True, help="input GeoJSON file")
	parser.add_argument("-o", "--output", required=True, help="output GeoJSON file")

	params = parser.parse_args()

	hasc_psgc_map = {}
	with (sys.stdin if params.map == "-" else open(params.map, "r")) as in_map:
		for row in csv.reader(in_map):
			hasc = row[0]
			psgc = int(row[1])
			hasc_psgc_map[hasc] = psgc

	geojson = None
	with (open(params.geojson, "r")) as in_geojson:
		geojson = json.load(in_geojson)

	for feature in geojson["features"]:
		props = feature["properties"]

		level = 0
		for i in range(0,4):
			key = "HASC_" + str(i)
			if key in props and props[key]:
				hasc = props[key]

		if hasc:
			if hasc in hasc_psgc_map:
				psgc = hasc_psgc_map[hasc]
				props["PSGC"] = str(psgc).zfill(9)
				logger.info(hasc + ":" + props["PSGC"])
			else:
				logger.warn("No PSGC mapping found for " + hasc)
		else:
			logger.error("No HASC property for " + pprint(props))

	with open(params.output, "w") as output:
		json.dump(geojson, output)

main()
