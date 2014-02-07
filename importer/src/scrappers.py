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

    def __init__(self, db, consultancies, technologies):
        self.db = db
        self.consultancies = consultancies
        self.technologies  = set(technologies)

        re_lambda = lambda x: re.escape(x)
        consultancies = map(re_lambda, consultancies)
        self.re_consultancies = re.compile('|'.join(consultancies))


    def scrape(self, last_document, since_date):
        original_locale = locale.getlocale(locale.LC_TIME)
        locale.setlocale(locale.LC_TIME, self.site_locale)

        self.last_document = last_document
        self.since_date    = since_date
        inserted_entries   = 0

        for docs in self.docs_in_range():
            self.db.jobs.insert(docs)
            inserted_entries += len(docs)
            print "Inserted more {} entries. Total: ".format(len(docs), inserted_entries)


    def docs_in_range(self):
        since_date  = self.last_document['publish_date'] if self.last_document else self.since_date
        source_id   = self.last_document['source_id'] if self.last_document else None
        page_number = 1
        more_recent_doc = False

        while not more_recent_doc:
            jobs = []
            page_entries = self.page_entries(page_number)

            for href in page_entries:
                job = self.entry(href)

                if job['publish_date'] < since_date or job['source_id'] == source_id:
                    print "Stoping insertion, because found a duplicated entry."
                    more_recent_doc = True
                    break

                jobs.append(job)

            if len(jobs) > 0:
                yield jobs


    def page_entries(self, page):
        url = self.url.format(self.base_url, page)
        r = requests.get(url)
        soup = BeautifulSoup(r.text)

        entries = soup.find_all('article', class_='item')
        entries = map(lambda x: x.div.h1.a['href'], entries)
        print "Retrieved {} entries from page {}".format(len(entries), page)
        return entries


    def entry(self, href):
        url = self.base_url + href
        r = requests.get(url)
        soup = BeautifulSoup(r.text).find('div', class_='show')

        publish_date = time.strptime(soup.find('div', class_='date').get_text(), 'Publicado em %d %B %Y')
        publish_date = datetime.datetime.fromtimestamp(time.mktime(publish_date))

        details  = list(soup.find('div', class_='details').stripped_strings)
        location = details[1].split(' - ')[0]

        body_text  = soup.find('div', class_='body').get_text().lower()
        for pontuaction in [', ', '. ', '! ']:
            body_text = body_text.replace(pontuaction, ' ')

        body_words = set(body_text.split())

        job = {}
        job['title']          = soup.h1.get_text()
        job['company']        = soup.find('div', class_='company').a.get_text()
        job['publish_date']   = publish_date
        job['body']           = str(soup.find('div', class_='body'))
        job['source']         = self.source
        job['location']       = location
        job['is_consultancy'] = self.re_consultancies.search(job['company'].lower()) != None
        job['technologies']   = list(self.technologies.intersection(body_words))
        job['source_id']      = re.match(self.detail_regexp, href, re.IGNORECASE).groups()[0]
        job['url']            = url

        print "Fecthed {}. Waiting a second...".format(url)
        time.sleep(1)

        return job
