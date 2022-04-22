// ============================================================+
// File name    : OneRom.js
// Description  : Administrador de objetos html 
// Author       : Angel Paredes
// Begin        : agosto 2019
// Last Update  : 22 04 2022
// ============================================================+

var Door = {};
var Debug = false;
var SingleGetControls = false;
var MultiGetControls = false;
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

Room = new function () {
    this.Furniture = [];
    this.FuncionesBinding = [];
    //------------------------Programacion HTML---------------------------------
    if (!Object.prototype.watch) {
        Object.defineProperty(
            Object.prototype,
            "watch", {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function (prop, handler, nombreControl) {
                var old = this[prop];
                var cur = old;
                var _PropiedadPrivada1 = null;
                var getter = function () {

                    if (!SingleGetControls && !MultiGetControls) {
                        return cur;
                    }
                    else if (Array.isArray(cur) && _PropiedadPrivada1 == null) {
                        return cur;
                    }
                    else {
                        SingleGetControls = false;
                        return _PropiedadPrivada1;
                    }
                };
                var setter = function (value) {
                    cur = value;
                    var ArrayNombre = nombreControl.split(".");
                    var UltimoElemto = ArrayNombre[ArrayNombre.length - 1];
                    if (!isNaN(UltimoElemto)) {
                        ArrayNombre.pop();
                        nombre = ArrayNombre.join(".") + "[" + UltimoElemto + "]";
                        nombreControl = nombre;
                    }
                    var Controles = document.querySelectorAll("[x-value='" + nombreControl + "']");
                    if (Controles.length > 1) {
                        _PropiedadPrivada1 = Controles;
                    } else if (Controles.length == 1) {
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
                            Controles[0].setAttribute("value", value);
                            if (Controles[0].value != value && value != "") {
                                Controles[0].value = value
                            }
                        }


                    } else if (Controles[0].type == "radio") {
                        for (let Control of Controles) {
                            if (Control.value == value) {
                                Control.checked = true;
                            }

                            //                                Control.value=value;
                        }
                    }
                    else if (Controles[0].type != "file") {
                        Controles[0].setAttribute("value", value);
                        if (Controles[0].value != value && value != "") {
                            Controles[0].value = value
                        }
                    }

                    old = cur;
                    cur = handler.call(this, prop, old, value, nombreControl);
                    // return cur;
                };


                // can't watch constants
                if (delete this[prop]) {

                    Object.defineProperty(this, prop, {
                        get: getter,
                        set: setter,
                        enumerable: true,
                        configurable: true
                    });
                    this[prop] = old;
                }
            }
        });
    }
    sleep = function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    this.RestartComponents = async function () {
        // asleep();
        //Room.Funciones = [];
        var Controles = document.querySelectorAll("[x-component]");

        for (let item of Controles) {

            RecorrerHijos(item);
        }

        construirPropiedad(Door, "Door");
    }

    function RecorrerHijos(Elemento) {
        EvaluarPropiedades(Elemento);
        for (var Hijo of Elemento.childNodes) {
            this.Node = Hijo;
            if (this.Node.nodeType != Node.TEXT_NODE) {
                RecorrerHijos(this.Node);
            } else {
                ValidarTextContent(this.Node);

            }
        }
    }

    function ValidarTextContent(TextNode) {

        //-----------------------------Programar contenido texto-------------
        var Elemto = TextNode;
        var Expresion = /{{[a-z A-Z 0-9 , . < > ? : ' " { } ; ( )]*}}/g;
        var TextoControMatch = TextNode.textContent.match(Expresion);
        if (TextoControMatch == null) {
            return;
        }
        for (var Sentencia of TextoControMatch) {

            var ArraySplit = TextNode.textContent.split(Sentencia);
            var Codigo = Sentencia.split("{{").join("");
            Codigo = Codigo.split("}}").join("");


            // Codigo = "Elemto.textContent = "+Codigo;
            var CadenaInicio = ArraySplit[0];
            var CadenaFin = ArraySplit[1];
            Codigo = "Elemto.textContent = CadenaInicio+" + Codigo + "+CadenaFin";

            var funcion = function (valor) {
                eval(valor);
            }

            Room.FuncionesBinding.push({ "funcion": funcion, "Codigo": Codigo });
            eval(Codigo);
        }
    }

    function EvaluarPropiedades(Control) {
        if (Control.attributes == undefined) {
            return;
        }
        var ArrayAtributosBorrar = [];
        for (var atributo of Control.attributes) {
            if (atributo.name.includes("[")) {
                //------------------------------Programar atributos-----------------
                var StringSinCorchetes = atributo.name.split("[").join("");
                StringSinCorchetes = StringSinCorchetes.split("]").join("");
                var codigo = ValidaAtributosEspeciales(StringSinCorchetes, atributo.value, Control);

                var Elemto = Control;

                var funcion = function (valor) {
                    eval(valor);
                }
                Room.FuncionesBinding.push({ "funcion": funcion, "Codigo": codigo, "NombreDoor": Elemto.getAttribute("x-value"), "NombrePropiedad": atributo.name });

                eval(codigo);

                ArrayAtributosBorrar.push(atributo.name);

            }
        }
        for (var Atributo of ArrayAtributosBorrar) {
            Control.removeAttribute(Atributo);
        }
    }

    function ValidaAtributosEspeciales(Atributo, Codigo, Control) {
        var NombreAtributo = "";
        if (Atributo.includes("-")) {
            var ArregloCadena = Atributo.split("-");
            NombreAtributo = ArregloCadena[0];
            for (var i = 1; i < ArregloCadena.length; i++) {
                NombreAtributo = NombreAtributo + ArregloCadena[i].charAt(0).toUpperCase() + ArregloCadena[i].slice(1);
            }
        } else {
            NombreAtributo = Atributo;
        }
        var asd = Control.getAttribute("x-value");
        if (NombreAtributo == "value" && Control.getAttribute("x-value")) {
            // NombreAtributo = "var ValorTemporal = "+Codigo+";";     
            // NombreAtributo += "if(ValorTemporal!=Door."+Control.getAttribute("x-value")+")";     
            // NombreAtributo = "Door."+Control.getAttribute("x-value")+"="+Codigo;                                                
            NombreAtributo = "Door." + Control.getAttribute("x-value") + "=" + Codigo;
        }
        else {
            NombreAtributo = "Elemto." + NombreAtributo + " = " + Codigo
        }

        return NombreAtributo;
    }

    String.prototype.includesAll = function (Arreglo) {
        var Cadena = this;
        for (var subCaden of Arreglo) {
            if (Cadena.includes(subCaden)) {
                return true;
            }
        }
        return false;
    };

    function construirPropiedad(objeto, NombreProp) {
        //debugger;
        if (Array.isArray(objeto) && objeto.length > 0) {
            for (var propiedad in objeto) {
                construirPropiedad(objeto[propiedad], NombreProp + "." + propiedad);
            }
        }
        if (typeof objeto === 'object' && objeto !== null && !Array.isArray(objeto)) {
            for (var propiedad in objeto) {
                construirPropiedad(objeto[propiedad], NombreProp + "." + propiedad);
            }
        } else {
            if (Room.Furniture.find(NomPopi => NomPopi == NombreProp)) {
                return;
            }
            Room.Furniture.push(NombreProp);
            var ArrayPropiedad = NombreProp.split(".");
            var NombreObjeto = "";
            var NombrePropiedadFinal = "";
            var NombrePropiedadSinDoor = "";
            NombreObjeto = ArrayPropiedad[0];
            for (var i = 1; i < ArrayPropiedad.length - 1; i++) {
                NombreObjeto = NombreObjeto + "." + ArrayPropiedad[i];
            }
            NombrePropiedadSinDoor = ArrayPropiedad[1];
            for (var i = 2; i < ArrayPropiedad.length; i++) {
                NombrePropiedadSinDoor = NombrePropiedadSinDoor + "." + ArrayPropiedad[i];
            }
            NombrePropiedadFinal = ArrayPropiedad[ArrayPropiedad.length - 1];
            var ejecutable = "var DoorTemp = " + NombreObjeto + ";";
            //        console.log(NombrePropiedadSinDoor);
            eval(ejecutable);
            DoorTemp.watch(NombrePropiedadFinal, function (variable, prop, valor, NombreControl) {
                var ConValue = Room.FuncionesBinding.find(function (Elem) {
                    return Elem.NombreDoor == NombreControl && Elem.NombrePropiedad == "[value]";
                })
                var ListaFunciones = [];
                ListaFunciones = Room.FuncionesBinding;
                if (ConValue) {
                    ListaFunciones = Room.FuncionesBinding.filter(function (Elem) {
                        return Elem.NombrePropiedad != "[value]";
                    })
                }
                var NombreControlSinCorchetes = NombreControl.replace("[", "\\u005B");
                NombreControlSinCorchetes = NombreControlSinCorchetes.replace("]", "\\u005D");
                var ExpresionCualquienCaracter = new RegExp(NombreControlSinCorchetes + "[^0-9 a-z A-Z .]+", 'g');
                var ExpresionFinLinea = new RegExp(NombreControlSinCorchetes + "$", 'g');
                var ExpresionEspacionBlanco = new RegExp(NombreControlSinCorchetes + ' ', 'g');

                ListaFunciones = ListaFunciones.filter(function (Elem) { return Elem.Codigo.match(ExpresionCualquienCaracter) || Elem.Codigo.match(ExpresionFinLinea) || Elem.Codigo.match(ExpresionEspacionBlanco) || Elem.NombreDoor == null })
                ListaFunciones.forEach(function (funcion) {

                    try {
                        funcion.funcion(funcion.Codigo);
                    } catch (e) {
                        console.log("No se pudieron evaluar algunas funciones del Room");
                    }

                });



                return valor;
            }, NombrePropiedadSinDoor);



        }

    }
    window.setTimeout(function () {
        ReadyRom("[x-component]", function () {
            Room.RestartComponents();
        });
    }, 10);

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
        Room.Restart();
    };
    ActivaNavegacionAjax = function (PaginaInicio) {
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
        Room.Restart();
    }

    CargarPaginaNavegacionAjax = function (Door, ParamUrl, EsInicio = false) {
        sessionStorage.setItem("Door", JSON.stringify(Door));
        var ParametrosUrl = new URLSearchParams(ParamUrl);
        var Metodo = ParametrosUrl.get("M");
        if (!NavigationState) {
            if (EsInicio) {
                history.replaceState({ "Door": Door, "Metodo": Metodo }, "Pagina" + Metodo, ParamUrl);
            } else {
                history.pushState({ "Door": Door, "Metodo": Metodo }, "Pagina" + Metodo, ParamUrl);
            }
        }
        NavigationState = false;
    }

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
    Ajax = function (Url, Data, Success, Metod = "POST", RetrivalJson = true) {
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
                            if (RetrivalJson) {
                                AjaxFailServidor(Request.response);
                            }
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


    //------------------------heart core---------------------------------------

    function ConstruirObjetoDoor(Control) {
        Control.change = Control.onchange;
        Control.onchange = null;
        Control.onchange = function (e) {
            toObject(Door, e.target.getAttribute("x-value"), e.target.value);
            if (Debug) {
                console.log(Door);
            }

            if (e.target.change != null) {
                eval(e.target.change);
                e.target.change();
            }
            return false;
        };

        toObject(Door, Control.getAttribute("x-value"), Control.value);
        this.Leido = true;
        window.setTimeout(function () {
            Room.RestartComponents();
        }, 10);
    }

    this.Restart = function () {

        var Controles = document.querySelectorAll("[x-component] [x-value]");
        for (let item of Controles) {

            if (item.ready !== undefined) {
                continue;
            }

            if (item.Leido) {
                continue;
            }
            ConstruirObjetoDoor(item);

            item.Leido = true;
            if (Debug) {
                console.log(Door);
            }

            item.selectores = [];
            item.selectores.push("[x-value]");
        }

    }

    ReadyRom("[x-component] [x-value]", function () {

        ConstruirObjetoDoor(this);
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
            if (valor == "null" || valor == "undefined") {
                return null;
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
                var NombreFurniture = nombreControl.split("[");
                Room.Furniture = Room.Furniture.filter(E => E != "Door." + NombreFurniture[0]);
                objeto[nombreProp] = [];
            }

            if (objeto[nombreProp][key] == undefined) {
                var NombreFurniture = nombreControl.replace("[", ".").replace("]", "");
                Room.Furniture = Room.Furniture.filter(E => E != "Door." + NombreFurniture);
                objeto[nombreProp][key] = {};
            }

            //Propiedades definidas
            if (arryProp.length == 0) {
                objeto[nombreProp][key] = "";
                return objeto[nombreProp][key] = toObject(objeto[nombreProp][key], arryProp.join("."), valor, nombreControl);
            } else {
                return toObject(objeto[nombreProp][key], arryProp.join("."), valor, nombreControl);
            }

        } else {
            //Pa propiedades
            //Propiedades no definidas
            if (objeto[nombreProp] == undefined) {
                var NombreFurniture = nombreControl;
                Room.Furniture = Room.Furniture.filter(E => E != "Door." + NombreFurniture);
                if (arryProp.length == 0) {
                    objeto[nombreProp] = "";
                } else {
                    objeto[nombreProp] = {};
                }
            }

            //Propiedades definidas
            if (arryProp.length == 0) {
                objeto[nombreProp] = "";
                return objeto[nombreProp] = toObject(objeto[nombreProp], arryProp.join("."), valor, nombreControl);
            } else {
                return toObject(objeto[nombreProp], arryProp.join("."), valor, nombreControl);
            }


        }


    }

    //---------------------------Helpers------------------------------
    this.Helpers = new function () {

        this.HInput = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml.type = "text";
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });


            var Input = new Container("", "input", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Input);
            Div.Content.push(validacion);

            return Div;

        }

        this.HPasword = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml.type = "password";
            objectsHtml["x-value"] = name;
            objectsHtml.value = "";
            objectsHtml.autocomplete = "new-password"
            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });


            var Input = new Container("", "input", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Input);
            Div.Content.push(validacion);

            return Div;

        }

        this.HTextArea = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;

            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });


            var Area = new Container(value, "textarea", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Area);
            Div.Content.push(validacion);

            return Div;

        }

        this.HNumeric = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            objectsHtml.type = "number";

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });


            var Numeric = new Container("", "input", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Numeric);
            Div.Content.push(validacion);

            return Div;

        }

        this.HLink = function (name, value, objectsHtml = {}, icon = "") {
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
            Link.Content.push(new Container("", "span", { "class": icon }));
            Link.Content.push(value);

            return Link;
        }

        this.HComboBox = function (name, value, title, required, arrayCombox, objectsHtml = {}) {
            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });

            var ComboBox = new Container("", "select", objectsHtml);
            ComboBox.Content = [];
            for (var elemento in arrayCombox) {
                if (Array.isArray(value)) {
                    if (value.includes(arrayCombox[elemento].Valor)) {
                        ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", { "selected": "", "value": arrayCombox[elemento].Valor }));
                    } else {
                        ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", { "value": arrayCombox[elemento].Valor }));
                    }
                } else {
                    if (arrayCombox[elemento].Valor == value) {
                        ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", { "selected": "", "value": arrayCombox[elemento].Valor }));
                    } else {
                        ComboBox.Content.push(new Container(arrayCombox[elemento].Texto, "option", { "value": arrayCombox[elemento].Valor }));
                    }
                }
            }


            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(ComboBox);
            Div.Content.push(validacion);
            return Div;
        }

        this.HCalendar = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            objectsHtml.type = "date";

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });


            var Calendar = new Container("", "input", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Calendar);
            Div.Content.push(validacion);

            return Div;
        }

        this.HHours = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            objectsHtml.type = "time";

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label");


            var Calendar = new Container("", "input", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Calendar);
            Div.Content.push(validacion);

            return Div;
        }

        this.HButton = function (name, type, value, objectsHtml = {}, icon = "") {

            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml.type = type;

            var Button = new Container(value, "button", objectsHtml);
            Button.Content = [];
            Button.Content.push(new Container("", "span", { "class": icon }));
            Button.Content.push(value);

            return Button;

        }

        this.HRadioButon = function (name, value, title, required, arrayCombox, objectsHtml = {}) {
            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name });

            var Input = new Container([], "div", { "style": "display: flex;" });

            for (var item of arrayCombox) {
                var DivRadio = new Container([], "div", { "style": "margin-right:5px" });
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
                var LabelRadio = new Container(item.Texto, "label", { "class": "", "for": ObjectsHtmlRadio.id })
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

        this.HFile = function (name, title, required, objectsHtml = {}) {
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

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label");

            objectsHtml["x-value"] = name;

            if (objectsHtml.style == undefined) {
                objectsHtml.style = "width: 0.1px!important;height: 0.1px!important;opacity: 0;overflow: hidden;position: absolute;";
            } else {
                objectsHtml.style += "width: 0.1px!important;height: 0.1px!important;opacity: 0;overflow: hidden;position: absolute;";
            }

            if (objectsHtml.onchange == undefined) {

                objectsHtml.onchange = "Room.Helpers.HChangeFile(this);";
            } else {
                objectsHtml.onchange += "Room.Helpers.HChangeFile(this);";

            }


            var File = new Container("", "input", objectsHtml);
            var Boton = new Container('<div class="icon-file"> </div><span>Subir Archivo</span>', "label", { "for": Id, "class": objectsHtml.class });

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(File);
            Div.Content.push(Boton);
            Div.Content.push(validacion);





            return Div;
        }
        this.HChangeFile = function (element) {
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

        this.HCheckBox = function (name, value, title, required, objectsHtml = null) {

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

            var CssRequerido = required ? "display: block;width: 100%;border: solid 1px #9acd32;" : "display: block;";
            var SimboloRequerido = new Container("", "span", { "style": CssRequerido });
            var validacion = required ? new Container("", "span", { "id": "Validation-" + Id, "style": "color:#c09853" }) : "";
            var Div = new Container("", "");
            var Label = new Container([title, SimboloRequerido], "label", { "for": name, "style": "margin-right:5px" });


            var Input = new Container("", "input", objectsHtml);

            Div.Content = [];
            Div.Content.push(Label);
            Div.Content.push(Input);
            Div.Content.push(validacion);

            return Div;

        }

        this.HTabla = function (objectsHtml = {}, ObjectsHtmlHeader = {}, ObjectsHtmlBody = {}) {
            this.DivTabla = new Container([], "table", objectsHtml);
            this.Header = new Container([], "thead", ObjectsHtmlHeader);
            this.Body = new Container([], "tbody", ObjectsHtmlBody);
            this.Encabesados = [];
            this.Filas = [];
            this.Header.Content = this.Encabesados;
            this.Body.Content = this.Filas;
            this.DivTabla.Content.push(this.Header);
            this.DivTabla.Content.push(this.Body);
            this.SetFilaHeader = function (objectsHtmlEncabezado = {}) {

                this.Encabesados.push(new Container([], "tr", objectsHtmlEncabezado));
            }
            this.SetCeldaHeader = function (FilaIndex, Contenido, objectsHtmlCelda = {}) {

                this.Encabesados[FilaIndex].Content.push(new Container(Contenido, "th", objectsHtmlCelda));
            }
            this.SetFila = function (objectsHtmlEncabezado = {}) {

                this.Filas.push(new Container([], "tr", objectsHtmlEncabezado));
            }
            this.SetCelda = function (FilaIndex, Contenido, objectsHtmlCelda = {}) {

                this.Filas[FilaIndex].Content.push(new Container(Contenido, "td", objectsHtmlCelda));
            }

            this.GetContainer = function () {
                return this.DivTabla;
            }

            this.Write = function (Element) {
                this.DivTabla.Write(Element);
            }
            this.Html = function () {

                return this.DivTabla.Html();
            }

        }

        WriteElement = function (container) {

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
            var PropiedadesProgramables = [];
            if (container.objectsHtml) {
                Object.keys(container.objectsHtml).forEach(function (propiedad) {
                    if (propiedad.includes("[")) {
                        PropiedadesProgramables.push(propiedad + '="' + container.objectsHtml[propiedad] + '"');
                    } else {
                        Elemento.setAttribute(propiedad, container.objectsHtml[propiedad]);
                    }

                })
            }

            if (Array.isArray(container.Content)) {
                for (var item in container.Content) {
                    Elemento.innerHTML += WriteElement(container.Content[item]);
                }
            } else {
                Elemento.innerHTML = WriteElement(container.Content);
            }
            if (container.Type != "") {
                if (PropiedadesProgramables.length > 0) {
                    var ArrayElemento = Elemento.outerHTML.split(">");
                    ArrayElemento[0] = ArrayElemento[0] + " " + PropiedadesProgramables.join(" ");
                    var ElementoTempo = document.createElement("div");
                    ElementoTempo.innerHTML = ArrayElemento.join(">");
                    Elemento = ElementoTempo.firstChild;
                }

                return Elemento.outerHTML;
            } else {
                return Elemento.innerHTML;
            }
        }

        Container = function (Content, Type, objectsHtml = null) {
            this.Content = Content;
            this.Type = Type;
            this.objectsHtml = objectsHtml;
            this.Write = function (Element) {
                var Contenedor = document.querySelector(Element);
                Contenedor.insertAdjacentHTML("beforeend", WriteElement(this));
            }
            this.Html = function () {
                return WriteElement(this).outerHTML;
            }
        }

        this.Grid = function (objectsHtml = {}) {
            this.Div = new Container("", "div", objectsHtml);
            this.Filas = []
            this.Div.Content = this.Filas;
            this.SetFila = function (objectsHtmlFila = {}) {

                this.Filas.push(new Container([], "div", objectsHtmlFila));
            }
            this.SetCelda = function (FilaIndex, Contenido, objectsHtmlCelda = {}) {

                this.Filas[FilaIndex].Content.push(new Container(Contenido, "div", objectsHtmlCelda));
            }

            this.GetContainer = function () {
                return this.Div;
            }

            this.Write = function (Element) {
                this.Div.Write(Element);
            }
            this.Html = function () {

                return this.Div.Html();
            }

        }

        this.HValidacionRequeridos = function (ClaseInput = "", ClassSpan = "") {
            var ArrayClaseInput = ClaseInput.split(" ");
            var ArrayClassSpan = ClassSpan.split(" ");
            this.validacionesArray = [];
            var Focus = true;
            var Controles = document.querySelectorAll("[x-component] [x-value]");

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
                    var Control = document.querySelector("[x-value='" + Validacion[0] + "']");
                    if (Focus) {
                        Control.focus();
                        Focus = false;
                    }
                    SingleGetControls = true;
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

    }

    //-----------------------Metodos utiles-----------------------------------------

    Hmensajeinfo = 0;

    mensaje3W = 0;

    Object.defineProperty(window, "Hmensajeinfo3W", {
        get: function () {
            return Hmensajeinfo;
        },
        set: function (value) {
            var XMensaje = document.getElementById("CerrarTodoMensaje3W");
            if (value == 0) {
                XMensaje.style.display = "none";
            } else if (Hmensajeinfo == 0 && value == 1) {

                XMensaje.style.display = "ruby-text";


            }
            Hmensajeinfo = value;
        }
    })

    this.QuitarMensaje = function (Target) {
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
                    Room.QuitarMensaje(Target);
                }
            }
        }, 50);
    }

    function NuevoMensaje(Target, index = 0) {
        var Alerta = document.querySelectorAll(Target);
        if (Alerta.length == 0) {
            return;
        }
        Alerta[index].style.opacity = 0;
        var Opacity = 0;
        var fadeEffect = setInterval(function () {
            if (Alerta[index].style.opacity < 1) {
                Alerta[index].style.opacity = Opacity;
                Opacity += 0.1;
            } else {
                clearInterval(fadeEffect);
                var XMensajes = document.querySelectorAll(Target);
                if (index + 1 < XMensajes.length) {
                    NuevoMensaje(Target, index + 1);
                }
            }
        }, 50);
    }

    HAlerta = function (type, message, permanent = false) {


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
            var div = new Container([], "div", { "id": "Alerta3W", "style": "position: fixed;right: 5px; top: 10px; z-index: 10000;text-align: right;max-height:75%;overflow-x: auto;" });
            div.Content.push(new Container("x", "a", { "class": "", "id": "CerrarTodoMensaje3W", "style": "font-size: 50px;width: 55px;font-weight: 700;opacity: .7;display:none; background-color:red;color:white;border-radius:35px;padding-left:14px;padding-right:14px;padding-bottom:7px;right: 0;cursor: pointer;font-family: sans-serif;", "onclick": "Room.QuitarMensaje('.alert'); window.Hmensajeinfo3W = 0;" }));
            div.Write("body");
        }


        window.Hmensajeinfo3W += 1;


        var mensaje = new Container([], "div", { "class": "alert", "id": "Mensaje3W" + apuntador, "style": "box-sizing: border-box;width: 100%;display: grid;padding-right: 30px;padding-top: 5px;padding-left: 20px;border-radius: 35px;border-top-right-radius: 0;margin-bottom: 5px;" + tipoAlerta });



        //mensaje.Content.push("<br>");
        mensaje.Content.push(new Container('<span class="' + icono + '"></span> <span>' + message + "<span>", "p", { "style": "font-size:30px;overflow-y: auto;margin-top: 30px;opacity: 0.5;padding-right: 25px;" }));
        mensaje.Content.push(new Container("x", "a", { "style": "position: absolute;right: 5px;cursor: pointer;font-size: 60px;font-weight: 700;opacity: .5;box-sizing: border-box;font-family: sans-serif;", "class": "", "onclick": "window.Hmensajeinfo3W -= 1;Room.QuitarMensaje('#Mensaje3W" + apuntador + "');" }));
        //mensaje.Content.push("<br>");

        mensaje.Write("#Alerta3W");



        NuevoMensaje("#Mensaje3W" + apuntador);

        if (permanent) {
            return;
        }
        window.setTimeout(function () {
            if (document.getElementById("Mensaje3W" + apuntador) != null) {
                window.Hmensajeinfo3W -= 1;
            }
            Room.QuitarMensaje("#Mensaje3W" + apuntador);

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
        var hora = date.getHours();
        var minuto = date.getMinutes();
        var segundo = date.getSeconds();

        mes = mes < 10 ? "0" + mes : mes;
        dia = dia < 10 ? "0" + dia : dia;

        var Fecha = Format.replaceAll("yyyy", anio);
        Fecha = Fecha.replaceAll("mm", mes);
        Fecha = Fecha.replaceAll("dd", dia);
        Fecha = Fecha.replaceAll("hh", hora);
        Fecha = Fecha.replaceAll("MM", minuto);
        Fecha = Fecha.replaceAll("ss", segundo);

        return Fecha;
    }

    FormData.prototype.add = function (Nombre, Objeto, ArregloPropiedadesQuitar = []) {
        this.QuitarPropiedadesBasura = function (key, value) {
            var ParametrosNotAcepted = ArregloPropiedadesQuitar;
            var ElementoFiltro = ParametrosNotAcepted.find(Elemento => Elemento == key);
            if (ElementoFiltro == undefined)
                return value;
            else
                return undefined;
        };
        if (typeof Objeto === 'object') {
            this.append(Nombre, JSON.stringify(Objeto, this.QuitarPropiedadesBasura));
            return;
        }
        this.append(Nombre, Objeto);
    };
};