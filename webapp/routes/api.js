// api endpoints
module.exports = function(app) {
    app.get('/api/test', function(req, res) {
        var response = {a: 'b', c: 'd'};
        res.json(response);
    });
};
