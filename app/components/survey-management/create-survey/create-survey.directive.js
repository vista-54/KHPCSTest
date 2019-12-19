;(function () {
    'use strict';
    angular.module('app')
        .directive('editSurvey', function () {
            return {
                restrict: 'E', // Е -елемент А- атрибут
                templateUrl: 'components/survey-management/edit-survey/edit-survey.html',
            };
        });
})();