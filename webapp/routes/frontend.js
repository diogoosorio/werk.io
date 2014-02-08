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


    app.post('/job/:id/vote', function(req, res) {
        var is_array = function(array) {
            return (array !== undefined) &&
                   Object.prototype.toString.call(array) === '[object Array]';
        };

        var job_id      = req.params.id,
            vote_cookie = is_array(req.cookies.votes) ? req.cookies.votes : [],
            can_vote    = vote_cookie.indexOf(job_id) === -1;

        var error = function(message, status_code) {
            status_code = status_code === undefined ? 500 : status_code;
            return res.json(status_code, {success: false, error: message});
        };

        var success = function(job) {
            vote_cookie.push(job._id);
            res.cookie("votes", vote_cookie, {httpOnly: true});
            return res.json(200, {success: true, error: null, votes: job.votes});
        };

        if (!can_vote) {
            return error("You've already voted on this job entry.", 403);
        }
        
        Models.Job.findByIdAndUpdate(job_id, {$inc: {votes: 1}}, function(err, job) {
            if (err !== null) {
                return error(err.message);
            }

            if (job === null) {
                return error("Invalid job ID");
            }

            return success(job);
        });
    });
};
