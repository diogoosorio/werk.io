// Frontend routes

var Models    = require('../lib/models');
var Paginator = require('paginator');
var pagesize  = 20;

module.exports = function(app) {

    app.get('/', function(req, res) {
        var page = req.query.page !== undefined && !isNaN(parseInt(req.query.page)) ? parseInt(req.query.page) : 1,
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

                var paginator = new Paginator(pagesize, 5),
                    pagination = paginator.build(count, page);

                res.render('index.html', {jobs: ordered_jobs, pagination: pagination});
            };

        Models.Job.find({is_consultancy: false})
            .limit(pagesize)
            .skip((page - 1) * pagesize)
            .sort('-publish_date')
            .exec(function(err, jobs) {
                Models.Job.count({is_consultancy: false})
                    .exec(function(err, count) {
                        return render(err, jobs, count);
                    });
             });
    });


    app.get('/about', function(req, res) {
        res.render('about.html');
    });
};
