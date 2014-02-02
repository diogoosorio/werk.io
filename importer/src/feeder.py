# -*- coding: utf-8 -*-

import scrappers
import pymongo

from config import Config

SCRAPE_LIMIT = 400
SCRAPPERS = (
    ('itjobs', scrappers.ITJobs),
)

class JobFeeder(object):
    def __init__(self, scrappers):
        self.scrappers = scrappers

    def bootstrap(self):
        mongostr = "mongodb://%s:%s" % (Config.MONGO_HOST, Config.MONGO_PORT)
        mongo = pymongo.MongoClient(mongostr)
        self.db = mongo[Config.MONGO_DB]

    def run(self):
        for source, scrapper_class in self.scrappers:
            scrapper   = scrapper_class(self.db)
            doc_cursor = self.db.jobs.find({'source': source})
            doc_cursor.sort('publish_date')
            doc_cursor.limit(1)

            if doc_cursor.count() > 0:
                document = doc_cursor[0]
                nentries = None
            else:
                document = None
                nentries = SCRAPE_LIMIT

            scrapper.scrape(document, nentries)


if __name__ == '__main__':
    feeder = JobFeeder(SCRAPPERS)
    feeder.bootstrap()
    feeder.run()
