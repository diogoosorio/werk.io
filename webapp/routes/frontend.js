// Frontend routes

var models   = require('../lib/models');
var pagesize = 20;

module.exports = function(app) {

    app.get('/', function(req, res) {
        var page = req.query.page !== undefined ? parseInt(req.query.page) : 1,
            render = function(err, jobs) {
                var ordered_jobs = {},
                    date, job, key;

                for (key in jobs) {
                    job  = jobs[key];
                    date = job.publish_date;

                    if (ordered_jobs[date.getTime()] === undefined) {
                        ordered_jobs[date.getTime()] = {date: date, entries: []};
                    }

                    ordered_jobs[date.getTime()].entries.push(job);
                }

                res.render('index.html', {jobs: ordered_jobs});
            };

        models.Job.find({is_consultancy: false})
            .limit(pagesize)
            .skip((page - 1) * pagesize)
            .sort('-publish_date')
            .exec(render);
    });

};
