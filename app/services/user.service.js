;(function () {
    'use strict';

    angular
        .module('service.userService', [])
        .service('userService', userService);

    userService.$inject = ['http', 'url', '$localStorage', '$sessionStorage'];

    function userService(http, url, $localStorage, $sessionStorage) {

        let model = {};
        model.login = login;
        model.getToken = getToken;
        model.setToken = setToken;
        model.loadUser = loadUser;
        model.getUser = getUser;

        model.registration = registration;
        model.forgot = forgot;
        model.reset = reset;
        model.updateInfo = updateInfo;
        model.updatePass = updatePass;
        model.loadSurveysOnly = loadSurveysOnly;
        model.loadCompanySurveys = loadCompanySurveys;
        model.loadItems = loadItems;
        model.setItems = setItems;
        model.getItems = getItems;

        //DownloadContract
        model.getContract = getContract;
        model.removePdf = removePdf;

        //Download package pdf
        model.downloadPackagePDF = downloadPackagePDF;
        model.setPackData = setPackData;

        //Download package pdf
        let chosenTemplates = undefined;
        let customerFromAdd = undefined;


        return model;

        function login(credentials) {
            return http.post(url.user.login, credentials)
        }
        function setToken(token) {
            $localStorage.token = token;
        }
        function getToken() {
            return $localStorage.token;
        }
        function loadUser() {
            return http.get(url.user.loadUser, {}).then(function (res) {
                if (res.success){
                    setUser(res.data.result);
                }
                else {
                    //need to show error msg
                }
            });
        }
        function setUser(user) {
            $localStorage.user = user;
        }
        function getUser() {
            return $localStorage.user;
        }

        function registration(token , data) {
            return http.post(url.create_adm(token).register, data)
        }

        function forgot(data) {
            return http.post(url.user.forgot, data);
        }

        function reset(token , data){
            return http.post(url.reset_func(token).resetPass , data);
        }

        function updateInfo(id , dataInfo) {
            return http.post(url.user_func(id).updateProfile , dataInfo);
        }

        function updatePass(id , data) {
            return http.post(url.user_func(id).updateProfile , data);
        }


        function loadSurveysOnly() {
            return http.get(url.survey_management_func().loadOnlySurvey);
        }

        function loadCompanySurveys(id) {
            return http.get(url.company_func(id).companySurveys);
        }

        function loadItems() {
            return http.get(url.user.getItems, {}).then(function (res) {
                if (res.success) {
                    setItems(res.data);
                } else {
                    //need to show error msg
                }
            });
        }
        function setItems(items) {
            delete $sessionStorage['user_items'];
            $sessionStorage['user_items'] = items;
        }
        function getItems() {
            return $sessionStorage['user_items'];
        }

        //DownloadContract
        function getContract(idReport, idContract, filename) {
            return http.get(url.contract_download_func(idReport, idContract, filename).downloadPDF);
        }
        function removePdf(idReport) {
            return http.delete(url.contract_download_func(idReport).removePDF);
        }

        function downloadPackagePDF(customers) {
            console.log('customers',customers);
            console.log('chosenTemplates',chosenTemplates);
            console.log('customerFromAdd',customerFromAdd);
            if(!(customers.length && customerFromAdd && chosenTemplates)){
                console.log('No files for batch printing');
            } else {
                let reports;
               for(let customerNumber in customers){
                   if(customers[customerNumber].id === customerFromAdd.id){
                       console.log(customers[customerNumber].reports);
                       reports = customers[customerNumber].reports;
                       break
                   } else {
                       console.log('user does not exist');
                   }
               }
               for (let item in reports){
                   for (let templateNumber in chosenTemplates){
                       if(chosenTemplates[templateNumber].survey_id === reports[item].survey_id){
                           let filename = customerFromAdd.name + '_' + customerFromAdd.name + '_'
                               + chosenTemplates[templateNumber].template_title + '_' + new Date().getTime();
                           filename = filename.split(' ').join('_');
                           console.log(filename);
                           OfferDownloadOnePDF(reports[item].id, chosenTemplates[templateNumber].template_id , filename);
                       }
                   }
               }
            }
            chosenTemplates = undefined;
            customerFromAdd = undefined;
        }

        function setPackData(TemplatesArr, customerArr) {
            chosenTemplates = TemplatesArr;
            customerFromAdd = customerArr;
        }

        function OfferDownloadOnePDF(reportId, templateId, filename) {
            getContract(reportId, templateId, filename).then(function (links) {
                let link = links.filePathUrlPdf;
                if ((navigator.userAgent.search(/Chrome/) > -1) || (navigator.userAgent.search(/Safari/) > -1)) {
                    //Creating new link node.
                    let downloadPDF = document.createElement('a');
                    downloadPDF.href = link;

                    if (downloadPDF.download !== undefined){
                        //Set HTML5 download attribute. This will prevent file from opening if supported.
                        downloadPDF.download = filename;
                    }

                    //Dispatching click event.
                    if (document.createEvent) {
                        let e = document.createEvent('MouseEvents');
                        e.initEvent('click' ,true ,true);
                        downloadPDF.dispatchEvent(e);
                        return true;
                    }
                }
                else {
                    let query = '?download';

                    window.open(link + query, '_self');
                }
            });
        }


    }
})();