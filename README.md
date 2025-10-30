===========================
🧪 PASO A PASO DE PRUEBAS - POSTMAN (PUERTO 3000)
===========================

1️⃣ REGISTRO DE USUARIO NORMAL
---------------------------
POST http://localhost:3000/auth/register
Body (JSON):
{
  "first_name": "Hugo",
  "last_name": "Martinez",
  "email": "hugog@mail.com",
  "age": 30,
  "password": "1234"
}
✅ Crea correctamente el usuario.

2️⃣ ACTUALIZAR DATOS DEL USUARIO
---------------------------
PUT http://localhost:3000/users/:uid
Body (JSON):
{
  "age": 35
}
✅ La edad se actualiza correctamente.

3️⃣ ELIMINAR USUARIO
---------------------------
DELETE http://localhost:3000/users/:uid
✅ El usuario se elimina correctamente de la base de datos.

4️⃣ LOGIN CON USUARIO ADMIN (datos provistos en .env)
---------------------------
POST http://localhost:3000/auth/login
Body (JSON):
{
  "email": "admin@mail.com",
  "password": "admin123"
}
✅ Devuelve cookie JWT del admin.
✅ Solo el admin puede crear, actualizar o eliminar productos.

5️⃣ VALIDAR SESIÓN ACTUAL (/auth/me)
---------------------------
GET http://localhost:3000/auth/me
✅ Devuelve DTO del usuario actual sin contraseña ni datos sensibles.

6️⃣ CRUD DE PRODUCTOS (ADMIN)
---------------------------
Crear producto:
POST http://localhost:3000/products
Body (JSON):
{
  "title": "Café Programador",
  "description": "Café premium para coders",
  "price": 1200,
  "stock": 5,
  "category": "bebidas"
}

Listar productos:
GET http://localhost:3000/products

Actualizar producto:
PUT http://localhost:3000/products/:pid
Body (JSON):
{
  "price": 1500
}

Eliminar producto:
DELETE http://localhost:3000/products/:pid
✅ Solo el admin puede usar estos endpoints.

7️⃣ LOGIN CON USUARIO NORMAL
---------------------------
POST http://localhost:3000/auth/login
Body (JSON):
{
  "email": "hugog@mail.com",
  "password": "1234"
}
✅ Usuario logueado correctamente.

8️⃣ CARRITO (USUARIO)
---------------------------
Crear carrito:
POST http://localhost:3000/carts
Body (JSON):
{
  "user": "hugog@mail.com"
}

Agregar producto al carrito:
POST http://localhost:3000/carts/:cid/product/:pid
Body (JSON):
{
  "quantity": 2
}

Ver carrito:
GET http://localhost:3000/carts/:cid

Actualizar cantidad de producto en carrito:
PUT http://localhost:3000/carts/:cid/product/:pid
Body (JSON):
{
  "qty": 4
}

Eliminar producto del carrito:
DELETE http://localhost:3000/carts/:cid/product/:pid

9️⃣ FINALIZAR COMPRA (STOCK DISPONIBLE)
---------------------------
POST http://localhost:3000/carts/:cid/purchase
✅ Si hay stock suficiente:
   - Genera Ticket (colección `tickets`)
   - Genera Order (colección `orders`)
   - Descuenta stock del producto
   - Envía mail al comprador
   - Envía SMS y WhatsApp (si Twilio está configurado)
✅ Si algún producto no tiene stock → devuelve arreglo con los que fallaron y los deja en el carrito.

🔟 VERIFICAR EN BASE DE DATOS
---------------------------
Colección: `tickets`   
Colección: `orders` 


1️⃣1️⃣ ACTUALIZAR ESTADO DE ORDER
---------------------------
PUT http://localhost:3000/orders/:code/status
Body (JSON):
{
  "status": "delivered"
}
✅ Cambia el estado correctamente.

1️⃣2️⃣ FORZAR ERROR DE STOCK (PRUEBA DE VERIFICACIÓN)
---------------------------
Crear producto con poco stock:
POST http://localhost:3000/products
Body (JSON):
{
  "title": "Café sin stock",
  "description": "Café agotado",
  "price": 800,
  "stock": 1,
  "category": "bebidas"
}

Agregarlo al carrito:
POST http://localhost:3000/carts/:cid/product/:pid
Body (JSON):
{
  "quantity": 3
}

Finalizar compra:
POST http://localhost:3000/carts/:cid/purchase
✅ Devuelve mensaje con productos no procesados:
{
  "message": "Compra no realizada. Verificar stock de los productos.",
  "notPurchasable": [ ... ]
}

===========================
✅ FIN DE PRUEBAS
===========================

