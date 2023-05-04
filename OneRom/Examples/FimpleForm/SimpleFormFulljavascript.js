function main() {
    //crea un simpre form con la libreria OneRom

    var Nombre = Room.Helpers.HInput("Nombre", "", "Nombre:", true, { "maxlength": 15 });
    var Apellidos = Room.Helpers.HInput("Apellidos", "", "Apellidos:", false, { "maxlength": 10 });
    var Sexo = Room.Helpers.HComboBox("Sexo", "", "Sexo:", true, [{ "Valor": "M", "Texto": "Mujer" }, { "Valor": "H", "Texto": "Hombre" }]);
    var Identificacion = Room.Helpers.HFile("Archivo", "Identificacion:", false, { "accept": "image/*" , "style": "border:1px solid #ccc"});
    var Boton = Room.Helpers.HButton("Boton", "button", "Enviar", { "onclick":"MostrarValores();", "class": "btn btn-primary" });

    var Formulario = new Room.Helpers.Grid();
    Formulario.SetFila({ "class": "row" });
    Formulario.SetCelda("last", Nombre , { "style": "width:200px" });
    Formulario.SetCelda("last", Apellidos, { "style": "width:200px" });
    Formulario.SetCelda("last", Sexo, { "style": "width:200px" });
    Formulario.SetCelda("last", Identificacion, { "style": "width:200px" });
    Formulario.SetCelda("last", Boton, { "style": "margin-top:15px" });

    Room.Components.formulario.Paint(Formulario,false,false);
}

async function MostrarValores() {
    HAlerta("info","Tu nombre es: " + Door.Nombre);
    await sleep(200);
    HAlerta("info","Tus apellidos son:" + Door.Apellidos)
    await sleep(200);
    var Genero = Door.Sexo == "H" ? "Hombre" : "Mujer";
    HAlerta("error","Tu genero es: " + Genero);
    await sleep(200);

}

