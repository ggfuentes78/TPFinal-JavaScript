var tipoDeCambioUSD //tipo de cambio de la moneda Dolares
var productos=[];
const alicImpPais = 0.3; //alicuota impuesto PAIS
const retGanancias4815 = 0.35; //alicuota Retencion Impuesto a la Ganancias
const productosJSON= "data/productos.json" //ubicacion y nombre del archivo JSON con los Productos ofrecidos
const urlAPIDolar="https://api.bluelytics.com.ar/v2/latest"
var productosCarrito;
var totalImpuestoPais=0;
var totalImpuesto4815=0;
var totalCarrito=0;
var importeaPagar = 0;
var nombreProductoCarrito='';
var carritoJSON= localStorage.getItem('carrito');
var cantidadItemsCarrito= 0
const accessTokenMP= 'TEST-3260073853992182-102617-5f3296c12b40d41df8164d0251a88f80-113591'

fetch(urlAPIDolar) //API para conseguir la cotizacion actual del dolar
.then( (res)=> res.json())
.then( (data)=>{
  tipoDeCambioUSD=data.oficial.value_sell
  console.log(tipoDeCambioUSD);

if (carritoJSON != null){  //si hay datos del carrito en el local storage los traigo a la sesion actual
  console.log(carritoJSON)
  var carrito=JSON.parse(carritoJSON);
  console.log(carrito)
}else{
  var carrito=[];
}
const contenedorPaquetes = document.getElementById('paquetes');
const contenedorActividades= document.getElementById('actividades');
const contenedorAdicionales= document.getElementById('adicionales');

function crearTarjetasProductos(productos){ //Funcion para armar las tarjetas de los productos ofrecidos en forma dinamica 
  productos.forEach((producto)=> {
    const div = document.createElement('div');
    div.className = "tarjeta";
    div.style ="width: 30%"
    div.innerHTML = `
                    <div class="card-body">
                    <img src= "${producto.img}" class="card-img" alt="${producto.nombreProducto}">
                      <h5 class="card-title">${producto.nombreProducto}</h5>
                      <p class="card-text">${producto.descripcion}</p>
                      <p id="txtPrecio${producto.idProducto}" class="card-text negrita centrado">U$S${producto.precioUSD}</p>
                      <div class="input-group mb-3 btnCentrado">
                        <button id="cantMenos${producto.idProducto}" class="btn btn-outline-secondary inputCantidad" type="button">-</button>
                        <input type="text" id="cant${producto.idProducto}" class="inputCantidad" aria-label="Cantidad" value=1 disabled>
                        <button id="cantMas${producto.idProducto}" class="btn btn-outline-secondary inputCantidad" type="button">+</button>
                      </div>
                      <button type="button" id="btnCompra${producto.idProducto}" class="btn btn-primary btnCentrado">Comprar</button>
                      </div>
                    </div>
                    `
    switch (producto.tipoProducto){  // segun el tipo de producto la tarjeta se crea en distintas secciones
      case 'P':                
        contenedorPaquetes.appendChild(div);
        break;
      case 'A':
        contenedorActividades.appendChild(div);
        break;
      case 'E':
        contenedorAdicionales.appendChild(div);
        break;
    }
    
    $(`#cantMenos${producto.idProducto}`).click(()=>{ //Boton para bajar la cantidad a comprar
      var q= $(`#cant${producto.idProducto}`).val();
      console.log (q);
      q--;
      if (q<1){
        $(`#cantMenos${producto.idProducto}`).prop('disabled', true);
        $(`#btnCompra${producto.idProducto}`).prop('disabled', true);
      };
      if (q<9){
        $(`#cantMas${producto.idProducto}`).prop('disabled', false);
      }
      $(`#cant${producto.idProducto}`).val(q);
    })

    $(`#cantMas${producto.idProducto}`).click(()=>{ //boton para aumentar la cantidad a comprar
      var q= $(`#cant${producto.idProducto}`).val();
      console.log (q);
      q++;
      if (q==9){
        $(`#cantMas${producto.idProducto}`).prop('disabled', true); //se habilitan o inhabilitan los botones de cantidad y comprar ( se pueden comprar entre 1 y 9)
      };
      if (q>0){
          $(`#cantMenos${producto.idProducto}`).prop('disabled', false);
          $(`#btnCompra${producto.idProducto}`).prop('disabled', false);
        };
      $(`#cant${producto.idProducto}`).val(q);
    })

    $(`#btnCompra${producto.idProducto}`).on('click', ()=>{ //boton para agregar el producto al carrito
      cant=$(`#cant${producto.idProducto}`).val()
      console.log(cant)
      agregarItem(producto.idProducto, cant)
    }); 

  });
  $('div#cargando').fadeOut();
};

function agregarItem(itemCarrito, cant){ //funcion para agregar  items al carrito
  var buscarItem = productos.find(producto => producto.idProducto === itemCarrito);
  carrito.push(new ModeladorCarrito(buscarItem.idProducto, buscarItem.nombreProducto, cant,buscarItem.precioUSD, tipoDeCambioUSD));
  $('#btnCarrito').addClass("elementoActivo");
  carritoJSON=JSON.stringify(carrito);
  console.log(carritoJSON);
  localStorage.setItem('carrito',carritoJSON);
  cantidadItemsCarrito=carrito.length
  $('#cantItems').text(`${cantidadItemsCarrito}`)
}

function borrarItem(itemCarrito){ //funcion para borrar items del carrito
  var indiceItem = itemCarrito;
  console.log(carrito.length)
  console.log(indiceItem)
  carrito.splice(indiceItem, 1);
  carritoJSON=JSON.stringify(carrito);
  localStorage.setItem('carrito',carritoJSON);
  cantidadItemsCarrito=carrito.length
  $('#cantItems').text(`${cantidadItemsCarrito}`)
  if (carrito.length==0){
    $('#btnCarrito').removeClass('elementoActivo');
    localStorage.clear();
    
  }

}

class ModeladorCarrito{  
  constructor (pidProducto, pnombreProducto, pcantidad, pPrecioUSD, pcotizacion){
      this.idProducto=pidProducto;
      this.nombreProducto=pnombreProducto;
      this.precioUSD=pPrecioUSD;
      this.cantidad=pcantidad; 
      this.cotizacion=pcotizacion;
      this.precioPesosUnitario=parseFloat((this.precioUSD*this.cotizacion).toFixed(2));
      this.impuesto4815Unitario= parseFloat((this.precioPesosUnitario * retGanancias4815).toFixed(2));
      this.impuestoPaisUnitario= parseFloat((this.precioPesosUnitario * alicImpPais).toFixed(2));
      this.importeTotal= (this.precioPesosUnitario + this.impuestoPaisUnitario + this.impuesto4815Unitario)*this.cantidad;
  }
};


$.getJSON('./data/productos.json',(res)=>{ // carga de productos desde archivo json
  
  productos= res
  crearTarjetasProductos(productos)

})
.fail(()=>{  // como la carga desde un archivo json como file desde el local host fallaba en todos los navegadores (menos firefox), agregue los datos estaticos para que se carguen desde el script solo en caso de falla
  console.log('Falla de carga de archivo JSON. Se cargan productos definidos en script')
  productos = [{img:'img/assistcard.png', idProducto: 'E1', tipoProducto:'E',nombreProducto:'Seguro medico Assist-Card', precioUSD:'100', descripcion:'Cobertura medica por la totalidad del viaje. Incluye seguro COVID19.'},
               {img:'img/disney.jpg', idProducto: 'P1', tipoProducto:'P' , nombreProducto: 'Disney Magico', precioUSD: 500, descripcion: '8 dias 7 noches en Orlando con 6 dias de acceso a parques Disney'},
               {img:'img/universal.jpg', idProducto: 'P2',tipoProducto:'P' ,nombreProducto: 'Disney + Universal', precioUSD: 1000, descripcion: '10 dias 9 noches en Orlando con 6 dias de acceso a parques Disney y 3 a Universal Orlando'},
               {img:'img/BuschGardensTampa.jpg', idProducto:'P3', tipoProducto:'P' ,nombreProducto: 'Disney + Universal + Busch Garden', precioUSD: 1500, descripcion: '12 dias 11 noches en Orlando con 6 dias de acceso a parques Disney, 3 a Universal Orlando y 1 a Busch Gardes en Tampa'},
               {img:'img/legoland.jfif' , idProducto:'A1', tipoProducto:'A', nombreProducto: 'Entradas Legoland', precioUSD:'85', descripcion: 'Entradas parque Legoland'},
               {img:'img/seaworld.jfif', idProducto:'A2', tipoProducto:'A', nombreProducto: 'Entradas SeaWorld', precioUSD:'90', descripcion: 'Entradas parque SeaWorld'},
               {img:'img/busch.jfif', idProducto:'A3', tipoProducto:'A', nombreProducto: 'Entradas Busch Gardens Tampa', precioUSD:'120', descripcion: 'Entradas parque Busch Gardens Tampa'},
               {img:'img/medievaltimes.jfif', idProducto:'A4', tipoProducto:'A', nombreProducto: 'Cena Medieval Times', precioUSD:'65', descripcion: 'Cena en restaurant tematico Medieval Times'},
               {img:'img/orlandoeye.jfif', idProducto:'A5', tipoProducto:'A', nombreProducto: 'Orlando Eye', precioUSD:'25', descripcion: 'Vuelta al mundo Orlando Eye'},
               {img:'img/titanic.jfif', idProducto:'A6', tipoProducto:'A', nombreProducto: 'Titanic: First Class Dinner Gala', precioUSD:'70', descripcion: 'Experiencia Titanic'}]
             // Array con los Productos ofrecidos
             // P=Paquete
             // A=Actividad
             // E=Extra});
  crearTarjetasProductos(productos)
}); 


$('#modalCarrito').append(`<div id="carrito" class="carrito"></div>`);
if (carritoJSON!=null){
  $('#btnCarrito').addClass("elementoActivo");
  cantidadItemsCarrito=carrito.length
  $('#cantItems').text(`${cantidadItemsCarrito}`)
}

$('#btnCarrito').on('click', () => {

    if (carrito!=[]){
      productosCarrito='';
      totalImpuestoPais=0;
      totalImpuesto4815=0;
      totalCarrito=0;
      let indexCarrito=0
      $('#modalCarrito').addClass('elementoActivo');
      $('#carrito').html(`
            <h5>Su Compra</h5>
            <hr>    
            `);
      carrito.forEach((producto)=>{

        $('#carrito').append(`<p>${producto.cantidad} X <strong>${producto.nombreProducto}</strong>  $${producto.precioPesosUnitario*producto.cantidad} <img src="img/trashbin25.png" alt="borrar elemento" id="btnBorrar${indexCarrito}" class="elementoClickeable"></p>
        `)
        let indice=indexCarrito
        $(`#btnBorrar${indexCarrito}`).on('click', (event)=>{
          borrarItem(indice);
          if (carrito.length>0){
            event.stopPropagation();
            $('#btnCarrito').trigger('click')
          }

        });
        totalImpuestoPais= totalImpuestoPais+(producto.impuestoPaisUnitario*producto.cantidad);
        console.log(producto.impuestoPaisUnitario+'aaa')
        console.log(carrito)
        console.log(totalImpuestoPais)
        totalImpuesto4815=totalImpuesto4815+(producto.impuesto4815Unitario*producto.cantidad);
        totalCarrito+=producto.importeTotal
        indexCarrito++
      });
      $('#carrito').append(`<p>Impuesto Pais: $${totalImpuestoPais.toFixed(2)}</p>
                <p>Ret IG 4815: $${totalImpuesto4815.toFixed(2)}</p>
                <p>Total: $${totalCarrito.toFixed(2)}</p>
                <button type="button" id="btnBorrarCarrito" class="btn btn-danger">Borrar todo</button>
                <button type="button" id="btnPagar" class="btn btn-success">Comprar</button>
      `);
      $('#btnBorrarCarrito').on('click', () =>{
        carrito=[];
        carritoJSON='';
        localStorage.clear();
        $('#btnCarrito').removeClass("elementoActivo")
      });
    };
  $('#btnPagar').click(()=>{pagarCompraMP()});
});

$('#modalCarrito').on('click', ()=>{
  $('#modalCarrito').removeClass('elementoActivo')
})

console.log (carrito); // log para verificar los datos del carrito

$('#moneda').change(()=>{ // cuando cambia la moneda seleccionada se modifica el precio de las tarjetas de producto
  var valorSeleccionado=($('#moneda').children(":selected").text())
  productos.forEach((producto)=>{
    switch (valorSeleccionado){
      case "USD":
        console.log ('eligio usd')
        $(`#txtPrecio${producto.idProducto}`).fadeOut(300, ()=>{$(`#txtPrecio${producto.idProducto}`).text(`U$S${producto.precioUSD}`)})
          .fadeIn();
        break;
      case "ARS":
        console.log ('eligio ars')
        $(`#txtPrecio${producto.idProducto}`).fadeOut(300, ()=>{$(`#txtPrecio${producto.idProducto}`).text(`$${producto.precioUSD*tipoDeCambioUSD}`)})
          .fadeIn();
        break;
    }
  });
})

const pagarCompraMP = () =>{ //generacion del link de pago y redireccionamiento a Mercado Pago para finalizar la compra
  
  const carritoToMP = carrito.map((prod)=> {
    return{
      title: prod.nombreProducto,
      description: "",
      picture_url: "",
      category_id: prod.idProducto,
      quantity: prod.cantidad,
      currency_id: "ARS",
      unit_price: parseFloat((prod.precioPesosUnitario+prod.impuesto4815Unitario+prod.impuestoPaisUnitario).toFixed(2))
    }
  })
 console.log(carritoToMP)
  fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {Authorization: "Bearer TEST-3260073853992182-102617-5f3296c12b40d41df8164d0251a88f80-113591" 
    },
    body: JSON.stringify ({
            items: carritoToMP,
            back_urls: {
              success: window.location.href,
              failure: window.location.href
            }
    })
  })
    .then(res => res.json())
    .then(data=>{
      console.log(data)
      window.location.replace(data.init_point)
    })
}

})
































