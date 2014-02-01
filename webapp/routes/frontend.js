// Frontend routes
module.exports = function(app) {
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html');
    });
};
