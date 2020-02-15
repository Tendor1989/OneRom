<?php


$MensajeSalida = new Mensaje();
$MensajeSalida->Mensaje="Mensaje recibido". $_POST["Paramentro"];
$MensajeSalida->Type="Info";

echo json_encode($MensajeSalida);



class Mensaje
{
    var $Mensaje="";
    
    var $Type="Info";
    
}