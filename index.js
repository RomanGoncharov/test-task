var MyForm = (function myForm() {

    var intervalId = null,
    statusFnMapping = {
        error: errorFn,
        success: successFn,
        progress: progressFn
    },
    formFields = [
        {
            name: "fio",
            isValid: validateFio
        },{
            name: "email",
            isValid: validateEmail
        },{
            name: "phone",
            isValid: validatePhone
        }
    ];

    function validate() {
        var isValid = true,
            errorFields = [];
        this.formFields.forEach(function (field) {
            var fieldName = field.name,
                fieldValue = document.getElementById(fieldName).value;
            if (!field.isValid(fieldValue)){
                document.getElementById(fieldName).className = "error";
                errorFields.push(fieldName);
                isValid = false;
            }
        });
        return {isValid: isValid, errorFields: errorFields};
    }

    function getData() {
        var result = {};
        this.formFields.forEach(function (field) {
            var fieldName = field.name;
            result[fieldName] = document.getElementById(fieldName).value;
        });
        return result;
    }

    function setData(data) {
        this.formFields.forEach(function (field) {
            var fieldName = field.name;
            document.getElementById(fieldName).value = data.hasOwnProperty(fieldName) ? data[fieldName] : '';
        });
    }

    function submit() {
        var result = this.validate();
        if (result.isValid){
            document.getElementById('submitButton').disabled = true;
            sendRequest();
        }
    }

    function sendRequest() {
        var request = new XMLHttpRequest(),
            action = document.getElementById("myForm").action;
        request.open("GET", action, true);
        request.onloadend = function() {
            if (this.status === 200) {
                var response = JSON.parse(this.responseText);
                var fn = statusFnMapping[response.status];
                fn && fn(response);
            }
        };
        request.send();
    }

    function errorFn(response) {
       var resultContainer = document.getElementById("resultContainer");
       resultContainer.className = 'error';
       resultContainer.innerHTML = response.reason;
       if (intervalId) {
           clearInterval(intervalId);
           intervalId = null;
       }
    }

    function successFn(response) {
       var resultContainer = document.getElementById("resultContainer");
       resultContainer.className = "success";
       if (intervalId) {
           clearInterval(intervalId);
           intervalId = null;
       }
    }

    function progressFn(response) {
        if (!intervalId){
            document.getElementById("resultContainer").className = "progress";
            intervalId = setInterval(sendRequest, response.timeout);
        }
    }

    function validateFio(value) {
        return (value.split(' ').length === 3);
    }

    function validateEmail(value) {
        return /^\w+([\\.-]?\\w+)*@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$/.test(value);
    }

    function validatePhone(value) {
        var result = value.match(/^\+(7)\((\d{3})\)(\d{3})-(\d{2})-(\d{2})$/);
        if (result){
            var sumDigits = 0,
                sumFn = function(a,b){return a + b;},
                parseIntFn = function(x){return parseInt(x,10);};
            result.slice(1).forEach(function (group) {
                sumDigits += group.split('').map(parseIntFn).reduce(sumFn);
            });
            return sumDigits <= 30;
        }
        return false;
    }

    return {
        formFields: formFields,
        validate: validate,
        getData: getData,
        setData: setData,
        submit: submit
    }
})();
