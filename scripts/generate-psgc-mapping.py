#!/usr/bin/env python
import sys
import logging
import argparse
import csv
import json
import unicodedata
import re

logging.basicConfig()
logger = logging.getLogger("gpm")

def main():
	logger.setLevel(logging.DEBUG)

	parser = argparse.ArgumentParser(description="Generate PSGC mapping.")
	parser.add_argument("-i", "--input", help="input csv file containing PSGC reference")
	parser.add_argument("-o", "--output", help="output file (json default)")
	parser.add_argument("--php", action="store_true", help="output in PHP array format")

	params = parser.parse_args()

	area_map = {}
	with (open(params.input, "r") if params.input else sys.stdin) as infile:
		for row in csv.reader(infile):
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
				names = get_names(name)
				for n in set(names):
					if not n in area_map:
						area_map[n] = []
					area_map[n].append(area)

	with (open(params.output, "w") if params.output else sys.stdout) as outfile:
		if params.php:
			outfile.write("<?php\n$PSGC_MAP=["+ ",".join(
					['"' + k + '"=>[' + ",".join(
						[str(int(a)) for a in v]
					) + ']' for k,v in area_map.iteritems()]
				) + "];\n?>")
		else:
			json.dump(area_map, outfile)

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
re_trash = re.compile(r"[*-._'/\s]+|of|the")

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