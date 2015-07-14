#!/usr/bin/env python
import logging
import argparse
import requests
from bs4 import BeautifulSoup
import sys
import csv

email = "None"

logging.basicConfig()
logger = logging.getLogger("scraper")

def main():
	logger.setLevel(logging.DEBUG)

	parser = argparse.ArgumentParser(description="Scrape the COMELEC election results.")
	parser.add_argument("--congress", action="store_true", help="find congressional elections")

	parser.add_argument("year", metavar="YEAR", type=int, help="year of election")

	input_group = parser.add_mutually_exclusive_group()
	input_group.add_argument("-c", "--code", type=int, help="PSGC of the area")
	input_group.add_argument("-i", "--input", help="input csv file containing PSGC")

	parser.add_argument("-o", "--output", help="output csv file")

	params = parser.parse_args()
	
	with open("scrape-elections.conf", "r") as f:
		for line in f:
			key,value = line.strip().split("=", 1)
			if key.strip() == "email":
				global email
				email = value.strip()
				logger.debug("email " + email)
	
	with (open(params.output, "w") if params.output else sys.stdout) as outfile:
		if params.input:
			with (sys.stdin if params.input == "-" else open(params.input, "r")) as infile:
				line = 0
				for row in csv.reader(infile):
					line += 1
					logger.debug("file line " + str(line))
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
					if area and area[2:4] != "00":
						logger.debug("scrape " + area + " " + name)
						scrape(params.year, area, False, outfile)
						if area[4:] == "00000":
							scrape(params.year, area, True, outfile)

		else:
			scrape(params.year, params.code, params.congress, outfile)

def scrape(year, area, congressional, outfile):
	sid = str(year) + " " + str(area) + (" [C]" if congressional else "");

	url, data = get_request_props(year, area, congressional)
	if not url or not data:
		logger.error("[" + sid + "] Invalid parameters")
		sys.exit(1)

	try:
		headers = {
			"User-Agent": "scraperbot/0 (" + email + ")",
			"From": email
		}
		request = requests.post(url, data=data, headers=headers)
	except requests.ConnectionError as e:
		logger.error("[" + sid + "] Error requesting")
		logger.exception(e)
		return False

	try:
		elections = parse_text(request.text)
	except Exception as e:
		logger.error("[" + sid + "] Error parsing")
		logger.exception(e)
		logger.debug(request.text)
		return False
	if elections is None:
		logger.warning("[" + sid + "] No results")
		return False
	elif not elections:
		logger.error("[" + sid + "] Malformed text")
		logger.debug(request.text)
		return False

	area_str = str(area).zfill(9)
	elections = [(area_str, year) + tuple([s.encode("utf-8") for s in e]) for e in elections]
	csv.writer(outfile).writerows(elections)
	return True

def get_request_props(year, area, congressional=False):
	year = int(year)
	area_string = str(area).zfill(9)
	region_code = area_string[0:2]
	province_code = area_string[2:4]
	municipality_code = area_string[4:6]
	barangay_code = area_string[6:9]
	municipality_id = province_code + municipality_code
	barangay_id = municipality_id + barangay_code

	data = {}

	if province_code == "00": # Region
		url = None
		data["region"] = region_code
	elif municipality_code == "00": # Province
		category = "cong" if congressional else "prov";
		if year <= 2007:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/" + str(year)[-2:] + "search" + category + ".php"
		elif year == 2010:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/search" + category + ".php"
		else:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/search" + category + str(year) + ".php"
		data["province"] = province_code
		if congressional:
			data["hidden_cong"] = 1
		else:
			data["hidden_prov"] = 1
	elif barangay_code == "000": # Municipality
		if year <= 2007:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/" + str(year)[-2:] + "searchcity.php"
		elif year == 2010:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/searchcity.php"
		else:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/searchcity" + str(year) + ".php"
		data["province"] = province_code
		data["municipality"] = municipality_code
		data["hidden_prov"] = 1
	else: # Barangay
		if year == 2010:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/searchbarangay.php"
			data["hidden_bar"] = 1
		else:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/" + str(year) + "BskeSearch.php"
			data["hidden_prov"] = 1
		data["region"] = region_code
		data["province"] = province_code
		data["municipality"] = municipality_id
		data["barangay"] = barangay_id

	return (url, data)

def parse_text(text):
	soup = BeautifulSoup(text)
	rows = soup.find_all("tr")
	if not rows:
		if len(soup.find_all("p")) == 1:
			return None
		else:
			return []
	headers = [th.get_text() for th in rows[0].find_all("th")]
	values = {}
	elections = []
	for row in rows[1:]:
		cells = row.find_all("td")
		for i in range(len(cells)):
			text = cells[i].get_text().strip()
			if text or i > 0:
				values[headers[i]] = text
			if "colspan" in cells[i].attrs:
				i += int(cells[i].attrs["colspan"])
		if len(cells) == len(headers):
			# elect tuple: (area, year, position, surname, name, nickname, party, votes)
			surname, name = [x.replace(r"/[^\P{P}-]+/", "").strip() for x in values["NAME"].split(",",1)]
			position = values["POSITION"] if "POSITION" in values else ""
			nickname = values["NICKNAME"] if "NICKNAME" in values else ""
			party = values["PARTY AFFILIATION"] if "PARTY AFFILIATION" in values else ""
			votes = values["VOTES OBTAINED"] if "VOTES OBTAINED" in values else ""
			elections.append((position, surname, name, nickname, party, votes))
	return elections

main()