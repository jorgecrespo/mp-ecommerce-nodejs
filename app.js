var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
var bodyParser = require('body-parser')
const fetch = require("node-fetch");

// Mercado Pago
var mercadoPagoUrl = "https://api.mercadopago.com/checkout";
var access_token = "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398" 

var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true}))
 
// parse application/json
app.use(bodyParser.json())
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/pago-exitoso', function (req, res) {
    res.send('Pago exitoso');
});

app.get('/pago-pendiente', function (req, res) {
    res.send('pago-pendiente');
});

app.get('/pago-error', function (req, res) {
    res.send('pago con error');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.post('/api/getlink', async (req, res) => {
    // console.log(req.body)
     const { title, price, unit, img } = req.body; 
    // console.log(title, price, unit, img)

    // res.json({respuesta:"hola"})

    const items = [
        {
          id: "1234", 
  // id interno (del negocio) del item
          title: title, 
  // nombre que viene de la prop que recibe del controller
          description: "Dispositivo movil de Tienda e-commerce",
   // descripción del producto
          picture_url: img, 
  // url de la imágen del producto
          category_id: "1234",  
  // categoría interna del producto (del negocio)
          quantity: parseInt(unit), 
  // cantidad, que tiene que ser un intiger
          currency_id: "ARS", 
  // id de la moneda, que tiene que ser en ISO 4217
          unit_price: parseFloat(price)
   // el precio, que por su complejidad tiene que ser tipo FLOAT
        }
      ]; 



      const preferences = { 
        // declaramos las preferencias de pago
              items, 
        // el array de objetos, items que declaramos más arriba
              external_reference: "jorgeluiscrespo@gmail.com", 
        // referencia para identificar la preferencia, puede ser practicamente cualquier valor
              payer: { 
        // información del comprador, si estan en producción tienen que //traerlos del request
        //(al igual que hicimos con el precio del item) 
                name: "Lalo",
                surname: "Landa",
                email: "test_user_63274575@testuser.com",
         // si estan en sandbox, aca tienen que poner el email de SU usuario de prueba
                phone: {
                  area_code: "11",
                  number: "22223333"
                },
                address: {
                  zip_code: "1111",
                  street_name: "False",
                  street_number: "123"
                }
              }, 
              payment_methods: { 
        // declaramos el método de pago y sus restricciones
                excluded_payment_methods: [ 
        // aca podemos excluir metodos de pagos, tengan en cuenta que es un array de objetos
                  {
                    id: "amex"
                  }
                ],
                excluded_payment_types: [{ id: "atm" }], 
        // aca podemos excluir TIPOS de pagos, es un array de objetos
                installments: 6, 
        // limite superior de cantidad de cuotas permitidas
                default_installments: 6 
        // la cantidad de cuotas que van a aparecer por defecto
              }, 
              back_urls: {
        // declaramos las urls de redireccionamiento
                success: "https://jorgecrespo-mp-commerce-nodejs.herokuapp.com/pago-exitoso", 
        // url que va a redireccionar si sale todo bien
                pending: "https://jorgecrespo-mp-commerce-nodejs.herokuapp.com/pago-pendiente", 
        // url a la que va a redireccionar si decide pagar en efectivo por ejemplo
                failure: "https://jorgecrespo-mp-commerce-nodejs.herokuapp.com/pago-error" 
        // url a la que va a redireccionar si falla el pago
              }, 
              notification_url: "https://mercadopago-checkout.herokuapp.com/webhook", 
        // declaramos nuestra url donde recibiremos las notificaciones
              auto_return: "approved" 
        // si la compra es exitosa automaticamente redirige a "success" de back_urls
            };
        
        //     try {
        //       const request =  axios.post(url, preferences, {
        //  // hacemos el POST a la url que declaramos arriba, con las preferencias
        //         headers: { 
        // // y el header, que contiene content-Type
        //           "Content-Type": "application/json"
        //         }
        //       });
        
        //       return request.data; 
        // // devolvemos la data que devuelve el POST
        //     } catch (e) {
        //       console.log(e); 
        // // mostramos error en caso de que falle el POST
        //     }
        var url = `${mercadoPagoUrl}/preferences?access_token=${access_token}`;
        var init_point = await fetch(url, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(preferences), // data can be `string` or {object}!
            headers:{
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
          .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response)
            return response.init_point
        });

        res.redirect(init_point)











})


app.listen(port);