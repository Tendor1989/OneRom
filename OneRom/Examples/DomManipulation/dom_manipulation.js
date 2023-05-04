window.onload = async function () {
    await sleep(100);
    console.log("entra");
    SingleGetControls = true;
    var Nombre = Door.Nombre;
    SingleGetControls = true;
    var Apellidos = Door.Apellidos;


    Nombre.placeholder = 'fist name';
    Apellidos.placeholder = 'last name';

    //Campos obligatorios
    MultiGetControls = true;
    var EtiquetaNombre = Door.lblNombre;
    var EtiquetaApellitos = Door.lblApellidos;
    var EtiquetaSexo = Door.lblSexo;
    MultiGetControls = false;

    EtiquetaNombre.textContent = EtiquetaNombre.textContent + "*:";
    EtiquetaApellitos.textContent = EtiquetaApellitos.textContent + "*:";
    EtiquetaSexo.textContent = EtiquetaSexo.textContent + "*:";
}