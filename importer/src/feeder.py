# -*- coding: utf-8 -*-

import daemon
import scrappers
import pymongo
import os
import sys
import datetime
import time
import re

from config import Config

SCRAPPERS = (
    ('itjobs', scrappers.ITJobs),
)

class JobFeeder(object):

    def __init__(self, scrappers):
        self.scrappers = scrappers
        self.current_dir = os.path.dirname(os.path.abspath(__file__))

    def bootstrap(self):
        mongostr = "mongodb://%s:%s" % (Config.MONGO_HOST, Config.MONGO_PORT)
        mongo = pymongo.MongoClient(mongostr)
        self.db = mongo[Config.MONGO_DB]
        self.load_configuration()

    def load_configuration(self):
        technologies_file  = os.path.join(self.current_dir, 'config', 'technologies.txt')
        consultancies_file = os.path.join(self.current_dir, 'config', 'consultancies.txt')

        self.technologies  = open(technologies_file).read().strip().split('\n')
        self.consultancies = open(consultancies_file).read().strip().split('\n')


    def run(self):
        for source, scrapper_class in self.scrappers:
            scrapper   = scrapper_class(self.db, self.consultancies, self.technologies)
            doc_cursor = self.db.jobs.find({'source': source})
            doc_cursor.sort('publish_date')
            doc_cursor.limit(1)

            if doc_cursor.count() > 0:
                document = doc_cursor[0]
                date = None
            else:
                document = None
                date = datetime.datetime.now() - datetime.timedelta(days=90)

            scrapper.scrape(document, date)


if __name__ == '__main__':
    feeder = JobFeeder(SCRAPPERS)
    feeder.bootstrap()
    feeder.run()
