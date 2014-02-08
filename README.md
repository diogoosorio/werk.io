![werk.io printscreen](https://raw.github.com/diogoosorio/werk.io/master/werk.io.png)

# Werk.IO

A Portuguese based IT job search website, where no consultancy agencies are allowed.

**Live Demo:** http://werk.diogoosorio.com/

The Portuguese IT market is saturated with consultancy agencies. The vast majority have little to none scruples when dealing with guys like me (whose a developer). To find a "real" company that's hiring is a difficult, laborious task, as the major job offer websites are saturated with offers from consultancy agencies.

A couple of weekends ago I've spent a couple of hours writting a scrapper that would extract information of offers that I'd potentially be interested into. When commuting to work, a (not so) brilliant idea cross my mind - what if I wasn't guy with this issue?

The truth is that the job listing websites (for commercial reasons) don't have a real interest in filtering out offers from consultancy agencies (they are the ones who actually pay to have offers published). Last weekend I've decided to write a quick web interface that would answer this specific necessity, **werk.io** as you might have guessed is the final result.

Summary
-------

* [Prerequisites](#prerequisites)
* [Getting started (Ubuntu)](#getting started)
* [How does it work?](#how does it work?)
* [Feeder](#feeder)
* [WebApp](#webapp)
* [Todo](#todo)
* [Licensing](#licensing)


Prerequisites
-------------

* [MongoDB](http://www.mongodb.org)
* [Node.js](http://nodejs.org/) / [npm](https://npmjs.org/)
* [Bower](https://github.com/bower/bower)
* [Python 2.7](http://www.python.org/)


Getting started 
---------------

The following set of instructions were written for Ubuntu ![Ubuntu logo](https://github-camo.global.ssl.fastly.net/24ffd70fd53bced9e23cd0e8957e9bb6da67732f/68747470733a2f2f6c68352e676f6f676c6575736572636f6e74656e742e636f6d2f2d32595331636548577979732f41414141414141414141492f41414141414141414141632f304c43625f747354766d552f7334362d632d6b2f70686f746f2e6a7067):

```bash
# Install some dependencies
sudo apt-get update
sudo apt-get install build-essential python-software-alternatives python-pip
sudo pip install virtualenv

# Install a recent version of node.js / mongodb
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install mongodb-10gen nodejs npm

# Create a virtualenv
mkdir ~/virtualenv
virtualenv ~/virtualenv/werk.io
source ~/virtualenv/werk.io/bin/activate

# Clone the repository
git clone https://github.com/diogoosorio/werk.io

# Install the used python library
pip install -r werk.io/feeder/requirements.txt

# Install the npm modules
npm install werk.io/webapp

# And bower dependencies
bower install werk.io/webapp

# Run the feeder (you'll need to stop it when you think you have enought entries)
python werk.io/feeder/src/feeder.py

# Finally launch the webapp
node werk.io/webapp/app.js
```


How does it work?
-----------------

The application has two main components, a [feeder](#feeder) and an [webapp](#webapp).

It uses big job listing websites, focused on the Portuguese market as a data source. Because of this and looking at the potential target audience for this project, ***Open Source*** the project's codebase seemed the right way to distribute this.

The [**feeder**](#feeder) is responsible for retrieving information from a set of websites (right now only one, really), parsing the information and storing it on a Mongo datastore.

The [**webapp**](#webapp) is an web interface to consult the information in a more... digestable way.


Feeder
------

The **feeder** is a small Python script that crawls a set of websites, retrieves and parses the job information and stores it on da Mongo datastore. It also matches every offer against a blacklist of known consultancy agencies to determine if the offer comes from a consultancy agency, or not.

It also tries to find information about the technologies required for each one of the offers.

Currently the feeder has two different modes:

* If the datastore is empty (it's the first retrieval), it will look for offers until you terminate its execution

* If it finds any record on the store, it'll look for offers that are more recent than the last one inserted on the datastore

This basically meens that you can run it once to fetch the bulk of information and then get it running under [watch](http://ss64.com/bash/watch.html), a cron job or something like that. I'll eventually [turn it into a daemon](#todo), but for the time being, that's it.



WebApp
------

There's also a **Node.js** webapp to help you consume the information retrieved. It's a simple interface built on top of [Sapo Ink](http://ink.sapo.pt) and that uses [express.js](http://expressjs.com/) as an web framework.

I've also used [mongoose.js](http://mongoosejs.com), [nunjucks](http://jlongster.github.io/nunjucks/), [moment.js](http://momentjs.com/) and [paginator](https://github.com/deoxxa/paginator).

Nice features like filtering the results by technology, location and salary range are on [my bucketlist](#todo).



Todo
----

### Feeder

* Review the quick'n'dirty parsing mechanism and make it more efficient
* Add a couple of more data sources to the feeder
* Turn it into a daemon


### Webapp

* Test this on other browsers besides Chrome
* Test this on other devices besides my PC
* Have another go with Angular.js. Hypster all the things...
* Add a filter by technology
* Add a filter by location
* Add a filter by salary range
* First/last pagination links or never-ending scroll instead of pagination (?)
* OAuth2 and reenforce the voting system logic (this might not be worth it, as I really think I'll be receiving a cease and desist letter if this gains any kind of visibility)
* You tell me... :)


Licensing
---------

The source code is relased under GPLv3. Full license is available [here](https://raw.github.com/diogoosorio/werk.io/master/LICENSE)
