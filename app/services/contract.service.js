;(function () {
    'use strict';

    angular
        .module('service.contractService', [])
        .service('contractService', contractService);

    contractService.$inject = ['http', 'url'];

    function contractService(http, url) {
        let model = {};


        // ContractResearch
        model.createNewResearch = createNewResearch;
        model.removeResearch = removeResearch;

        // ContractTemplates
        model.createTemplate = createTemplate;
        model.updateTemplate = updateTemplate;
        model.removeTemplate = removeTemplate;
        model.loadOneTemplate = loadOneTemplate;
        model.loadTemplateList = loadTemplateList;
        model.loadTemplatesForThePoll = loadTemplatesForThePoll;
        model.loadAllTemplates = loadAllTemplates;

        // UserVariability
        model.createVariability = createVariability;
        model.editVariability = editVariability;
        model.removeVariability = removeVariability;
        model.getVariability = getVariability;
        model.getVariabilityWithDeleted = getVariabilityWithDeleted;

        //Image
        model.uploadImage = uploadImage;
        model.imageListInResearch = imageListInResearch;
        model.deleteImage = deleteImage;

        return model;

        // ContractResearch
        function createNewResearch() {
            return http.post(url.contract_research_func().createResearch);
        }
        function removeResearch(id) {
            return http.delete(url.contract_research_func(id).deleteResearch);
        }

        // ContractTemplates
        function createTemplate(id, data) {
            return http.post(url.contract_editor_func(id).createSurveyTemplate, data);
        }

        function updateTemplate(id, data) {
            return http.put(url.contract_editor_func(id).updateTemplate, data);
        }

        function removeTemplate(id) {
            return http.delete(url.contract_editor_func(id).deleteTemplate);
        }

        function loadOneTemplate(id) {
            return http.get(url.contract_editor_func(id).getOneTemplate);
        }

        function loadTemplateList() {
            return http.get(url.contract_editor_func().getTemplateList);
        }

        function loadTemplatesForThePoll(id) {
            return http.get(url.contract_editor_func(id).getTemplatesForThePool);
        }

        function loadAllTemplates() {
            return http.get(url.contract_editor_func().getTemplates);
        }

        // UserVariability
        function createVariability(data) {
            return http.post(url.contract_editor_func().createVariability, data);
        }

        function editVariability(id, data) {
            return http.put(url.contract_editor_func(id).editVariability, data);
        }

        function removeVariability(id) {
            return http.delete(url.contract_editor_func(id).deleteVariability);
        }

        function getVariability() {
            return http.get(url.contract_editor_func().getVariability);
        }

        function getVariabilityWithDeleted() {
            return http.get(url.contract_editor_func().getVariabilityWithDeleted);
        }

        //Image
        function uploadImage(id) {
            return url.contract_image_func(id).uploadImage;
        }
        function imageListInResearch(id) {
            return http.get(url.contract_image_func(id).imageListInResearch);
        }
        function deleteImage(id) {
            return http.delete(url.contract_image_func(id).deleteImage);
        }
    }
})();