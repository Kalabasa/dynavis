#!/usr/bin/env python
from __future__ import print_function
import argparse
import requests
from bs4 import BeautifulSoup
import sys
import csv

def main():
	argparser = argparse.ArgumentParser(description="Scrape the COMELEC election results.")
	argparser.add_argument("-c", "--congress", action="store_true", help="find congressional elections")
	argparser.add_argument("area", metavar="code", type=int, help="PSGC of the area")
	argparser.add_argument("year", metavar="year", type=int, help="year of election")
	argparser.add_argument("-o", "--output", help="output csv file")

	params = argparser.parse_args()
	url, data = get_request_props(params)
	if not url or not data:
		print("Error: Invalid parameters.", file=sys.stderr)
		sys.exit(1)

	request = requests.post(url, data=data)
	elections = parse_text(request.text)
	if not elections:
		print("Error: No results.", file=sys.stderr)
		sys.exit(1)

	area_str = str(params.area).zfill(9)
	elections = [(area_str, params.year) + e for e in elections]
	with (open(params.output, "w") if params.output else sys.stdout) as fp:
		csv.writer(fp).writerows(elections)

def get_request_props(params):
	year = int(params.year)
	area_string = str(params.area).zfill(9)
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
		category = "cong" if params.congress else "prov";
		if year <= 2007:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/" + str(year)[-2:] + "search" + category + ".php"
		elif year == 2010:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/search" + category + ".php"
		else:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/search" + category + str(year) + ".php"
		data["province"] = province_code
		if params.congress:
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
		else:
			url = "http://www.comelec.gov.ph/tpl/ResultsScripts/" + str(year) + "BskeSearch.php"
		data["region"] = region_code
		data["province"] = province_code
		data["municipality"] = municipality_id
		data["barangay"] = barangay_id
		data["hidden_bar"] = 1

	return (url, data)

def parse_text(text):
	soup = BeautifulSoup(text)
	rows = soup.find_all("tr")
	if not rows:
		return None
	headers = [th.get_text() for th in rows[0].find_all("th")]
	values_store = {}
	elections = []
	for row in rows[1:]:
		cells = row.find_all("td")
		for i in range(len(cells)):
			text = cells[i].get_text().strip()
			if text or i > 0:
				values_store[headers[i]] = text
			if "colspan" in cells[i].attrs:
				i += int(cells[i].attrs["colspan"])
		if len(cells) == len(headers):
			# elect tuple: (area, year, position, surname, name, nickname, party, votes)
			surname, name = [x.strip() for x in values_store["NAME"].split(",")]
			elections.append((
				values_store["POSITION"], 
				surname, 
				name, 
				values_store["NICKNAME"],
				values_store["PARTY AFFILIATION"],
				values_store["VOTES OBTAINED"]
			))
	return elections

main()