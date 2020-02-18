// ============================================================+
// File name    : OneRom.js
// Description  : Administrador de objetos html 
// Author       : Angel Paredes
// Begin        : agosto 2019
// Last Update  : 17 febrero 2020
// ============================================================+


//------------------------Navegacion Ajax ---------------------------------
window.onpopstate = function (event) {
    window.NavigationState = true;
    Door = event.state.Dom;
    sessionStorage.setItem("Dom", JSON.stringify(Door));
    var ParametrosUrl = new URLSearchParams(location.search);
    var Argum = [];
    var ArgumCheck = [];

    for (var key of ParametrosUrl.keys()) {
        if (key != "F" && key != "_f" && key != "M" && !ArgumCheck.includes(key)) {
            ArgumCheck.push(key);
            var parametro = ParametrosUrl.getAll(key);
            if (parametro.length > 1)
                Argum.push(parametro);
            else
                Argum.push(parametro[0]);

        }
    }

    window[event.state.Metodo].apply(null, Argum);
    Restart();
};

function ActivaNavegacionAjax(PaginaInicio) {
    if (window.NavigationState == undefined) {
        window.NavigationState = false;
    }
    var ParametrosUrl = new URLSearchParams(location.search);
    var Metodo = ParametrosUrl.get("M");

    var Argum = [];
    var ArgumCheck = [];

    for (var key of ParametrosUrl.keys()) {
        if (key != "F" && key != "_f" && key != "M" && !ArgumCheck.includes(key)) {
            ArgumCheck.push(key);
            var parametro = ParametrosUrl.getAll(key);
            if (parametro.length > 1)
                Argum.push(parametro);
            else
                Argum.push(parametro[0]);

        }
    }

    if (Metodo) {
        Door = JSON.parse(sessionStorage.getItem("Dom"));
        NavigationState = true;
        window[Metodo].apply(null, Argum);
    } else {
        window[PaginaInicio].apply(null, Argum);
    }
    Restart();
}

function CargarPaginaNavegacionAjax(Dom, ParamUrl, EsInicio = false) {
    sessionStorage.setItem("Dom", JSON.stringify(Dom));
    var ParametrosUrl = new URLSearchParams(ParamUrl);
    var Metodo = ParametrosUrl.get("M");
    if (!NavigationState) {
        if (EsInicio) {
            history.replaceState({"Dom": Dom, "Metodo": Metodo}, "Pagina" + Metodo, ParamUrl);
        } else {
            history.pushState({"Dom": Dom, "Metodo": Metodo}, "Pagina" + Metodo, ParamUrl);
        }
    }
    NavigationState = false;
}

//function Send(URL,Door, NewTab = false) {
//    var url = "";
//    if (URL.includes("?")) {
//        url = URL + "&Door=" + JSON.stringify(Door);
//    } else {
//        url = URL + "?Door=" + JSON.stringify(Door);
//    }
//    if (NewTab) {
//        window.open(url, '_blank');
//    } else {
//        window.location = url;
//}
//
//}

AjaxFailServidor = function (event) {
    if (Debug) {
        console.log(event);
    }
};

AjaxStartServidor = function () {
    if (Debug) {
        console.log("Inicia POST/GET");
    }
};

AjaxFinallyServidor=function (){
    if (Debug) {
        console.log("Finaliso POST/GET");
    }
    
}

/**
 * Ajax
 * @param Url :  Url POST/GET
 * @param Data :  FormData con los objetos a enviar 
 * @param Success :  Metodo de respuesto 
 * @param Metod :  Tipo de envio (POST/GET) default POST
 * @param RetrivalJson :  Objeto respuesta es JSON por default
 **/
function Ajax(Url, Data, Success, Metod = "POST", RetrivalJson = true) {
    /**
     * Progreso
     * Se ejecuta mientra se esta enviando informacion
     * 
     * Metodo personalizable
     * 
     * var Call = Ajax();
     * Call.UpdateProgress = function (e) {
     *
     *              if (e.lengthComputable) {
     *                  alert("Inicio subida");
     *              }                                            
     *          }
     * 
     **/
    this.UpdateProgress = function (evt) {
        if (evt.lengthComputable && Debug) {
            var percentComplete = evt.loaded / evt.total;
            console.log("Se a tranferido " + percentComplete);
        }
    };
    /**
     * Completado
     * Se ejecuta al terminar el envio de informacion
     * 
     * Metodo personalizable
     * 
     * var Call = Ajax();
     * Call.TransferComplete=function (e){
     *              alert("Se transfirio toda la informacion");
     *          }
     * 
     **/
    this.TransferComplete = function (event) {
        if (Debug) {
            console.log("La transferencia se completo.");
        }
    };
    /**
     * Fallado
     * Se ejecuta al fallar el envio de informacion
     * 
     * Metodo personalizable
     * 
     * var Call = Ajax();
     * Call.TransferFailed=function (e){
     *              alert("Fallo la subida de informacion");
     *          }
     * 
     **/
    this.TransferFailed = function (event) {
        if (Debug) {
            console.log("Ocurrio un error al tranferir la informacion.");
        }
    };
    /**
     * Cancelado
     * Se ejecuta al cancelar el envio de informacion
     * 
     * Metodo personalizable
     * 
     * var Call = Ajax();
     * Call.TransferCanceled=function (e){
     *              alert("Se cancelo la subida de informacion")
     *          }
     * 
     **/
    this.TransferCanceled = function (event) {
        if (Debug) {
            console.log("se cancelo la tranferencia de informacion.");
        }
    };


    var Request = new XMLHttpRequest();

    Request.open(Metod.toUpperCase(), Url, true);

    /**
     * Send
     * POST/GET a la url introducida
     **/
    this.Send = function () {
        
        AjaxStartServidor();
        
        Request.addEventListener("progress", this.UpdateProgress, false);
        Request.addEventListener("load", this.TransferComplete, false);
        Request.addEventListener("error", this.TransferFailed, false);
        Request.addEventListener("abort", this.TransferCanceled, false);

        if (Data != null) {
            Request.send(Data);
        } else {
            Request.send();
        }


        Request.onreadystatechange = function (event) {
            if (Request.readyState == 4) {
                if (Request.status == 200) {

                    var result = null;

                    try {
                        result = JSON.parse(Request.response);
                        Success(result);
                    } catch (e) {
                        if (!e.message.includes("JSON.parse")) {
                            AjaxFailServidor(e.message);
                        } else if (!RetrivalJson) {
                            Success(Request.response);
                        } else {
                            AjaxFailServidor(Request.response);
                        }

                    }
                    AjaxFinallyServidor();

                } else {
                    AjaxFailServidor("Fallo el servidor intente mas tarde");
                    AjaxFinallyServidor();
                }
            }
            
            


        }




    };

}

//----------------------Hilo verificador de elementos nuevos---------------
(function (win) {
    'use strict';

    var listeners = [],
            doc = win.document,
            MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
            observer;

    function ReadyRom(selector, fn) {
        // Store the selector and callback to be monitored
        listeners.push({
            selector: selector,
            fn: fn
        });
        if (!observer) {
            // Watch for changes in the document
            observer = new MutationObserver(check);
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true
            });
        }
        // Check if the element is currently in the DOM
        check();
    }

    function check() {
        // Check the DOM for elements matching a stored selector
        for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
            listener = listeners[i];
            // Query for elements matching the specified selector
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                element = elements[j];
                // Make sure the callback isn't invoked with the 
                // same element more than once
                if (!element.selectores) {
                    element.selectores = [];
                }
                if (!element.selectores.includes(listener.selector)) {
                    element.ready = true;
                    element.selectores.push(listener.selector);
                    // Invoke the callback with the element
                    listener.fn.call(element, element);
                }
            }
        }
    }

    // Expose `ready`
    win.ReadyRom = ReadyRom;

})(this);

//------------------------heart core---------------------------------------
var Door = {};

var Debug = false;
var SingleGetControls = false;
var MultiGetControls = false;

function Restart() {

    var Controles = document.querySelectorAll("[x-value]");


    for (let item of Controles) {

        if (item.ready !== undefined) {
            continue;
        }
        if (item.type == "file") {
            item.changeFile = new ChangeFile(item);
        }
        item.change = item.onchange;
        item.onchange = null;
        item.onchange = function () {
            toObject(Door, item.getAttribute("x-value"), item.value);
            if (Debug) {
                console.log(Door);
            }
            if (item.type == "file") {
                item.changeFile.run(item);
            }
            if (item.change != null) {
                eval(item.change);
                item.change();
            }
            return false;
        };

        toObject(Door, item.getAttribute("x-value"), item.value);
        if (Debug) {
            console.log(Door);
        }

        item.selectores = [];
        item.selectores.push("[x-value]");
    }

}

ReadyRom("[x-value]", function () {
    if (this.type == "file") {
        this.changeFile = new ChangeFile(this);
    }
    this.change = this.onchange;
    this.onchange = null;
    this.onchange = function () {
        toObject(Door, this.getAttribute("x-value"), this.value);

        if (Debug) {
            console.log(Door);
        }
        if (this.type == "file") {
            this.changeFile.run(this);
        }
        if (this.change != null) {
            eval(this.change);
            this.change();
        }
        return false;
    };

    toObject(Door, this.getAttribute("x-value"), this.value);
    if (Debug) {
        console.log(Door);
    }
});

function toObject(objeto, propiedad, valor, nombreControl = "") {

    key = "";
    if (nombreControl == "") {
        nombreControl = propiedad;
    }
    var arryProp = propiedad.split(".");
    if (arryProp[0] == "") {
        if (!nombreControl || nombreControl == undefined || nombreControl == "" || nombreControl.length == 0) {
            return true;
        }
        var Control = document.querySelector("[x-value='" + nombreControl + "']");

        if (Control.type == "file") {
            return Control.files;
        }
        if (Control.type == "checkbox") {
            return Control.checked;
        }
        if (Control.localName == "select" && Control.multiple) {

            var Select = [];
            for (var opcion of Control.selectedOptions) {
                Select.push(opcion.value);
            }
            return Select;
        }
        return valor;
    }
    var nombreProp = arryProp[0];
    arryProp.shift();
    if (nombreProp.includes("[")) {
        //Pa arreglos
        window.key = nombreProp.split("[")[1];
        key = key.split("]")[0];
        nombreProp = nombreProp.split("[")[0];
        //Propiedades no definidas
        if (objeto[nombreProp] == undefined) {

            objeto[nombreProp] = [];
        }

        if (objeto[nombreProp][key] == undefined) {
            objeto[nombreProp][key] = {};
        }

        //Propiedades definidas
        if (arryProp.length == 0) {
            objeto[nombreProp][key] = "";
            return objeto[nombreProp][key] = toObject(objeto[nombreProp][key], arryProp.join("."), valor, nombreControl);
        } else {
            return  toObject(objeto[nombreProp][key], arryProp.join("."), valor, nombreControl);
        }

    } else {
        //Pa propiedades
        //Propiedades no definidas
        if (objeto[nombreProp] == undefined) {
            if (arryProp.length == 0) {
                objeto[nombreProp] = "";
                var _PropiedadPrivada = "";
                var _PropiedadPrivada1 = null;
                Object.defineProperty(objeto, nombreProp, {get: function () {
                        if (!SingleGetControls && !MultiGetControls) {
                            return _PropiedadPrivada;
                        } else {
                            SingleGetControls = false;
                            return _PropiedadPrivada1;
                        }

                    },
                    set: function (value) {
                        _PropiedadPrivada = value;

                        var Control = document.querySelector("[x-value='" + nombreControl + "']");

                        _PropiedadPrivada1 = Control;

                        if (Control.localName == "select" && Control.multiple && Array.isArray(value)) {

                            for (var i = 0; i < Control.options.length; i++) {
                                Control.options[i].selected = value.indexOf(Control.options[i].value) >= 0;
                            }

                        } else if (Control.type != "file") {
                            Control.value = value;
                        }




                        //Maquetar();
                    }
                })
                //return objeto[nombreProp] = toObject(objeto[nombreProp], arryProp.join("."), valor, nombreControl);
            } else {
                objeto[nombreProp] = {};
            }
        }

        //Propiedades definidas
        if (arryProp.length == 0) {
            objeto[nombreProp] = "";
            return objeto[nombreProp] = toObject(objeto[nombreProp], arryProp.join("."), valor, nombreControl);
        } else {
            return  toObject(objeto[nombreProp], arryProp.join("."), valor, nombreControl);
        }


}


}

