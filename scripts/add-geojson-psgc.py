#!/usr/bin/env python
import sys
import logging
import pprint
import argparse
import csv
from os.path import commonprefix
import json
import unicodedata
import re

KEYS = [
	["REGION"],
	["PROVINCE"],
	["NAME_2", "VARNAME_2"],
	["NAME_3", "VARNAME_3"]
]

logging.basicConfig()
logger = logging.getLogger("agp")

def main():
	logger.setLevel(logging.DEBUG)

	parser = argparse.ArgumentParser(description="Add PSGC to GeoJSON features.")
	parser.add_argument("-p", "--psgc", required=True, help="input csv file containing PSGC reference")
	parser.add_argument("-g", "--geojson", required=True, help="input GeoJSON file")
	parser.add_argument("-o", "--output", required=True, help="output GeoJSON file")

	params = parser.parse_args()

	cat_map = {}
	name_map = [{} for _ in range(4)]
	psgc_uniq_map = [{} for _ in range(4)]
	hier = {"name":"root","area":"000000000","children":{}}
	jump = {}
	with (sys.stdin if params.psgc == "-" else open(params.psgc, "r")) as in_psgc:
		chain = [hier]
		last_area = None
		last_name = None
		last_level = -1
		level = 0
		for row in csv.reader(in_psgc):
			area = None
			name = ""
			for cell in (unicode(x, "utf-8") for x in row):
				if len(cell) == 9:
					try:
						int(cell)
						area = cell
						continue
					except ValueError:
						pass
				if len(cell) > len(name):
					name = cell
			if area:
				last_level = level
				if area[2:4] == "00":
					level = 0 # Reg
				elif area[4:6] == "00":
					level = 1 # Prov
				elif area[6:9] == "000":
					level = 2 # Mun
				else:
					level = 3 # Bar

				comlen = [0,2,4,6][level]
				if last_area and area[:comlen] != last_area[:comlen]:
					chain.pop()
					last_level = -1

				if level > last_level:
					chain.append(chain[-1]["children"][last_name])
				elif level < last_level:
					for _ in range(level,last_level):
						chain.pop()

				names = get_names(name)
				main = names[0]
				for n in names:
					if not n in chain[-1]:
						main = n
						break
				for n in set(names):
					if n in name_map[level]:
						name_map[level][n] = None
					else:
						name_map[level][n] = main

				if main in psgc_uniq_map[level]:
					psgc_uniq_map[level][main] = None
				else:
					psgc_uniq_map[level][main] = area

				cat = ".".join([x["name"] for x in chain] + [main])
				cat_map[cat] = area

				children = chain[-1]["children"]
				child = jump[area] = {
					"name": main,
					"area": area,
					"children": {}
				}
				for n in names:
					if n in children and main != n:
						other = children[n]
						if other and other["area"] != area and other["name"] != n:
							children[n] = None
					else:
						children[n] = child

				last_area = area
				last_name = main

	psgc_uniq_map = [{k:v for k,v in x.iteritems() if v} for x in psgc_uniq_map]
	name_map = [{k:v for k,v in x.iteritems() if v} for x in name_map]

	# print get_main_name(u"Daraga", 2, name_map)
	# pprint.pprint({k:v for k,v in name_map[2].iteritems() if k!=v})
	# return

	geojson = None
	with (open(params.geojson, "r")) as in_geojson:
		geojson = json.load(in_geojson)

	for feature in geojson["features"]:
		props = feature["properties"]

		values = [None] * len(KEYS)
		for i,keys in enumerate(KEYS):
			values[i] = set([x for l in [props[x].split("|") for x in keys if x in props and props[x]] for x in l])

		level = None
		for i,v in enumerate(values):
			if v:
				level = i

		name = get_main_name(values[level], level, name_map)
		cat = ".".join(["root"] + [get_main_name(x, i, name_map) for i,x in enumerate(values[:level])] + [name])
		
		if cat in cat_map:
			area = cat_map[cat]
		elif name in psgc_uniq_map[level]:
			area = psgc_uniq_map[level][name]
		else:
			area = None
			chain = []
			p = hier["children"]
			for i in range(0,level+1):
				aname = get_main_name(values[i], i, name_map)
				if aname in p and p[aname]:
					print i,aname
					if i == level:
						area = p[aname]["area"]
						break
					p = p[aname]["children"]
				elif aname in psgc_uniq_map[i]:
					p = jump[psgc_uniq_map[i][aname]]["children"]
				else:
					input = None
					while input == None:
						print("Can't find " + aname + " [" + "RPMB"[i] + "]")
						pprint.pprint(values)
						print("Enter PSGC for " + list(values[i])[0] + " [" + ["Region","Province","Municipality","Barangay"][i] + "]:")
						input = raw_input("\t")
						if not input:
							print("None")
							break
						elif len(input) != 9 or input not in jump:
							input = None
							print("Invalid")
							continue
					if not input:
						break
					psgc_uniq_map[i][aname] = input
					if i == level:
						area = input
						break
					p = jump[input]["children"]
				chain.append(aname)

		if area:
			logger.debug(str(area) + " " + name)
			props["PSGC"] = area
		else:
			print("Can't find " + name + " [" + "RPMB"[level] + "]")
			pprint.pprint(values)

	with open(params.output, "w") as output:
		json.dump(geojson, output)

main_name_cache = [{} for _ in range(4)]

def get_main_name(strings, level, name_map):
	if not strings:
		return None
	for s in strings:
		if s in main_name_cache[level]:
			return main_name_cache[level][s]
	names = [x for l in [get_names(s) for s in strings] for x in l]
	main = names[0]
	for n in names:
		if n in name_map[level]:
			main = name_map[level][n]
	for s in strings:
		main_name_cache[level][s] = main
	return main

def get_names(s):
	names = filter(None, [normalize(x) for x in [s] + filter(None, re_split.split(s))])
	add = []
	if names[0].endswith("city"):
		add.append(names[0])
		names[0] = names[0][:-4]
	for n in names:
		if n.endswith("city"):
			add.append(n[:-4])
	return names + add

re_split = re.compile(r"[()]|\s+-\s+")
re_roman = re.compile(r"\b(?=[CLXVI]+\b)(C){0,3}(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b")
re_trash = re.compile(r"[*-._'/\s]+|of|the|capital")

def normalize(s):
	s = str(unicodedata.normalize("NFKD", unicode(s)).encode("ascii", "ignore"))
	s = re.sub(r"_", r" ", s)
	s = re_roman.sub(roman_to_int, s).lower()
	s = re.sub(r"\bcity\s+of(.+)", r"\1city", s)
	s = re.sub(r"\bbarangay\b", "bgy", s)
	s = re.sub(r"\bpoblacion\b", "pob", s)
	s = re.sub(r"\b(general|heneral|hen)\b", "gen", s)
	s = re_trash.sub("", s)
	return s

numeral_map = zip(
	(100, 90, 50, 40, 10, 9, 5, 4, 1),
	("C", "XC", "L", "XL", "X", "IX", "V", "IV", "I")
)

def roman_to_int(match):
	n = match.group(0).upper()
	i = result = 0
	for integer, numeral in numeral_map:
		while n[i:i + len(numeral)] == numeral:
			result += integer
			i += len(numeral)
	return str(result)

main()