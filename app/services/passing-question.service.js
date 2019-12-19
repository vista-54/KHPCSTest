;(function () {
    'use strict';

    angular
        .module('service.passingQuestionService', [])
        .service('passingQuestionService', passingQuestionService);

    passingQuestionService.$inject = ['http', 'url'];

    function passingQuestionService(http, url) {
        let model = {};

        model.sendCustomerAnswer = sendCustomerAnswer;
        model.getCustomerAnswer = getCustomerAnswer;
        model.createReport = createReport;

        return model;

        function sendCustomerAnswer(id, data) {
            return http.post(url.customers_func(id).sendCustomerAnswer, data);
        }

        function getCustomerAnswer(id) {
            return http.get(url.customers_func(id).getCustomerAnswer, {});
        }

        function createReport(data) {
            return http.post(url.report.createReport, data);
        }
    }
})();