angular.module('JobService', []).factory('Job', ['http', function(http) {
    return {
        get: function() {
            return http.get('/api/jobs');
        }
    };
}]);
