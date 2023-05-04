function main() {

    Debug = true;
    SingleGetControls = true;
    var Boton = Door.BotonAjax;

    Boton.onclick = CargarContenido;
}

function CargarContenido() {
    //var Dataform= new FormData();
    //Dataform.append("Id",10);

    var Success = function (Result) {
        SingleGetControls = true;
        var Div = Door.DivAjax;

        Div.innerHTML = Result;

    }

    var Call = new Ajax("GET.txt", null, Success, "GET", false);

    Call.Send();

}