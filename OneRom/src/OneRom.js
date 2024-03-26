// ============================================================+
// File name    : OneRom.js
// Description  : Administrador de objetos html 
// Author       : Angel Paredes
// Begin        : agosto 2019
// Last Update  : 21 02 2023
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
    this.Components = {};
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

    if (!Object.prototype.watchAll) {
        Object.defineProperty(
            Object.prototype,
            "watchAll", {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function (handler, ArrayProps = [], ArrayRecursiveProps = []) {


                if (ArrayProps.length == 0) {
                    for (const prop in this) {
                        ArrayProps.push(prop);
                    }
                }
                //Oboservar las propiedades dentro de las propiedades
                for (const prop of ArrayRecursiveProps) {
                    if (this[prop] == undefined) {
                        continue;
                    }
                    let old = this[prop];
                    let cur = old;
                    let setter = (target, property, value) => {
                        target[property] = value;
                        cur = value;
                        cur = handler.call(this, property, old, value);
                        old = cur;
                        target[property] = cur;
                        return true;
                    };
                    this[prop] = new Proxy(this[prop], {
                        set: setter
                    });
                }

                //Oboservar las propiedades
                for (const prop of ArrayProps) {
                    let old = this[prop];
                    let cur = old;
                    let getter = function () {
                        return cur;
                    };
                    let setter = function (value) {
                        if (ArrayRecursiveProps.includes(prop) && value !== cur) {
                            console.error("No se puede modificar la propiedad " + prop + " directamente");
                            return;
                        }
                        cur = value;

                        cur = handler.call(this, prop, old, value);

                        old = cur;
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


            }
        });
    }

    if (!Array.prototype.watchArray) {
        Object.defineProperty(
            Array.prototype,
            'watchArray', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function (handler) {
                //debugger;                

                let me = this;

                let originalPush = this.push;


                let setter = (...args) => {
                    let Resultado = originalPush.apply(me, args);
                    handler.call(this, args);
                    return Resultado;
                }

                Object.defineProperty(me, 'push', {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: setter
                });
            },

        });
    }





    /**
     * @param {*} value : valor en milisegundos
     */
    sleep = function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    var Component = function (Control, FuncionStart = undefined) {
        this.Control = Control;
        this.Start = FuncionStart;
        var ComponentName = Control.attributes["x-component"].value;
        /**
         * 
         * @param {*} Container | RoomJsx
         * @param {*} CleanOtherContainers "Limpia los demas contenedores"
         * @param {*} CleanDoor "Limpia el objeto Door"
         * @param {*} CleanContainers "Limpia el contenedor actual"
         */
        this.Paint = async (Container, CleanOtherContainers = true, CleanDoor = false, CleanContainers = true) => {
            this.Control.style.opacity = 0;
            Opacity = 0;
            Show = async function (Control) {
                if (Opacity < 1) {
                    Opacity += 0.075
                    setTimeout(function () { Show(Control); }, 100);
                }
                Control.style.opacity = Opacity;
            }

            if (CleanContainers) {
                var Contenedor = document.querySelector("[x-component=" + ComponentName + "]");
                Contenedor.innerHTML = "";
            }

            if (CleanOtherContainers == true) {
                for (let Component in Room.Components) {
                    Room.Components[Component].Control.innerHTML = "";
                }
            }
            if (CleanDoor) {
                Door = {};
            }
            if (Container instanceof RoomJsx)
                Container = Container.TranspilarAContainer();
            if (Array.isArray(Container)) {
                for (let Contenedor of Container) {
                    await Contenedor.Write("[x-component=" + ComponentName + "]");
                }
            }
            else {
                await Container.Write("[x-component=" + ComponentName + "]");
            }

            Show(this.Control);
        }
        this.Clear = () => {
            document.querySelector("[x-component=" + ComponentName + "]").innerHTML = "";
        }
    }

    this.RestartComponents = async function () {
        // asleep();
        //Room.Funciones = [];
        var Controles = document.querySelectorAll("[x-component]");
        var MetodosStart = [];
        for (let item of Controles) {

            RecorrerHijos(item);



            if (Room.Components[item.attributes["x-component"].value] == undefined) {
                Room.Components[item.attributes["x-component"].value] = {};
                var codigo = undefined;
                if (item.attributes["x-start"]) {
                    codigo = item.attributes["x-start"].value;
                    MetodosStart.push(codigo);
                    item.removeAttribute("x-start");
                }
                Room.Components[item.attributes["x-component"].value] = new Component(item, codigo);
            }
        }

        let ControlesLoad = document.querySelectorAll("[rjsxload]");
        ControlesLoad.forEach(function (Control) {
            Control.onload();
            Control.removeAttribute("rjsxload");
        });
        construirPropiedad(Door, "Door");

        MetodosStart.forEach(element => {
            eval(element);
        });
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


    function construirPropiedad(objeto, NombreProp) {

        if (Array.isArray(objeto) && objeto.length > 0) {
            for (var propiedad in objeto) {
                construirPropiedad(objeto[propiedad], NombreProp + "[" + propiedad + "]");
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

            //si NombrePropiedadFinal es un numero
            let elementodor = document.querySelector("[x-value='" + NombrePropiedadSinDoor + "']")
            //si no existe el elemento
            if (elementodor == null) {
                return;
            }
            Room.Furniture.push(NombreProp);

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
                        console.error("No se pudieron evaluar algunas funciones del Room");
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
    window.onpopstate = async function (event) {

        window.NavigationState = true;
        if (event.state == null) {
            return;
        }
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
        await sleep(250);
        Room.Restart();
    };

    /**
     * 
     * ActivaNavegacionAjax
     * @param PaginaInicio : Metodo de la pagina de inicio
     * 
     * Activa la navegacion ajax
     */
    ActivaNavegacionAjax = async function (PaginaInicio) {
        await sleep(250);
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
        await sleep(250);
        Room.Restart();
    }
    /**
     * CargarPaginaNavegacionAjax
     * @param Door : Objeto Door
     * @param ParamUrl : Parametros de la url
     * @param EsInicio : Si es la pagina de inicio
     * 
     * Carga una pagina con navegacion ajax
     * 
     */
    CargarPaginaNavegacionAjax = async function (Door, ParamUrl, EsInicio = false) {
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


    /**
     * AjaxFailServidor
     * Se ejecuta al fallar el servidor
     */
    AjaxFailServidor = function (event) {
        if (Debug) {
            console.error(event);
        }
    };

    /**
     * AjaxStartServidor
     * Se ejecuta al iniciar el envio de informacion
     */
    AjaxStartServidor = function () {
        if (Debug) {
            console.error("Inicia POST/GET");
        }
    };

    /**
     * AjaxFinallyServidor
     * Se ejecuta al terminar de responder el servidor
     */
    AjaxFinallyServidor = function () {
        if (Debug) {
            console.error("Finaliso POST/GET");
        }

    }
    var max = 99999999;
    var min = 10000000;
    SessionTab = Math.floor(Math.random() * (max - min + 1) + min);

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
                console.error("Ocurrio un error al tranferir la informacion.");
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
                console.error("se cancelo la tranferencia de informacion.");
            }
        };
        var Request = new XMLHttpRequest();
        Request.open(Metod.toUpperCase(), Url, true);
        /**
         * Send
         * POST/GET a la url introducida
         **/
        this.Send = function () {
            document.cookie = 'tab_session_id=' + SessionTab;
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
    /**
     * Restart
     * Reinicia el Door
     */
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

        /**
         * This function is used to create a input text
         * @param {String} name = name and id of the input
         * @param {String} value
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
         */
        this.HInput = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml.type = "text";
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            if (objectsHtml.maxLength)
                objectsHtml.onpaste = "Room.Helpers.InputMaxLengthOnPaste(event,this)";
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
        /**
         * This function is used to create a input password
         * @param {String} name = name and id of the input
         * @param {String} value
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
         */
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

        /**
         * This function is used to create a textarea
         * @param {String} name = name and id of the textarea
         * @param {String} value
         * @param {String} title = title of the textarea
         * @param {boolean} required = if the textarea is required
         * @param {object} objectsHtml = attributes of the textarea
         */
        this.HTextArea = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;

            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            if (objectsHtml.maxLength)
                objectsHtml.onpaste = "Room.Helpers.InputMaxLengthOnPaste(event,this)";
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
        /**
         * This function is used to create a input number
         * @param {String} name = name and id of the input
         * @param {String} value
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
         */
        this.HNumeric = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            objectsHtml.type = "number";
            if (objectsHtml.maxLength)
                objectsHtml.onpaste = "Room.Helpers.InputMaxLengthOnPaste(event,this)";
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
        /**
         * This function is used to create a link
         * @param {String} name = name and id of the link
         * @param {String} value = text of the link
         * @param {object} objectsHtml = attributes of the link
         * @param {String} icon = class of the vectorial icon
         */
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
        /**
         * This function is used to create a select
         * @param {String} name = name and id of the select
         * @param {String} value
         * @param {String} title = title of the select
         * @param {boolean} required = if the select is required
         * @param {Array} arrayCombox = array of objects options of the select
         * @param {object} objectsHtml = attributes of the select
        */
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
        /**
         * This function is used to create a input type date
         * @param {String} name = name and id of the input
         * @param {String} value = value of the input in format yyyy-mm-dd
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
        */
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
        /**
         * This function is used to create a input type datetime-local
         * @param {String} name = name and id of the input
         * @param {String} value = value of the input in format yyyy-mm-ddThh:mm
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
        */
        this.HDateTime = function (name, value, title, required, objectsHtml = {}) {

            var Id = name;
            if (objectsHtml.id == undefined)
                objectsHtml.id = name;
            if (objectsHtml.name == undefined)
                objectsHtml.name = name;
            objectsHtml["x-value"] = name;
            objectsHtml.value = value;
            objectsHtml.type = "datetime-local";

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
        /**
         * This function is used to create a input type time
         * @param {String} name = name and id of the input
         * @param {String} value = value of the input in format hh:mm
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
        */
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
        /**
         * This function is used to create a button
         * @param {String} name = name and id of the button
         * @param {String} type = type of the button
         * @param {String} value = text of the button
         * @param {object} objectsHtml = attributes of the button
         * @param {String} icon = class of the vectorial icon
        */
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
        /**
         * This function is used to create a input type radio
         * @param {String} name = name and id of the input
         * @param {String} value = value of the input
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {array} arrayCombox = array of objects with the values and text of the radio
         * @param {object} objectsHtml = attributes of the input
        */
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
        /**
         * This function is used to create a input type file
         * @param {String} name = name and id of the input
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
        */
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
            var Label = new Container([title, SimboloRequerido], "label", { "for": Id });

            objectsHtml["x-value"] = name;

            if (objectsHtml.style == undefined) {
                objectsHtml.style = "width: 0.1px!important;height: 0.1px!important;opacity: 0;overflow: hidden;position: absolute;";
            } else {
                objectsHtml.style += ";width: 0.1px!important;height: 0.1px!important;opacity: 0;overflow: hidden;position: absolute;";
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
        /**
         * This function is used to create a input type checkbox
         * @param {String} name = name and id of the input
         * @param {String} value = value of the input
         * @param {String} title = title of the input
         * @param {boolean} required = if the input is required
         * @param {object} objectsHtml = attributes of the input
        */
        this.HCheckBox = function (name, value, title, required, objectsHtml = {}) {

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
        /**
         * This function is used to create a table
         * @param {object} objectsHtml = attributes of the table
         * @param {object} ObjectsHtmlHeader = attributes of the header
         * @param {object} ObjectsHtmlBody = attributes of the body
         * Comun functions
         * SetFilaHeader = Set row of the header
         * SetCeldaHeader = Set cell of the header
         * SetFila = Set row of the body
         * SetCelda = Set cell of the body setCelda("last",Contenido[,objectsHtml])
         * Write = Write the table in the elemento html Write("body")
         * Html = Return the html of the table
        */
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
                //this.ReFresh();
            }
            this.SetCeldaHeader = function (FilaIndex, Contenido, objectsHtmlCelda = {}) {
                this.Encabesados[FilaIndex].Content.push(new Container(Contenido, "th", objectsHtmlCelda));
                //this.ReFresh();
            }
            this.SetFila = function (objectsHtmlEncabezado = {}) {
                let me = this;
                objectsHtmlEncabezado.Delete = function (...Listas) {
                    let tabla = me.DivTabla.ElementDom;
                    let tBody = me.Body.ElementDom;
                    let trSelected = this;

                    let indice = Array.from(tBody.getElementsByTagName("tr")).indexOf(trSelected);

                    me.Filas.splice(indice, 1);

                    for (let Lista of Listas) {
                        Lista.splice(indice, 1);
                    }

                    if (tabla.DeleteRoomJsx) {
                        tabla.DeleteRoomJsx(indice);
                    }
                    trSelected.remove();
                    //me.ReFresh();
                }
                this.Filas.push(new Container([], "tr", objectsHtmlEncabezado));
                //this.ReFresh();
            }
            this.SetCelda = function (FilaIndex, Contenido, objectsHtmlCelda = {}) {
                if (FilaIndex == "last") {
                    this.Filas[this.Filas.length - 1].Content.push(new Container(Contenido, "td", objectsHtmlCelda));
                }
                else {
                    this.Filas[FilaIndex].Content.push(new Container(Contenido, "td", objectsHtmlCelda));
                }
                //this.ReFresh();

            }

            this.ReFresh = function () {
                if (this.DivTabla.ElementDom) {
                    this.DivTabla.ReFresh();
                }
            }

            this.GetContainer = function () {
                return this.DivTabla;
            }

            this.Write = async function (Element) {
                await this.DivTabla.Write(Element);
            }
            this.Html = function () {

                return this.DivTabla.Html();
            }

        }

        CreateElement = function (container) {

            var Elemento = null;
            if (container == null || container == undefined) {
                return document.createTextNode("");
            }
            if (typeof container !== 'object' && !Array.isArray(container)) {

                return container;
            }

            if (container.Type != "") {
                Elemento = document.createElement(container.Type);
            } else {
                Elemento = document.createElement("Borrar");

            }
            container.ElementDom = Elemento;
            //Codigo para armar las propiedades
            var PropiedadesProgramables = [];
            if (container.objectsHtml) {
                Object.keys(container.objectsHtml).forEach(function (propiedad) {
                    if (propiedad.includes("[")) {
                        PropiedadesProgramables.push([propiedad, container.objectsHtml[propiedad]]);
                    }
                    //si container.objectsHtml[propiedad] es igual a objeto o funcion
                    else if (typeof container.objectsHtml[propiedad] === "object" || typeof container.objectsHtml[propiedad] === "function") {
                        //else if (typeof container.objectsHtml[propiedad] !== "string") {
                        if (!Elemento[propiedad]) {
                            Elemento[propiedad] = container.objectsHtml[propiedad];
                            if (propiedad === "onload")
                                Elemento.setAttribute("rjsxLoad", "");
                        }
                        else {
                            console.error("Esta intentando sobre escribir una propiedad", propiedad);
                        }
                    }
                    else {
                        Elemento.setAttribute(propiedad, container.objectsHtml[propiedad]);

                        if (!Elemento[propiedad] && propiedad !== "style" && propiedad !== "class") {
                            Elemento[propiedad] = container.objectsHtml[propiedad];
                        }

                    }
                })
            }

            //Codigo para armar las propiedades programables
            for (let Prop of PropiedadesProgramables) {

                var StringSinCorchetes = Prop[0].split("[").join("");
                StringSinCorchetes = StringSinCorchetes.split("]").join("");
                var codigo = ValidaAtributosEspeciales(StringSinCorchetes, Prop[1], Elemento);

                var Elemto = Elemento;

                var funcion = function (valor) {
                    eval(valor);
                }
                Room.FuncionesBinding.push({ "funcion": funcion, "Codigo": codigo, "NombreDoor": Elemto.getAttribute("x-value"), "NombrePropiedad": Prop[0] });
                try {
                    eval(codigo);
                } catch (error) {

                }
            }

            if (Array.isArray(container.Content)) {

                for (var item in container.Content) {
                    let Cont = CreateElement(container.Content[item]);
                    if (typeof Cont === 'object') {
                        if (Cont.nodeName == "BORRAR") {
                            while (Cont.firstChild) {
                                Elemento.appendChild(Cont.firstChild);
                            }
                        } else {
                            Elemento.appendChild(Cont);
                        }

                    } else {
                        Elemento.insertAdjacentHTML('beforeend', Cont);
                    }

                }
            } else {
                let Cont = CreateElement(container.Content);
                if (typeof Cont === 'object') {
                    if (Cont.nodeName == "BORRAR") {
                        while (Cont.firstChild) {
                            Elemento.appendChild(Cont.firstChild);
                        }
                    } else {
                        Elemento.appendChild(Cont);
                    }

                } else {
                    Elemento.insertAdjacentHTML('beforeend', Cont);
                }
            }

            return Elemento;

        }

        ReCreateElement = function (container, IsContent) {
            var Elemento = null;
            if (container == null || container == undefined) {
                return document.createTextNode("");
            }
            if (typeof container !== 'object' && !Array.isArray(container)) {

                return container;
            }

            let nuevo = false;
            if (container.ElementDom) {
                Elemento = container.ElementDom;
            }
            else if (container.Type != "") {
                Elemento = document.createElement(container.Type);
                container.ElementDom = Elemento;
                nuevo = true;
            } else {
                Elemento = document.createElement("Borrar");
                container.ElementDom = Elemento;
                nuevo = true;
            }
            if (IsContent)
                Elemento.innerHTML = "";
            //Codigo para armar las propiedades
            var PropiedadesProgramables = [];
            if (container.objectsHtml) {
                Object.keys(container.objectsHtml).forEach(function (propiedad) {
                    if (propiedad.includes("[")) {
                        PropiedadesProgramables.push([propiedad, container.objectsHtml[propiedad]]);
                    }
                    //si container.objectsHtml[propiedad] es igual a objeto o funcion
                    else if (typeof container.objectsHtml[propiedad] === "object" || typeof container.objectsHtml[propiedad] === "function") {
                        //else if (typeof container.objectsHtml[propiedad] !== "string") {
                        if (Elemento[propiedad] && propiedad === "onchange") {
                            //Se anula la sobre escritura de onchange sin tener que mostrar el error
                            //console.error("Esta intentando sobre escribir un evento ", propiedad, " para el buen funcionamiento de OneRom esta accion no sera permitida");
                        }
                        else {
                            Elemento[propiedad] = container.objectsHtml[propiedad];
                            if (propiedad === "onload" && nuevo)
                                Elemento.setAttribute("rjsxLoad", "");
                        }

                    }
                    else {

                        Elemento.setAttribute(propiedad, container.objectsHtml[propiedad]);

                        if (!propiedad.startsWith("on") && propiedad !== "value" && propiedad !== "style" && propiedad !== "class") {
                            Elemento[propiedad] = container.objectsHtml[propiedad];
                        }


                    }
                })
            }

            //Codigo para armar las propiedades programables
            for (let Prop of PropiedadesProgramables) {

                var StringSinCorchetes = Prop[0].split("[").join("");
                StringSinCorchetes = StringSinCorchetes.split("]").join("");
                var codigo = ValidaAtributosEspeciales(StringSinCorchetes, Prop[1], Elemento);

                var Elemto = Elemento;

                var funcion = function (valor) {
                    eval(valor);
                }
                Room.FuncionesBinding.push({ "funcion": funcion, "Codigo": codigo, "NombreDoor": Elemto.getAttribute("x-value"), "NombrePropiedad": Prop[0] });
                try {
                    eval(codigo);
                } catch (error) {

                }
            }

            if (Array.isArray(container.Content)) {
                for (var item in container.Content) {

                    let Cont = ReCreateElement(container.Content[item]);
                    if (Cont !== undefined) {
                        if (typeof Cont === 'object') {
                            if (Cont.nodeName == "BORRAR") {
                                while (Cont.firstChild) {
                                    Elemento.appendChild(Cont.firstChild);
                                }
                            } else {
                                Elemento.appendChild(Cont);
                            }
                        } else {
                            Elemento.insertAdjacentHTML('beforeend', Cont);
                        }
                    }

                }
            } else {
                let Cont = ReCreateElement(container.Content);
                if (Cont !== undefined && (nuevo || IsContent)) {
                    if (typeof Cont === 'object') {
                        if (Cont.nodeName == "BORRAR") {
                            while (Cont.firstChild) {
                                Elemento.appendChild(Cont.firstChild);
                            }
                        } else {
                            Elemento.appendChild(Cont);
                        }
                    } else {
                        Elemento.insertAdjacentHTML('beforeend', Cont);
                    }
                }
            }
            if (nuevo)
                return Elemento;
        }

        /**
         * This function is used to create a container
         * @param {String|Array|Container} Content = content of the container
         * @param {String} Type = type of the container
         * @param {object} objectsHtml = attributes of the container
         */
        Container = function (Content, Type, objectsHtml = {}) {
            this.Content = Content;
            this.Type = Type;
            this.objectsHtml = objectsHtml;
            this.ElementDom = null;
            // if(this.Type!="")
            // this.ElementDom = document.createElement(this.Type);
            this.objectsHtml.Container = this;

            this.Write = async function (Element, position = "beforeend") {

                /**
                 * Verifica si el objeto Element estÃ¡ definido en el Ã¡mbito global, de lo contrario, 
                 * busca el primer elemento que coincida con el selector especificado en el documento.
                 * @param {string|Element} Element - El selector del elemento o el propio elemento.
                 * @returns {Element} - El elemento seleccionado.
                 * @position {string} - beforeend= dentro al final, afterbegin= dentro al inicio, afterend= despues del elemento, beforebegin= antes del elemento
                 */
                const Elemento = typeof Element === 'object' ? Element : document.querySelector(Element);
                if (!Elemento) throw `El control ${Element} no fue encontrado`;

                let elemDom = CreateElement(this);
                if (elemDom.nodeName == "BORRAR") {
                    while (elemDom.firstChild) {
                        Elemento.insertAdjacentElement(position, elemDom.firstChild);
                    }
                }
                else {
                    Elemento.insertAdjacentElement(position, elemDom);
                }
                await sleep(200);
            }
            this.Html = function () {
                return CreateElement(this).outerHTML;
            }

            this.ReFresh = function (IsContent = false) {
                ReCreateElement(this, IsContent);
            }



            //***************************************Binding****************************************************

            let PropiedadesObserverContent = ["Content", "objectsHtml"];
            let PropiedadesObserverRecursivas = ["objectsHtml"];
            this.watchAll(function (prop, old, value) {

                if (prop == "Content")

                    if (Array.isArray(this.Content)) {
                        this.Content.watchArray(() => {
                            if (this.ElementDom) {

                                //Si se agrego un nuevo elemento en el array, se agrega en el ElementoDom
                                let Cont = ReCreateElement(this.Content[this.Content.length - 1]);

                                if (Cont !== undefined) {
                                    if (typeof Cont === 'object') {
                                        if (Cont.nodeName == "BORRAR") {
                                            while (Cont.firstChild) {
                                                this.ElementDom.appendChild(Cont.firstChild);
                                            }
                                        } else {
                                            this.ElementDom.appendChild(Cont);
                                        }
                                    } else {
                                        this.ElementDom.insertAdjacentHTML('beforeend', Cont);
                                    }
                                }
                            }

                        });
                    }

                if (this.ElementDom) {
                    if (prop == "Content") {
                        this.ReFresh(true);
                    } else {
                        this.ReFresh();
                    }
                }
                return value;
            }, PropiedadesObserverContent, PropiedadesObserverRecursivas);


        }

        /**
         * This function is used to create a grid
         * @param {object} objectsHtml = attributes of the grid
         * Comun functions
         * SetFila = Set row of the grid setFila([objectsHtml]])
         * SetCelda = Set cell of the grid setCelda("last",Contenido[,objectsHtml])
        */
        this.Grid = function (objectsHtml = {}) {
            this.Div = new Container("", "div", objectsHtml);
            this.Filas = []
            this.Div.Content = this.Filas;
            this.SetFila = function (objectsHtmlFila = {}) {

                this.Filas.push(new Container([], "div", objectsHtmlFila));
                if (this.Div.ElementDom) {
                    this.Div.ReFresh();
                }
            }
            this.SetCelda = function (FilaIndex, Contenido, objectsHtmlCelda = {}) {
                if (FilaIndex == "last") {
                    this.Filas[this.Filas.length - 1].Content.push(new Container(Contenido, "div", objectsHtmlCelda));
                }
                else {
                    this.Filas[FilaIndex].Content.push(new Container(Contenido, "div", objectsHtmlCelda));
                }

                if (this.Div.ElementDom) {
                    this.Div.ReFresh();
                }

            }

            this.GetContainer = function () {
                return this.Div;
            }

            this.Write = async function (Element) {
                await this.Div.Write(Element);
            }
            this.Html = function () {

                return this.Div.Html();
            }

        }
        /**
         * This function validadte the required fields
         * @param {string} ClaseInput = class to add or remove when the input is error validation
         * @param {string} ClassSpan = class to add or remove when the span is error validation
         * Comun functions
         * validacionesArray fill with the validations Validacion.validacionesArray.push(["input_name", "element is required"])
         * Validar = validate the required fields
        */
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

        this.InputMaxLengthOnPaste = function (e, input) {

            //si el texto que se va a pegar es mayor al maximo permitido no se pegara y manda un alert de error
            if (input.maxLength > 0)
                if (e.clipboardData.getData('text/plain').length + input.value.length > input.maxLength) {
                    e.preventDefault();
                    HAlerta("error", "El texto que intenta pegar debe ser menor a " + input.maxLength + " caracteres");
                }

        }
    }

    //--------------------Notificaciones----------------------------

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

    /**
     * This function is used to create a alert
     * @param {String} type = type of the alert
     * @param {String} message = text of the alert
     * @param {boolean} permanent = if the alert is permanent
     */
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

    //-----------------------Metodos utiles-----------------------------------------

    /**
     * 
     * @param {*} search 
     * @param {*} replacement 
     * @returns 
     */
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    }
    /**
     * 
     * @param {*} Format 
     * @returns 
     */
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

    /**
     * 
     * @param {*} Nombre 
     * @param {*} Objeto 
     * @param {*} ArregloPropiedadesQuitar 
     * @returns 
     */
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

    /**
     * 
     * @param {*} Control 
     * @returns primer elemento padre que contenga el atributo
     */
    Element.prototype.parentElementSpecific = function (Control) {
        let obtenerPadreDeTipo = function (elemento, name) {
            while (elemento && elemento.tagName !== name.toUpperCase()) {
                elemento = elemento.parentNode;
            }
            return elemento;
        }
        return obtenerPadreDeTipo(this, Control);
    }
    /**
     * 
     * @param {*} Arreglo 
     * @returns boolean
     */
    String.prototype.includesAll = function (Arreglo) {
        var Cadena = this;
        for (var subCaden of Arreglo) {
            if (Cadena.includes(subCaden)) {
                return true;
            }
        }
        return false;
    };

    //------------------------Live----------------------------------------------
    this.Live = function (RutaPantalla) {
        if (!RutaPantalla) {
            console.error("No se ha definido la pantalla");
            return;
        }

        if (document.getElementById("RomLivejs")) {
            return;
        }

        console.info("Activo... live.js");
        var ContadorLiveScritp = 0;


        function actualizarScript() {

            var script = document.createElement('script');
            script.src = RutaPantalla + '?v=' + ContadorLiveScritp;
            document.head.appendChild(script);
            ContadorLiveScritp++;
        }

        let EstyloIcono = new RoomJsx({
            "Type": "style",
            "Content": `
          #RoomRefreshIcon {
            display: inline-block;
            border: 4px solid #f3f3f3;
            border-radius: 50%;
            border-top: 4px solid #3498db;
            width: 20px;
            height: 20px;                   
            box-shadow: 0 0 10px #3498db;
          }
          
          #RoomRefreshIcon.RoomSpin {  
            -webkit-animation: spin 2s linear infinite; /* Safari */
            animation: RoomSpin 0.7s linear infinite;
          }
          
          /* Safari */
          @-webkit-keyframes RoomSpin {
            0% { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
          }
          
          @keyframes RoomSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
        });

        EstyloIcono.Write("head");

        let IconoLive = new RoomJsx({
            "Type": "span",
            "Content": `<div id="RoomRefreshIcon"></div>`,
            "Properties": {
                "id": "RomLivejs",
                "style": {
                    "top": '10px',
                    "right": '10px',
                    "z-index": '100',
                    "font-size": '20px',
                    "color": 'red',
                    "position": 'fixed'
                },
                "onclick": async function () {
                    var script = document.querySelector("script[src*='" + RutaPantalla + "']");
                    if (script) {
                        script.remove();
                    }
                    actualizarScript();
                    let Icono = document.getElementById('RoomRefreshIcon');
                    Icono.classList.add('RoomSpin');
                    await sleep(800);
                    Icono.classList.remove('RoomSpin');

                    let Comandos = document.getElementById('RomLivejsCodigo').value.split(";");

                    for (let Comando of Comandos) {
                        eval(Comando);
                        await sleep(200);
                    }

                }
            }
        });

        IconoLive.Write("body");

        let Codigo = new RoomJsx({
            "Type": "textarea",
            "Properties": {
                "id": "RomLivejsCodigo",
                "style": {
                    "top": '40px',
                    "right": '10px',
                    "z-index": '100',
                    "font-size": '20px',
                    "color": 'red',
                    "font-weight": 'bold',
                    "position": 'fixed',
                    "background-color": "rgba(255, 255, 255, 0.75)",
                    "width": "300px",
                    "height": "100px",
                }
            }
        });

        Codigo.Write("body");
    }
};

class RoomJsx {
    Type = "div";
    Content = [];
    Properties = {};
    Rows = [];
    Name = "";
    Value = "";
    Title = "";
    Required = false;
    Icon = "";
    Headers = [];
    Body = [];
    Options = [];
    TypeButton = "button";
    #Container = null;
    #Tabla = null;
    #Grid = null;


    /**
     * Creates a new instance of OneRom.
     * @constructor
     * @param {Object} options - The options object.
        * Normal Element
        * @param {string} options.Type - The type of the OneRom.
        * @param {string} options.Content - The content of the OneRom.
        * @param {Object} options.Properties - The properties of the OneRom.
        * 
        * Helpers
        * @param {string} options.Type - The type of the OneRom.
        * @param {string} options.Name - The name of the OneRom.
        * @param {string} options.Value - The value of the OneRom.
        * @param {string} options.Title - The title of the OneRom.
        * @param {boolean} options.Required - Whether the OneRom is required or not.
        * @param {string} options.Icon - The icon of the OneRom.
        * @param {Object} options.Options - The options of the OneRom.
        * @param {string} options.TypeButton - The type of button of the OneRom.
        * @param {Object} options.Properties - The properties of the OneRom.
        * 
        * Grid
        * @param {string} options.Type - The type of the OneRom.
        * @param {number} options.Rows - The number of rows of the OneRom.
        * @param {Object} options.Properties - The properties of the OneRom.
        * 
        * Table
        * @param {string} options.Type - The type of the OneRom.
        * @param {Object} options.Headers - The headers of the OneRom.
        * @param {Object} options.Body - The body of the OneRom.
        * @param {Object} options.Properties - The properties of the OneRom.
     */
    constructor({ Type, Content, Properties = {}, Rows = [], Name, Value = "", Title, Required, Icon, Headers = [], Body = [], Options = [], TypeButton, } = { Properties: {}, Headers: [], Body: [], Rows: [], Options: [] }) {
        if (Type === undefined) {
            throw new Error("RoomJsx() valores minimos de un objeto RoomJsx es RoomJsx({Type:''})");
        }

        //Si Rows, Headers o Body no son arreglos bidiemnsionales o arreglos vacios se lanza un error
        if (!Array.isArray(Rows))
            throw new Error("RoomJsx() Rows debe ser un arreglo bidimensional o un arreglo vacio");
        if (Rows.length > 0) {
            if (!(Rows[0] instanceof RoomJsxAndPropiedades))
                if (!Array.isArray(Rows[0]) || Rows[0].length == 0) {
                    throw new Error("RoomJsx() Rows debe ser un arreglo bidimensional o un arreglo vacio");
                }
        }

        if (!Array.isArray(Headers))
            throw new Error("RoomJsx() Headers debe ser un arreglo bidimensional o un arreglo vacio");
        if (Headers.length > 0) {
            if (!(Headers[0] instanceof RoomJsxAndPropiedades))
                if (!Array.isArray(Headers[0]) || Headers[0].length == 0) {
                    throw new Error("RoomJsx() Headers debe ser un arreglo bidimensional o un arreglo vacio");
                }
        }

        if (!Array.isArray(Body))
            throw new Error("RoomJsx() Body debe ser un arreglo bidimensional o un arreglo vacio");
        if (Body.length > 0) {
            if (!(Body[0] instanceof RoomJsxAndPropiedades))
                if (!Array.isArray(Body[0]) || Body[0].length == 0) {
                    throw new Error("RoomJsx() Body debe ser un arreglo bidimensional o un arreglo vacio");
                }
        }

        if (!Array.isArray(Options))
            throw new Error("RoomJsx() Options debe ser un arreglo de objetos con las propiedades {Valor:'', Texto:''}");
        if (Options.length > 0) {
            if (!Options[0].hasOwnProperty("Valor") || !Options[0].hasOwnProperty("Texto")) {
                throw new Error("RoomJsx() Options debe ser un arreglo de objetos con las propiedades {Valor:'', Texto:''}");
            }
        }


        this.Type = Type;
        //Si es numero cambialo a string
        if (typeof Content === 'number') {
            this.Content = Content.toString();
        }
        else {
            this.Content = Content;
        }
        this.Properties = Properties;
        this.Rows = Rows;
        this.Name = Name;
        this.Value = Value;
        this.Title = Title;
        this.Required = Required;
        this.Icon = Icon;
        this.Headers = Headers;
        this.Body = Body;
        this.Options = Options;
        this.TypeButton = TypeButton;

        //si properties.style no es un objeto se manda un error
        if (Properties.style) {
            if (typeof Properties.style !== 'object') {
                throw new Error("RoomJsx() Properties.style debe ser un objeto");
            }
        }



        //***************************************Binding****************************************************


        //-----------------------------------Propiedades Observables----------------------------------------------
        let ArregloPropiedadesObserver = ["Content", "Properties", "Rows", "Headers", "Body", "Options"];
        let ArregloPropiedadesObserverRecursivas = ["Properties"];


        this.watchAll(function (prop, old, value) {
            if (prop == "Content") {

                if (Array.isArray(this.Content)) {
                    this.Content.watchArray(() => {
                        if (this.#Container && this.#Container.ElementDom) {
                            this.#RetranspilarAContainer();
                        }
                    });
                }
            }

            if (prop == "Headers" || prop == "Body" || prop == "Rows") {
                if (!Array.isArray(this[prop]))
                    throw new Error("RoomJsx() Headers, Body y Rows deben ser arreglos bidimensionales o arreglos vacios");
                this[prop].watchArray((ValorPushado) => {
                    //si no es un arreglo el valorpushado se manda un error y se elimina del arreglo
                    if (!(ValorPushado[0] instanceof RoomJsxAndPropiedades))
                        if (!Array.isArray(ValorPushado[0])) {
                            console.error("El valor que se intenta agregar no es un arreglo");
                            this[prop].splice(this[prop].length - 1, 1);
                            return;
                        }
                    if (this.#Container && this.#Container.ElementDom) {
                        this.#RetranspilarAContainer();
                    }
                });
            }

            if (prop == "Options") {
                if (!Array.isArray(this[prop]))
                    throw new Error("RoomJsx() Options deben ser arreglo bidimensionale o arreglo vacio");
                this[prop].watchArray((ValorPushado) => {
                    //si el valorpushado no es un objeto con las propiedades {Valor:"", Texto:""} se manda un error y se elimina del arreglo                    
                    if (!ValorPushado[0].hasOwnProperty("Valor") || !ValorPushado[0].hasOwnProperty("Texto")) {
                        console.error("El valor que se intenta agregar no es un objeto con las propiedades {Valor:'', Texto:''}");
                        this[prop].splice(this[prop].length - 1, 1);
                        return;
                    }
                    if (this.#Container && this.#Container.ElementDom) {
                        this.#RetranspilarAContainer();
                    }
                });
            }

            if (this.#Container && this.#Container.ElementDom) {
                this.#RetranspilarAContainer();
            }
            return value;
        }, ArregloPropiedadesObserver, ArregloPropiedadesObserverRecursivas);



    }


    static AddPropiedades(valor, Propiedades) {
        return new RoomJsxAndPropiedades(valor, Propiedades);
    }

    ValidaTranspilarEstilos(Propiedades) {
        if (Propiedades.style) {
            let style = "";
            for (let Prop in Propiedades.style) {
                style += Prop + ":" + Propiedades.style[Prop] + ";";
            }
            Propiedades.style = style;
        }

        return Propiedades;
    }

    TranspilarAContainer() {
        let Elemento = Object.assign({}, this);
        Elemento = Object.assign({}, Elemento);
        let Propiedades = Object.assign({}, Elemento.Properties);
        if (Propiedades)
            Propiedades = this.ValidaTranspilarEstilos(Propiedades);

        if (Room.Helpers.hasOwnProperty(Elemento.Type)) {
            const Helpers = [];
            const InputComun = () => { return new Room.Helpers[Elemento.Type](Elemento.Name, Elemento.Value, Elemento.Title, Elemento.Required, Propiedades) };
            const Tabla = () => {

                if (Propiedades.Ajax) {
                    Propiedades.class = "RoomJsxTable";
                    Propiedades.RoomJsxType = "Tabla";
                    Propiedades.onload = function () { this.CargarDatos(this); };
                    Propiedades.CargarDatos =
                        function ({ Filt = this.Filtros, Ord = this.Orders, Pag = this.PaginaActual } = this) {
                            let Elemento = this;
                            RoomJsx.TablaAyaxCargar(Elemento, Elemento.AjaxUrl, Filt, Ord, Pag);
                            Elemento.removeAttribute("AjaxUrl");
                        }

                }

                Propiedades.DeleteRoomJsx = (index) => {
                    this.Body.splice(index, 1);
                }

                let Tabla = new Room.Helpers[Elemento.Type](Propiedades);

                if (Elemento.Headers) {
                    let headerrow = 0;
                    for (let Header of Elemento.Headers) {
                        let Encabesado;
                        if (Array.isArray(Header)) {
                            Encabesado = Header;
                            Tabla.SetFilaHeader();
                        }
                        else {
                            let PropHeader = this.ValidaTranspilarEstilos(Object.values(Header)[1]);
                            Tabla.SetFilaHeader(PropHeader);
                            Encabesado = Object.values(Header)[0];
                        }

                        for (let Column of Encabesado) {

                            if (typeof Column === 'string') {
                                Tabla.SetCeldaHeader(headerrow, Column);
                            }
                            else if (Column instanceof RoomJsx) {
                                Tabla.SetCeldaHeader(headerrow, Column.TranspilarAContainer());
                            }
                            else {
                                let PropTh = this.ValidaTranspilarEstilos(Object.values(Column)[1]);

                                let valor = Object.values(Column)[0];
                                if (typeof valor === 'string') {
                                    Tabla.SetCeldaHeader(headerrow, valor, PropTh);
                                }
                                else {
                                    Tabla.SetCeldaHeader(headerrow, valor.TranspilarAContainer(), PropTh);
                                }
                            }
                        }
                        headerrow++;
                    }
                }

                if (Elemento.Body) {
                    let bodyrow = 0;
                    for (let Body of Elemento.Body) {
                        let Cuerpo;
                        if (Array.isArray(Body)) {
                            Tabla.SetFila();
                            Cuerpo = Body;
                        }
                        else {
                            let PropBody = this.ValidaTranspilarEstilos(Object.values(Body)[1]);
                            Tabla.SetFila(PropBody);
                            Cuerpo = Object.values(Body)[0];
                        }

                        for (let Column of Cuerpo) {
                            if (typeof Column === 'string') {
                                Tabla.SetCelda(bodyrow, Column);
                            }
                            else if (Column instanceof RoomJsx) {
                                Tabla.SetCelda(bodyrow, Column.TranspilarAContainer());
                            }
                            else {
                                let PropTd = this.ValidaTranspilarEstilos(Object.values(Column)[1]);

                                let valor = Object.values(Column)[0];
                                if (typeof valor === 'string') {
                                    Tabla.SetCelda(bodyrow, valor, PropTd);
                                }
                                else {
                                    Tabla.SetCelda(bodyrow, valor.TranspilarAContainer(), PropTd);
                                }
                            }

                        }
                        bodyrow++;
                    }
                }
                this.#Tabla = Tabla;
                this.#Container = this.#Tabla.GetContainer();
                return this.#Container;
            };
            const Grid = () => {
                let Grid = new Room.Helpers[Elemento.Type](Propiedades);
                if (Elemento.Rows) {

                    for (let Row of Elemento.Rows) {
                        let Fila;
                        if (Array.isArray(Row)) {
                            Grid.SetFila();
                            Fila = Row;
                        }
                        else {
                            let PropRow = this.ValidaTranspilarEstilos(Object.values(Row)[1]);
                            Grid.SetFila(PropRow);
                            Fila = Object.values(Row)[0];
                        }
                        //el elemento de la fila tiene que estar binculado con el elemento original

                        for (var Cell of Fila) {
                            if (typeof Cell === 'string') {
                                Grid.SetCelda("last", Cell);
                            }
                            else if (Cell instanceof RoomJsx) {
                                Grid.SetCelda("last", Cell.TranspilarAContainer());
                            }
                            else {

                                let PropTd = this.ValidaTranspilarEstilos(Object.values(Cell)[1]);
                                let valor = Object.values(Cell)[0];
                                if (typeof valor === 'string') {
                                    Grid.SetCelda("last", valor, PropTd);
                                }
                                else {
                                    Grid.SetCelda("last", valor.TranspilarAContainer(), PropTd);
                                }
                            }
                        }
                    }

                }
                this.#Grid = Grid;
                this.#Container = this.#Grid.GetContainer();
                return this.#Container;
            };

            Helpers["HInput"] = InputComun;
            Helpers["HPasword"] = InputComun;
            Helpers["HTextArea"] = InputComun;
            Helpers["HNumeric"] = InputComun;
            Helpers["HCalendar"] = InputComun;
            Helpers["HDateTime"] = InputComun;
            Helpers["HHours"] = InputComun;
            Helpers["HCheckBox"] = InputComun;
            Helpers["HFile"] = () => { return new Room.Helpers[Elemento.Type](Elemento.Name, Elemento.Title, Elemento.Required, Propiedades) };
            Helpers["HLink"] = () => { return new Room.Helpers[Elemento.Type](Elemento.Name, Elemento.Value, Propiedades, Elemento.Icon) };
            Helpers["HComboBox"] = () => { return new Room.Helpers[Elemento.Type](Elemento.Name, Elemento.Value, Elemento.Title, Elemento.Required, Elemento.Options, Propiedades) };
            Helpers["HButton"] = () => { return new Room.Helpers[Elemento.Type](Elemento.Name, Elemento.TypeButton, Elemento.Value, Propiedades, Elemento.Icon) };
            Helpers["HRadioButon"] = () => { return new Room.Helpers[Elemento.Type](Elemento.Name, Elemento.Value, Elemento.Title, Elemento.Required, Elemento.arrayRadio, Propiedades) };
            Helpers["HTabla"] = Tabla;
            Helpers["Grid"] = Grid;
            this.#Container = Helpers[Elemento.Type]();
            return this.#Container;
        }

        //-----------------------------Elemento normal---------------------------------
        let ElementoContainer = new Container([], Elemento.Type, Propiedades);

        //si es un array
        if (Array.isArray(Elemento.Content)) {
            for (const Child of Elemento.Content) {
                //si es un string o null lo agrega al container si no se transpila
                if (typeof Child === 'string' || Child === null || Child === undefined) {
                    ElementoContainer.Content.push(Child);
                } else {
                    ElementoContainer.Content.push(Child.TranspilarAContainer());
                }
            }
        }
        else {
            //si es un string o null lo agrega al container si no se transpila
            if (typeof Elemento.Content === 'string' || Elemento.Content === null || Elemento.Content === undefined) {
                ElementoContainer.Content.push(Elemento.Content);
            } else {
                ElementoContainer.Content.push(Elemento.Content.TranspilarAContainer());
            }
        }


        this.#Container = ElementoContainer;
        return this.#Container;
    }

    #RetranspilarAContainer() {
        let Elemento = Object.assign({}, this);
        Elemento = Object.assign({}, Elemento);
        let Propiedades = Object.assign({}, Elemento.Properties);
        if (Propiedades)
            Propiedades = this.ValidaTranspilarEstilos(Propiedades);

        if (Room.Helpers.hasOwnProperty(Elemento.Type)) {
            const Helpers = [];
            const InputComun = () => {
                let ElementoContainer = this.#Container;
                for (let key in Propiedades) {
                    ElementoContainer.Content[1].objectsHtml[key] = Propiedades[key];
                }
            };
            const InputComun2 = () => {
                let ElementoContainer = this.#Container;
                for (let key in Propiedades) {
                    ElementoContainer.Content[2].objectsHtml[key] = Propiedades[key];
                }
            };
            const InputRadio = () => {
                let ElementoContainer = this.#Container;
                for (let key in Propiedades) {
                    //ElementoContainer.Content[1].Content[0].Content[0]
                    for (let key2 in ElementoContainer.Content[1]) {
                        ElementoContainer.Content[1].Content[key2].Content[0].objectsHtml[key] = Propiedades[key];
                    }

                    //ElementoContainer.Content[1].objectsHtml[key] = Propiedades[key];
                }
            };

            const InputButton = () => {
                let ElementoContainer = this.#Container;
                ElementoContainer.Content = [];
                for (let key in Propiedades) {
                    ElementoContainer.objectsHtml[key] = Propiedades[key];
                }
            };

            const InputComboBox = () => {
                let ElementoContainer = this.#Container;
                for (let key in Propiedades) {
                    ElementoContainer.Content[1].objectsHtml[key] = Propiedades[key];
                }

                if (ElementoContainer.Content[1].Content.lengt != this.Options.length) {
                    ElementoContainer.Content[1].ElementDom.innerHTML = "";
                    ElementoContainer.Content[1].Content = [];
                    for (let Option of this.Options) {
                        ElementoContainer.Content[1].Content.push(new Container(Option.Texto, "option", { "value": Option.Valor }));
                    }

                }
            };

            const Tabla = () => {

                if (Propiedades.Ajax) {
                    Propiedades.class = "RoomJsxTable";
                    Propiedades.RoomJsxType = "Tabla";
                    Propiedades.onload = function () { this.CargarDatos(this); };
                    Propiedades.CargarDatos =
                        function ({ Filt = this.Filtros, Ord = this.Orders, Pag = this.PaginaActual } = this) {
                            let Elemento = this;
                            RoomJsx.TablaAyaxCargar(Elemento, Elemento.AjaxUrl, Filt, Ord, Pag);
                            Elemento.removeAttribute("AjaxUrl");
                        }

                }

                let Tabla = this.#Tabla;


                for (let key in Propiedades) {
                    Tabla.DivTabla.objectsHtml[key] = Propiedades[key];
                }

                if (Tabla.Encabesados.length < this.Headers.length) {

                    let headerrow = Tabla.Encabesados.length;
                    let Header = this.Headers[this.Headers.length - 1];
                    let Encabesado;
                    if (Array.isArray(Header)) {
                        Encabesado = Header;
                        Tabla.SetFilaHeader();
                    }
                    else {
                        let PropHeader = this.ValidaTranspilarEstilos(Object.values(Header)[1]);
                        Tabla.SetFilaHeader(PropHeader);
                        Encabesado = Object.values(Header)[0];
                    }

                    for (let Column of Encabesado) {

                        if (typeof Column === 'string') {
                            Tabla.SetCeldaHeader(headerrow, Column);
                        }
                        else if (Column instanceof RoomJsx) {
                            Tabla.SetCeldaHeader(headerrow, Column.TranspilarAContainer());
                        }
                        else {
                            let PropTh = this.ValidaTranspilarEstilos(Object.values(Column)[1]);

                            let valor = Object.values(Column)[0];
                            if (typeof valor === 'string') {
                                Tabla.SetCeldaHeader(headerrow, valor, PropTh);
                            }
                            else {
                                Tabla.SetCeldaHeader(headerrow, valor.TranspilarAContainer(), PropTh);
                            }
                        }
                    }
                }

                if (Tabla.Filas.length < this.Body.length) {
                    let bodyrow = Tabla.Filas.length;
                    let Body = this.Body[this.Body.length - 1];
                    let Cuerpo;
                    if (Array.isArray(Body)) {
                        Tabla.SetFila();
                        Cuerpo = Body;
                    }
                    else {
                        let PropBody = this.ValidaTranspilarEstilos(Object.values(Body)[1]);
                        Tabla.SetFila(PropBody);
                        Cuerpo = Object.values(Body)[0];
                    }

                    for (let Column of Cuerpo) {
                        if (typeof Column === 'string') {
                            Tabla.SetCelda(bodyrow, Column);
                        }
                        else if (Column instanceof RoomJsx) {
                            Tabla.SetCelda(bodyrow, Column.TranspilarAContainer());
                        }
                        else {
                            let PropTd = this.ValidaTranspilarEstilos(Object.values(Column)[1]);

                            let valor = Object.values(Column)[0];
                            if (typeof valor === 'string') {
                                Tabla.SetCelda(bodyrow, valor, PropTd);
                            }
                            else {
                                Tabla.SetCelda(bodyrow, valor.TranspilarAContainer(), PropTd);
                            }
                        }

                    }
                }
            };
            const Grid = () => {
                let Grid = this.#Grid;

                for (let key in Propiedades) {
                    Grid.Div.objectsHtml[key] = Propiedades[key];
                }
                Grid.Filas = []
                Grid.Div.Content = Grid.Filas;
                if (Elemento.Rows) {


                    for (let Row of Elemento.Rows) {
                        let Fila;
                        if (Array.isArray(Row)) {
                            Grid.SetFila();
                            Fila = Row;
                        }
                        else {
                            let PropRow = this.ValidaTranspilarEstilos(Object.values(Row)[1]);
                            Grid.SetFila(PropRow);
                            Fila = Object.values(Row)[0];
                        }
                        //el elemento de la fila tiene que estar binculado con el elemento original

                        for (var Cell of Fila) {
                            if (typeof Cell === 'string') {
                                Grid.SetCelda("last", Cell);
                            }
                            else if (Cell instanceof RoomJsx) {
                                Grid.SetCelda("last", Cell.TranspilarAContainer());
                            }
                            else {

                                let PropTd = this.ValidaTranspilarEstilos(Object.values(Cell)[1]);
                                let valor = Object.values(Cell)[0];
                                if (typeof valor === 'string') {
                                    Grid.SetCelda("last", valor, PropTd);
                                }
                                else {
                                    Grid.SetCelda("last", valor.TranspilarAContainer(), PropTd);
                                }
                            }
                        }
                    }

                }

            };

            Helpers["HInput"] = InputComun;
            Helpers["HPasword"] = InputComun;
            Helpers["HTextArea"] = InputComun;
            Helpers["HNumeric"] = InputComun;
            Helpers["HCalendar"] = InputComun;
            Helpers["HDateTime"] = InputComun;
            Helpers["HHours"] = InputComun;
            Helpers["HCheckBox"] = InputComun;
            Helpers["HFile"] = InputComun;
            Helpers["HLink"] = InputComun2;
            Helpers["HComboBox"] = InputComboBox;
            Helpers["HButton"] = InputButton;
            Helpers["HRadioButon"] = InputRadio;
            Helpers["HTabla"] = Tabla;
            Helpers["Grid"] = Grid;
            Helpers[Elemento.Type]();
            return;
        }
        //-----------------------------Elemento normal---------------------------------

        let ElementoContainer = this.#Container;
        if (typeof ElementoContainer.Content === 'string') {

        }
        if (Array.isArray(Elemento.Content)) {

        }
        else {

        }
        ElementoContainer.Content = [];
        for (let key in Propiedades) {
            ElementoContainer.objectsHtml[key] = Propiedades[key];
        }
        //si es un array
        if (Array.isArray(Elemento.Content)) {
            for (const Child of Elemento.Content) {
                //si es un string o null lo agrega al container si no se transpila
                if (typeof Child === 'string' || Child === null || Child === undefined) {
                    ElementoContainer.Content.push(Child);
                } else {
                    ElementoContainer.Content.push(Child.TranspilarAContainer());
                }
            }
        }
        else {
            //si es un string o null lo agrega al container si no se transpila
            if (typeof Elemento.Content === 'string' || Elemento.Content === null || Elemento.Content === undefined) {
                ElementoContainer.Content.push(Elemento.Content);
            } else {
                ElementoContainer.Content.push(Elemento.Content.TranspilarAContainer());
            }
        }

    }

    static EstilosBotonesPaginacion = {
        "width": "35px",
        "color": "white",
        "border-radius": "15px",
        "box-sizing": "border-box",
        "background-color": "#022b34"

    };

    static BusquedaPaginacion = (Elemnt, Pagina) => {
        let Elemento = Elemnt.parentElementSpecific("table");
        RoomJsx.TablaAyaxCargar(Elemento, Elemento.AjaxUrl, Elemento.Filtros, Elemento.Orders, Pagina);
    };

    static BusquedaFiltros = (Elemnt) => {
        Elemnt.Filtros = {};
        //agregar la clase RoomJsxFiltro
        Elemnt.classList.add("RoomJsxFiltro");
        Elemnt.addEventListener("change", function () {

            let Elemento = this.parentElementSpecific("table");
            //optenme todos los inputs con la clase RoomJsxFiltro
            let Filtros = Elemento.Filtros;

            let Elementos = document.querySelectorAll(".RoomJsxFiltro");
            for (let Elemento of Elementos) {
                Elemento.CargarFiltros();
                let FiltrosInput = Elemento.Filtros;

                for (let key in FiltrosInput) {
                    if (FiltrosInput[key] === "") {
                        delete Filtros[key];
                        continue;
                    }
                    Filtros[key] = FiltrosInput[key];
                }
            }


            RoomJsx.TablaAyaxCargar(Elemento, Elemento.AjaxUrl, Filtros, Elemento.Orders, 1);
        });
    };

    static OrdenarTabla = (Elemnt) => {
        Elemnt.Orders = {};
        Elemnt.Orden = Elemnt.Orden;
        Elemnt.classList.add("RoomJsxOrden");
        Elemnt.addEventListener("click", function () {
            let Elemento = this.parentElementSpecific("table");
            //optenme todos los inputs con la clase RoomJsxFiltro

            this.OrdenarTabla();

            RoomJsx.TablaAyaxCargar(Elemento, Elemento.AjaxUrl, Elemento.Filtros, this.Orders, 1);
        });
    }

    static async TablaAyaxCargar(Elemento, Url, Filtros, Orders, Pagina = 1) {

        if (Elemento === null) {
            console.error("No se encontro la tabla");
            return;
        }

        if (!Elemento.Pintar) {
            Elemento.Pintar = function () {
                RoomJsx.TablaAyaxCargar(this, this.AjaxUrl, this.Filtros, this.Orders, 1);
            };
        }

        //fetch a la url en AjaxUrl        
        Elemento.AjaxUrl = Url;
        Elemento.PaginaActual = parseInt(Pagina);
        Elemento.TotalPaginas = 0;
        Elemento.TotalRegistros = 0;
        Elemento.Filtros = Filtros;

        const Data = new FormData();
        Data.append('RoomJsxPaginaActual', Elemento.PaginaActual);
        Data.append('RoomJsxFiltros', JSON.stringify(Filtros));
        Data.append('RoomJsxOrders', JSON.stringify(Orders));

        let url = Elemento.AjaxUrl;
        let options = {
            method: 'POST',
            body: Data,

        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (data.error) {
                HAlerta("error", data.error);
                return;
            }
            if (!data.Rows) {
                HAlerta("error", "No se recibieron los datos de la tabla");
                return;
            }
            Elemento.PaginaActual = parseInt(data.PaginaActual);
            Elemento.TotalPaginas = parseInt(data.TotalPaginas);
            Elemento.TotalRegistros = parseInt(data.TotalRegistros);
            let Rows = [];
            for (let row of data.Rows) {
                let rowContainer = new RoomJsx({
                    "Type": "tr",
                    "Content": []
                });
                for (let cell of row) {
                    let cellContainer = new RoomJsx({
                        "Type": "td",
                        "Content": [cell]
                    });
                    rowContainer.Content.push(cellContainer);
                }

                Rows.push(rowContainer);
            }

            Elemento.querySelector("tbody").innerHTML = "";
            if (Elemento.querySelector("#ControlesPaginacion"))
                Elemento.querySelector("#ControlesPaginacion").remove();
            //Cargar un titulo desues de la tabla

            let ControlesPaginacion = new RoomJsx({
                "Type": "Grid",
                "Rows": [],
                "Properties": {
                    "id": "ControlesPaginacion",
                    "style": {
                        "margin-top": "10px",
                        "width": "100%",
                        "position": "absolute",
                    }
                }
            });


            let TituloTotalRegistros = new RoomJsx({
                "Type": "h7",
                "Content": `Total de registros: ${Elemento.TotalRegistros}`,
                "Properties": {
                    "style": {
                        "margin-right": "20px"
                    }
                }
            });

            let TituloTotalPaginas = new RoomJsx({
                "Type": "h7",
                "Content": `Total de paginas: ${Elemento.TotalPaginas}`,
                "Properties": {
                    "style": {
                        "margin-right": "20px"
                    }
                }
            });

            let Controles = new RoomJsx({
                "Type": "div",
                "Content": [],
                "Properties": {
                    "style": {
                        "right": "0px",
                    }
                }
            });
            if (Elemento.TotalPaginas > 1) {


                const BotonPaginacion = (valor, funcion) => {
                    return new RoomJsx({
                        "Type": "HButton",
                        "Name": "",
                        "TypeButton": "button",
                        "Value": valor,
                        "Icon": "",
                        "Properties": {
                            "style": RoomJsx.EstilosBotonesPaginacion,
                            "onclick": `${funcion}`,
                            "CargarDatos": RoomJsx.BusquedaPaginacion
                        }
                    });
                }


                const Paginacion = [];

                if (Elemento.PaginaActual > 1) {
                    Paginacion.push(BotonPaginacion("<< ", `this.CargarDatos(this,1);`));

                    Paginacion.push(BotonPaginacion("<", `this.CargarDatos(this,${Elemento.PaginaActual - 1});`));
                }

                // Paginas de la izquierda
                for (let index = Elemento.PaginaActual - 2; index < Elemento.PaginaActual; index++) {
                    if (index < 1) {
                        continue;
                    }
                    Paginacion.push(BotonPaginacion(index, `this.CargarDatos(this,${index});`));
                }

                Paginacion.push(BotonPaginacion("[" + Elemento.PaginaActual + "]", ``));

                // Paginas de la derecha
                for (let index = Elemento.PaginaActual + 1; index < Elemento.PaginaActual + 3; index++) {
                    if (index > Elemento.TotalPaginas) {
                        break;
                    }
                    Paginacion.push(BotonPaginacion(index, `this.CargarDatos(this,${index});`));
                }

                if (Elemento.PaginaActual < Elemento.TotalPaginas) {
                    Paginacion.push(BotonPaginacion(">", `this.CargarDatos(this,${Elemento.PaginaActual + 1});`));

                    Paginacion.push(BotonPaginacion(">>", `this.CargarDatos(this,${Elemento.TotalPaginas});`));
                }


                for (let ButtonPagina of Paginacion) {
                    Controles.Content.push(ButtonPagina);
                }
                //Controles.Content = ArrayControles;
            }


            ControlesPaginacion.Rows = [
                RoomJsx.AddPropiedades([TituloTotalRegistros, TituloTotalPaginas, Controles], { "style": { "display": "inline-flex" } })

            ];
            ControlesPaginacion.Write(Elemento, "beforeend");

            for (let row of Rows) {
                row.Write(Elemento.querySelector("tbody"));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    Write(query = "body", position) {
        let Elemento = this.TranspilarAContainer();
        Elemento.Write(query, position);
    }

    Html() {
        let Elemento = this.TranspilarAContainer();
        return Elemento.Html();
    }

    GetElementDom() {
        const Helpers = [];
        //si Type es HInput, HPasword, HTextArea, HNumeric, HCalendar, HDateTime, HHours, HCheckBox, HFile
        const InputComun = () => { return this.#Container.Content[1].ElementDom; };
        const InputComun2 = () => { return this.#Container.Content[2].ElementDom; };
        const InputRadio = () => { return this.#Container.Content[1].Content[0].Content[0].ElementDom; };
        const InputButton = () => { return this.#Container.ElementDom; };
        //Todos los demas
        const Demas = () => { return this.#Container.ElementDom; };

        Helpers["HInput"] = InputComun;
        Helpers["HPasword"] = InputComun;
        Helpers["HTextArea"] = InputComun;
        Helpers["HNumeric"] = InputComun;
        Helpers["HCalendar"] = InputComun;
        Helpers["HDateTime"] = InputComun;
        Helpers["HHours"] = InputComun;
        Helpers["HCheckBox"] = InputComun;
        Helpers["HFile"] = InputComun;
        Helpers["HLink"] = InputComun2;
        Helpers["HComboBox"] = InputComun;
        Helpers["HButton"] = InputButton;
        Helpers["HRadioButon"] = InputRadio;
        Helpers["HTabla"] = Demas;
        Helpers["Grid"] = Demas;
        //Si Type no es un indice de Helpers se lanza un error
        if (!Helpers.hasOwnProperty(this.Type)) {

            return Demas();
        }
        return Helpers[this.Type]();

    }



}

class RoomJsxAndPropiedades {
    _ = null;
    Propiedades = null;
    constructor(_, Propiedades) {
        this._ = _;
        this.Propiedades = Propiedades;
    }
}
