var mongoose = require('mongoose');

var JobSchema = new mongoose.Schema({
    body:           String,
    title:          String,
    company:        String,
    source:         String,
    publish_date:   Date,
    location:       String,
    source_id:      String,
    technologies:   [String],
    is_consultancy: Boolean,
    url:            String,
    votes:          Number
});
JobSchema.index({votes: 1, is_consultancy: 1});


module.exports.Job = mongoose.model('Job', JobSchema, 'jobs');
