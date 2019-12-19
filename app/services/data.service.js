;(function () {
    'use strict';

    angular
        .module('service.dataService', [])
        .service('dataService', dataService);

    dataService.$inject = ['http', 'url'];

    function dataService(http, url) {
        let model = {};

        // model.loadSurveyOnly = loadSurveyOnly;
        // model.setSurveyOnly = setSurveyOnly;
        // model.getSurveyOnly = getSurveyOnly;
        // model.loadUser = loadUser;
        // model.setUser = setUser;
        // model.loadSurveyOnly = loadSurveyOnly;
        //
        //
        // return model;
        //
        // function loadSurveyOnly() {
        //     return http.get(url.survey_management_func().loadOnlySurvey, {}).then(function (res) {
        //         if(res.success){
        //             setSurveyOnly(res.data.result);
        //             return res;
        //         }
        //     });
        // }
        // function setSurveyOnly(data) {
        //     delete $sessionStorage['survey_only'];
        //     $sessionStorage['survey_only'] = data;
        // }
        // function getSurveyOnly() {
        //     return $sessionStorage['survey_only'];
        // }
        //
        //
        // function loadUser() {
        //     return http.get(url.user.loadUser, {}).then(function (res) {
        //         if (res.success){
        //             setUser(res.data.result);
        //             return res.data.result;
        //         }
        //     })
        // }
        // function setUser(user) {
        //     $localStorage.user = user;
        // }
        // function getUser() {
        //     return $localStorage.user;
        // }

    }
})();