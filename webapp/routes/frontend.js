// Frontend routes

var models   = require('../lib/models');
var pagesize = 20;

module.exports = function(app) {

    app.get('/', function(req, res) {
        var page = req.query.page !== undefined ? parseInt(req.query.page) : 1,
            render = function(err, jobs, count) {
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

                res.render('index.html', {jobs: ordered_jobs, page: page, pages: Math.ceil(count / page)});
            };

        models.Job.find({is_consultancy: false})
            .limit(pagesize)
            .skip((page - 1) * pagesize)
            .sort('-publish_date')
            .exec(function(err, jobs) {
                models.Job.count({is_consultancy: false})
                    .exec(function(err, count) {
                        return render(err, jobs, count);
                    });
             });
    });


    app.get('/about', function(req, res) {
        res.render('about.html');
    });
};
