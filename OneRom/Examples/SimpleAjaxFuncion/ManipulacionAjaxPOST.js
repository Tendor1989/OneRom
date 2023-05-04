 function main() {
    Debug = true;
    
    SingleGetControls = true;
    var Boton = Door.BotonAjax;

    function CargarContenido() {
        var Dataform= new FormData();
        Dataform.append("Paramentro","Esto es un texto por medio de ajax");

        var Success = function (Result) {
            if(Result.Type=='Info'){
                alert(Result.Mensaje);
            }
            

        }

        var Call = new Ajax("POST.php", null, Dataform);
        
        Call.Send();

    }

    Boton.onclick = CargarContenido;
}