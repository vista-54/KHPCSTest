;(function () {
    'use strict';
    angular.module('app')
        .directive('dotEditMenu', function() {
            return {
                restrict: 'E', // Е -елемент А- атрибут
                templateUrl: 'components/survey-block/dot-menu/dot-edit-menu.html',
            };
        });
})();