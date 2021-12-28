// ============================================================+
// File name    : OneRom.js
// Description  : Administrador de objetos html 
// Author       : Angel Paredes
// Begin        : agosto 2019
// Last Update  : 28 12 2021
// ============================================================+


//------------------------Navegacion Ajax ---------------------------------
window.onpopstate = function (event) {
    window.NavigationState = true;
    Door = event.state.Door;
    sessionStorage.setItem("Door", JSON.stringify(Door));
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

    if (Metodo != PaginaInicio && Metodo != null) {
        Door = JSON.parse(sessionStorage.getItem("Door"));
        NavigationState = true;
        window[Metodo].apply(null, Argum);
    } else {
        window[PaginaInicio].apply(null, Argum);
    }
    Restart();
}

function CargarPaginaNavegacionAjax(Door, ParamUrl, EsInicio = false) {
    sessionStorage.setItem("Door", JSON.stringify(Door));
    var ParametrosUrl = new URLSearchParams(ParamUrl);
    var Metodo = ParametrosUrl.get("M");
    if (!NavigationState) {
        if (EsInicio) {
            history.replaceState({"Door": Door, "Metodo": Metodo}, "Pagina" + Metodo, ParamUrl);
        } else {
            history.pushState({"Door": Door, "Metodo": Metodo}, "Pagina" + Metodo, ParamUrl);
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
AjaxFinallyServidor = function () {
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

                    } catch (e) {
                        AjaxFailServidor(Request.response);
                        result = Request.response;
                    }
                    try {
                        Success(result);
                    } catch (e) {
                        AjaxFailServidor(e.message);
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
        // Check if the element is currently in the Door
        check();
    }

    function check() {
// Check the Door for elements matching a stored selector
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

        if (item.Leido) {
            continue;
        }

        item.change = item.onchange;
        item.onchange = null;
        item.onchange = function () {
            toObject(Door, item.getAttribute("x-value"), item.value);
            if (Debug) {
                console.log(Door);
            }

            if (item.change != null) {
                eval(item.change);
                item.change();
            }
            return false;
        };
        toObject(Door, item.getAttribute("x-value"), item.value);
        item.Leido = true;
        if (Debug) {
            console.log(Door);
        }

        item.selectores = [];
        item.selectores.push("[x-value]");
    }

}

ReadyRom("[x-value]", function () {

    this.change = this.onchange;
    this.onchange = null;
    this.onchange = function () {
        toObject(Door, this.getAttribute("x-value"), this.value);
        if (Debug) {
            console.log(Door);
        }

        if (this.change != null) {
            eval(this.change);
            this.change();
        }
        return false;
    };
    toObject(Door, this.getAttribute("x-value"), this.value);
    this.Leido = true;
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
        var Controles = document.querySelectorAll("[x-value='" + nombreControl + "']");
        if (Controles[0].type == "file") {
            return Controles[0].files;
        }
        if (Controles[0].type == "radio") {
            for (var Control of Controles) {
                if (Control.checked) {
                    return Control.value;
                }
            }

        }
        if (Controles[0].type == "checkbox") {
            return Controles[0].checked;
        }
        if (Controles[0].localName == "select" && Controles[0].multiple) {

            var Select = [];
            for (var opcion of Controles[0].selectedOptions) {
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
                        var Controles = document.querySelectorAll("[x-value='" + nombreControl + "']");
                        if (Controles.length > 1) {
                            _PropiedadPrivada1 = Controles;
                        } else {
                            _PropiedadPrivada1 = Controles[0];
                        }

                        if (Controles.length == 0) {
                            if (Debug) {
                                console.error("Control " + nombreControl + " no existe o fue eliminado");
                            }
                        } else if (Controles[0].localName == "select" && Controles[0].multiple) {

                            if (Array.isArray(value)) {
                                for (var i = 0; i < Controles[0].options.length; i++) {
                                    Controles[0].options[i].selected = value.indexOf(Controles[0].options[i].value) >= 0;
                                }
                            } else if (value != "") {
                                Controles[0].value = value;
                            }


                        } else if (Controles[0].type == "radio") {
                            for (let Control of Controles) {
                                if (Control.value == value) {
                                    Control.checked = true;
                                }

//                                Control.value=value;
                            }
                        } else if (Controles[0].type != "file") {
                            Controles[0].value = value;
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

//---------------------------Helpers------------------------------
function HInput(name, value, title, required, objectsHtml = {}) {

    var Id = name;      
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml.type="text";
    objectsHtml["x-value"] = name;
    objectsHtml.value = value;
    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name});


    var Input = new Container("", "input", objectsHtml);

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Input);
    Div.Content.push(validacion);

    return Div;

}

function HTextArea(name, value, title, required, objectsHtml = {}) {

    var Id = name;
    
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;
    objectsHtml.value = value;
    
    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name});


    var Area = new Container(value, "textarea", objectsHtml);

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Area);
    Div.Content.push(validacion);

    return Div;

}

function HNumeric(name, value, title, required, objectsHtml = {}) {

    var Id = name;
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;
    objectsHtml.value = value;
    objectsHtml.type = "number";

    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name});


    var Numeric = new Container("", "input", objectsHtml);

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Numeric);
    Div.Content.push(validacion);

    return Div;

}

function HLink(name, value, objectsHtml = {}, icon = "") {    
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;
    if (objectsHtml.style == undefined) {
        objectsHtml.style = 'cursor: pointer;';
    } else {
        objectsHtml.style = 'cursor: pointer;' + objectsHtml.style;
    }


    var Link = new Container(value, "a", objectsHtml);
    Link.Content = [];
    Link.Content.push(new Container("", "span", {"class": icon}));
    Link.Content.push(value);

    return Link;
}

function HComboBox(name, value, title, required, arrayCombox, objectsHtml = {}) {
    var Id = name;       
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;
    objectsHtml.value = value;
    
    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name});

    var ComboBox = new Container("", "select", objectsHtml);
    ComboBox.Content = [];
    for (var elemento in arrayCombox) {
        if (Array.isArray(value)) {
            if (value.includes(arrayCombox[elemento].Valor)) {
                ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", {"selected": "", "value": arrayCombox[elemento].Valor}));
            } else {
                ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", {"value": arrayCombox[elemento].Valor}));
            }
        } else {
            if (arrayCombox[elemento].Valor == value) {
                ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", {"selected": "", "value": arrayCombox[elemento].Valor}));
            } else {
                ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", {"value": arrayCombox[elemento].Valor}));
            }
        }
    }


    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(ComboBox);
    Div.Content.push(validacion);
    return Div;
}

function HCalendar(name, value, title, required, objectsHtml = {}) {

    var Id = name;
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;
    objectsHtml.value = value;
    objectsHtml.type = "date";    

    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name});


    var Calendar = new Container("", "input", objectsHtml);

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Calendar);
    Div.Content.push(validacion);

    return Div;
}

function HHours(name, value, title, required, objectsHtml = {}) {

    var Id = name;
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;
    objectsHtml.value = value;
    objectsHtml.type = "time";

    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label");


    var Calendar = new Container("", "input", objectsHtml);

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Calendar);
    Div.Content.push(validacion);

    return Div;
}

function HButton(name, type, value, objectsHtml = {}, icon = "") {
    
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;    
    objectsHtml.type = type;

    var Button = new Container(value, "button", objectsHtml);
    Button.Content = [];
    Button.Content.push(new Container("", "span", {"class": icon}));
    Button.Content.push(value);

    return Button;

}

function HRadioButon(name, value, title, required, arrayCombox, objectsHtml = {}) {
    var Id = name;
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    
    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name});

    var Input = new Container([], "div", {"style": "display: block ruby;"});

    for (var item of arrayCombox) {
        var DivRadio = new Container([], "div", {"style": "margin-right:5px"});
        var ObjectsHtmlRadio = {};
        ObjectsHtmlRadio = Object.assign({}, objectsHtml);
        
        ObjectsHtmlRadio.name = name;
        ObjectsHtmlRadio["x-value"] = name;
        ObjectsHtmlRadio.value = item.Valor;
        ObjectsHtmlRadio.type = "radio";
        

        ObjectsHtmlRadio.id = ObjectsHtmlRadio.id + "Option" + arrayCombox.indexOf(item);
        if (value == item.Valor) {
            ObjectsHtmlRadio.checked = "";
        }
        var InputRadio = new Container("", "input", ObjectsHtmlRadio);
        var LabelRadio = new Container(item.Texto, "label", {"class": "", "for": ObjectsHtmlRadio.id})
        DivRadio.Content.push(InputRadio);
        DivRadio.Content.push(LabelRadio);
        Input.Content.push(DivRadio);
//        ObjectsHtmlRadio = undefined;
    }



    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Input);
    Div.Content.push(validacion);

    return Div;
}

function HFile(name, title, required, objectsHtml = {}) {
    var Id = name;

    if (objectsHtml["class"] == undefined) {
        objectsHtml["class"] = "inputfile";
    } else {
        objectsHtml["class"] = "inputfile" + " " + objectsHtml["class"];
    }
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml["x-value"] = name;

    objectsHtml.type = "file";

    objectsHtml["data-multiple-caption"] = "{count} archivos seleccionados";

    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label");

    objectsHtml["x-value"] = name;

    if (objectsHtml.style == undefined) {
        objectsHtml.style = "width: 0.1px!important;height: 0.1px!important;opacity: 0;overflow: hidden;position: absolute;";
    } else {
        objectsHtml.style += "width: 0.1px!important;height: 0.1px!important;opacity: 0;overflow: hidden;position: absolute;";
    }

    if (objectsHtml.onchange == undefined) {

        objectsHtml.onchange = "HChangeFile(this);";
    } else {
        objectsHtml.onchange += "HChangeFile(this);";

    }


    var File =  new Container("", "input", objectsHtml);
    var Boton = new Container('<div class="icon-file"> </div><span>Subir Archivo</span>', "label", {"for": Id, "class":objectsHtml.class});

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(File);
    Div.Content.push(Boton);
    Div.Content.push(validacion);





    return Div;
}
function HChangeFile(element) {
    var label = element.nextElementSibling,
            labelVal = label.innerHTML;

    var fileName = '';
    if (element.files && element.files.length > 1)
        fileName = (element.getAttribute('data-multiple-caption') || '').replace('{count}', element.files.length);
    else
        fileName = element.value.split('\\').pop();

    if (fileName)
        label.querySelector('span').innerHTML = fileName;
    else
        label.innerHTML = labelVal;


}

function HCheckBox(name, value, title, required, objectsHtml = null) {

    var Id = name;
    
    if (objectsHtml.id == undefined)
        objectsHtml.id = name;
    if (objectsHtml.name == undefined)
        objectsHtml.name = name;
    objectsHtml.type = "checkbox";
    objectsHtml["x-value"] = name;
    if (value) {
        objectsHtml.checked = "true";
    }

    objectsHtml.name = name;
    objectsHtml["x-value"] = name;

    var CssRequerido=required ? "display: block;width: 100%;border: solid 1px #9acd32;":"display: block;";
    var SimboloRequerido = new Container("", "span", {"style":CssRequerido});
    var validacion = required ? new Container("", "span", {"id": "Validation-" + Id,"style":"color:#c09853"}) : "";
    var Div = new Container("", "");
    var Label = new Container([title, SimboloRequerido], "label", {"for": name,"style":"margin-right:5px"});


    var Input = new Container("", "input", objectsHtml);

    Div.Content = [];
    Div.Content.push(Label);
    Div.Content.push(Input);
    Div.Content.push(validacion);

    return Div;

}

function HTabla(objectsHtml = {},ObjectsHtmlHeader={},ObjectsHtmlBody={}){
    this.DivTabla = new Container([], "table", objectsHtml);
    this.Header = new Container([],"thead",ObjectsHtmlHeader);
    this.Body = new Container([],"tbody",ObjectsHtmlBody);
    this.Encabesados = [];
    this.Filas = [];
    this.Header.Content = this.Encabesados;
    this.Body.Content = this.Filas;
    this.DivTabla.Content.push(this.Header);
    this.DivTabla.Content.push(this.Body);
    this.SetFilaHeader = function (objectsHtmlEncabezado = {}){

        this.Encabesados.push(new Container([], "tr", objectsHtmlEncabezado));
    }
    this.SetCeldaHeader = function (FilaIndex, Contenido, objectsHtmlCelda = {}){

        this.Encabesados[FilaIndex].Content.push(new Container(Contenido, "th", objectsHtmlCelda));
    }
    this.SetFila = function (objectsHtmlEncabezado = {}){

        this.Filas.push(new Container([], "tr", objectsHtmlEncabezado));
    }
    this.SetCelda = function (FilaIndex, Contenido, objectsHtmlCelda = {}){

        this.Filas[FilaIndex].Content.push(new Container(Contenido, "th", objectsHtmlCelda));
    }
    
    
    this.Write = function (Element) {
        this.DivTabla.Write(Element);
    }
    this.Html = function () {

        return this.DivTabla.Html();
}

}

function WriteElement(container) {

    if (container == null || container == undefined) {
        return "";
    }
    if (typeof container !== 'object' && !Array.isArray(container)) {
        return container;
    }
    var Elemento = null;
    if (container.Type != "") {
        Elemento = document.createElement(container.Type);
    } else {
        Elemento = document.createElement("div");

    }

    if (container.objectsHtml) {
        Object.keys(container.objectsHtml).forEach(function (propiedad) {
            Elemento.setAttribute(propiedad, container.objectsHtml[propiedad]);
        })
    }

    if (Array.isArray(container.Content)) {
        for (var item in container.Content) {
            Elemento.innerHTML += WriteElement(container.Content[item]);
        }
    } else
    {
        Elemento.innerHTML = WriteElement(container.Content);
    }
    if (container.Type != "") {
        return Elemento.outerHTML;
    }
    else{
        return Elemento.innerHTML;
    }
}

function Container(Content, Type, objectsHtml = null) {
    this.Content = Content;
    this.Type = Type;
    this.objectsHtml = objectsHtml;
    this.Write = function (Element) {
        var Contenedor = document.querySelector(Element);
        Contenedor.insertAdjacentHTML("beforeend",WriteElement(this));
    }
    this.Html = function () {
        return WriteElement(this).outerHTML;
}
}

function Grid(objectsHtml = {}){    
    this.Div=new Container("","div",objectsHtml);
    this.Filas = []
    this.Div.Content=this.Filas;
    this.SetFila=function(objectsHtmlFila = {}){
        
        this.Filas.push(new Container([],"div",objectsHtmlFila));
    }
    this.SetCelda=function(FilaIndex,Contenido, objectsHtmlCelda = {}){
        
        this.Filas[FilaIndex].Content.push(new Container(Contenido,"div",objectsHtmlCelda));
    }
    this.Write = function (Element) {        
        this.Div.Write(Element);
    }
    this.Html = function () {

        return this.Div.Html();
}
    
}

//-----------------------Metodos utiles-----------------------------------------

function HFocusControl(control) {
    SingleGetControls = true;
    var Control = Door[control];
    if (Control.length != undefined) {
        Control[0].focus();
    } else {
        Control.focus();
    }
}

function HValidacionRequeridos(ClaseInput = "", ClassSpan = "") {
    var ArrayClaseInput = ClaseInput.split(" ");
    var ArrayClassSpan = ClassSpan.split(" ");
    this.validacionesArray = [];
    var Focus = true;
    var Controles = document.querySelectorAll("[x-value]");

    this.Validar = function () {

        for (let Control of Controles) {

            var Span = document.getElementById("Validation-" + Control.id);
            for (var Clase of ArrayClaseInput) {
                if (Clase != "")
                    Control.classList.remove(Clase);
            }
            if (Span) {
                Span.innerHTML = "";

                for (var Clase of ArrayClassSpan) {
                    if (Clase != "")
                        Span.classList.remove(Clase);
                }
            }

        }

        for (let Validacion of this.validacionesArray) {
            if (Focus) {
                HFocusControl(Validacion[0]);
                Focus = false;
            }
            SingleGetControls = true;
            var Control = Door[Validacion[0]] //document.querySelector("[x-value='" + Validacion[0] + "']");
            var Span = document.getElementById("Validation-" + Validacion[0]);
            if (Control && ClaseInput != "") {
                if (Control.length != undefined) {
                    for (var Clase of ArrayClaseInput) {
                        if (Clase != "")
                            Control[0].classList.add(Clase);
                    }
                } else {
                    for (var Clase of ArrayClaseInput) {
                        if (Clase != "")
                            Control.classList.add(Clase);
                    }

                }
            }

            if (Span) {
                Span.innerHTML = Validacion[1];
                for (var Clase of ArrayClassSpan) {
                    if (Clase != "")
                        Span.classList.add(Clase);
                }

            }

        }
    };

}

mensajeinfo = 0;

mensaje3W = 0;

Object.defineProperty(this, "mensajeinfo3W", {get: function () {
        return mensajeinfo;
    },
    set: function (value) {
        var XMensaje = document.getElementById("CerrarTodoMensaje3W");
        if (value == 0) {
            XMensaje.style.display = "none";
        } else if (mensajeinfo == 0 && value == 1) {

            XMensaje.style.display = "block";


        }
        mensajeinfo = value;
    }
})

function QuitarMensaje(Target) {
    var Alerta = document.querySelectorAll(Target);
    if (Alerta.length == 0) {
        return;
    }
    Alerta[0].style.opacity = 1;
    var fadeEffect = setInterval(function () {
        if (Alerta[0].style.opacity > 0) {
            Alerta[0].style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
            Alerta[0].remove();

            var XMensajes = document.querySelectorAll(Target);
            if (XMensajes.length > 0) {
                QuitarMensaje(Target);
            }
        }
    }, 50);
}

function NuevoMensaje(Target,index=0) {
    var Alerta = document.querySelectorAll(Target);
    if (Alerta.length == 0) {
        return;
    }
    Alerta[index].style.opacity = 0;
    var Opacity=0;
    var fadeEffect = setInterval(function () {
        if (Alerta[index].style.opacity < 1) {            
            Alerta[index].style.opacity =Opacity;
            Opacity+= 0.1;
        } else {
            clearInterval(fadeEffect);
            var XMensajes = document.querySelectorAll(Target);
            if (index+1<XMensajes.length) {
                NuevoMensaje(Target,index+1);
            }
        }
    }, 50);
}

function HAlerta(type, message, permanent = false) {


    window.mensaje3W += 1;
    var apuntador = window.mensaje3W;


    var tipoAlerta = 'background-color:#d9edf7';
    var icono = 'icon3W-info';

    if (type == "error") {
        var tipoAlerta = 'background-color:#f2dede';
        var icono = 'icon3W-warning';
    } else if (type == "success") {
        var tipoAlerta = 'background-color:#dff0d8';
        var icono = 'icon3W-checkmark2';

    }


    var XMensaje = document.getElementById("Alerta3W");
    if (XMensaje == null) {
        var div = new Container([], "div", {"id": "Alerta3W", "style": "position: fixed;right: 5px; top: 10px; z-index: 10000;text-align: center;max-height:75%;overflow-x: auto;"});
        div.Content.push(new Container("x", "a", {"class": "", "id": "CerrarTodoMensaje3W", "style": "font-size: 50px;width: 55px;font-weight: 700;opacity: .5;display:none; background-color:red;color:white;border-radius:35px;padding-left:8px;padding-right:8px;padding-bottom:14px;position: absolute;right: 0;cursor: pointer;font-family: sans-serif;", "onclick": "QuitarMensaje('.alert'); window.mensajeinfo3W = 0;"}));
        div.Content.push('<div style="height: 100px;"></div>');
        div.Write("body");
    }


    window.mensajeinfo3W += 1;

    
    var mensaje = new Container([], "div", {"class": "alert", "id": "Mensaje3W" + apuntador, "style": "box-sizing: border-box;width: 100%;display: grid;padding-right: 30px;padding-top: 5px;padding-left: 20px;border-radius: 35px;border-top-right-radius: 0;"+tipoAlerta});



    //mensaje.Content.push("<br>");
    mensaje.Content.push(new Container('<span class="' +  icono + '"></span> <span>' + message + "<span>", "p", {"style": "font-size:30px;overflow-y: auto;margin-top: 30px;opacity: 0.5;margin-right: 50px;"}));
    mensaje.Content.push(new Container("x", "a", {"style": "position: absolute;right: 5px;cursor: pointer;font-size: 60px;font-weight: 700;opacity: .5;box-sizing: border-box;font-family: sans-serif;", "class": "", "onclick": "window.mensajeinfo3W -= 1;QuitarMensaje('#Mensaje3W"+apuntador+"');"}));
    //mensaje.Content.push("<br>");

    mensaje.Write("#Alerta3W");

    
    
    NuevoMensaje("#Mensaje3W" + apuntador);

    if (permanent) {
        return;
    }
    window.setTimeout(function () {
        if (document.getElementById("Mensaje3W" + apuntador) != null) {
            window.mensajeinfo3W -= 1;
        }
        QuitarMensaje("#Mensaje3W" + apuntador);        

    }, 6000);
    
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

Date.prototype.toString = function (Format = "yyyy/mm/dd") {

    var date = new Date(this.valueOf());

    var dia = date.getDate();
    var mes = date.getMonth() + 1;
    var anio = date.getFullYear();

    mes = mes < 10 ? "0" + mes : mes;
    dia = dia < 10 ? "0" + dia : dia;

    var Fecha = Format.replaceAll("yyyy", anio);
    Fecha = Fecha.replaceAll("mm", mes);
    Fecha = Fecha.replaceAll("dd", dia);

    return Fecha;
}