# -*- coding: utf-8 -*-

import requests
import re
import sys
import locale
import time
import datetime

from bs4 import BeautifulSoup

class ITJobs(object):

    base_url      = 'http://itjobs.pt'
    url           = '{}/emprego?page={}'
    detail_regexp = '\/oferta\/([\d]+)\/[\w-]+'
    site_locale   = 'pt_PT.UTF-8'
    country_offer = 'Portugal'
    source        = 'itjobs'

    def __init__(self, db):
        self.db = db

    def scrape(self, last_document, nentries):
        original_locale = locale.getlocale(locale.LC_TIME)
        locale.setlocale(locale.LC_TIME, self.site_locale)

        if last_document is None:
            inserted_entries = 0
            current_page = 1

            while inserted_entries < nentries:
                page_entries = self.page_entries(1)
                self.db.jobs.insert(page_entries)

                inserted_entries += len(page_entries)
                current_page += 1

                print "Inserted more {} entries. Total: ".format(len(page_entries), inserted_entries)


    def page_entries(self, page):
        url = self.url.format(self.base_url, page)
        r = requests.get(url)
        soup = BeautifulSoup(r.text)

        entries = soup.find_all('article', class_='item')
        entries = map(lambda x: x.div.h1.a['href'], entries)
        return map(self.entry, entries)


    def entry(self, href):
        url = self.base_url + href
        r = requests.get(url)
        soup = BeautifulSoup(r.text).find('div', class_='show')

        publish_date = time.strptime(soup.find('div', class_='date').get_text(), 'Publicado em %d %B %Y')
        publish_date = datetime.datetime.fromtimestamp(time.mktime(publish_date))

        job = {}
        job['title']        = soup.h1.get_text()
        job['company']      = soup.find('div', class_='company').a.get_text()
        job['publish_date'] = publish_date
        job['body']         = str(soup.find('div', class_='body'))
        job['source']       = self.source

        print "Fecthed {}. Waiting a second...".format(url)
        time.sleep(1)

        return job
