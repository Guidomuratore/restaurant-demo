# Guía de Despliegue en Producción (Raspberry Pi + Docker)

Esta guía te ayudará a subir tu aplicación web a tu servidor Raspberry Pi utilizando Docker.

## 1. Preparación en n8n ⚙️

Antes de subir la web, debemos asegurarnos de que n8n apunte a tu dominio real y no a `localhost`.

1.  Abre tu flujo de n8n.
2.  Edita el nodo **Code** donde defines las `back_urls`.
3.  Actualiza las URLs así:

```javascript
back_urls: {
    success: "https://demo-restaurant.guidomuratore.com.ar/pago-exitoso",
    failure: "https://demo-restaurant.guidomuratore.com.ar/pago-fallido",
    pending: "https://demo-restaurant.guidomuratore.com.ar/pago-pendiente"
},
// auto_return: "approved" // Puedes descomentarlo si quieres retorno automático
```

## 2. Configurar Git (Si es la primera vez) 🆕

Como no tienes el repositorio vinculado aún, sigue estos pasos:

1.  Crea un **Nuevo Repositorio** vacío en tu GitHub/GitLab.
2.  En tu terminal (VS Code), vincula tu PC con ese repo:
    ```bash
    git remote add origin https://github.com/Guidomuratore/restaurant-demo.git
    git branch -M main
    git add .
    git commit -m "Primer deploy a producción"
    git push -u origin main
    ```

## 3. Desplegar en Raspberry Pi 🍓

Conéctate a tu Raspberry Pi.

**Opción A: Si es la primera vez (Clonar):**
```bash
git clone https://github.com/Guidomuratore/restaurant-demo.git restaurant-demo
cd restaurant-demo
docker-compose up -d --build
```

**Opción B: Si ya existía (Actualizar):**
```bash
cd restaurant-demo
git pull
docker-compose up -d --build
```

3.  **Verificar:**
    Ejecuta `docker ps` y asegúrate de ver `restaurant-demo` corriendo y escuchando en el puerto `4200`.

## 4. Configurar Nginx Proxy Manager (NPM) 🌐

Entra a tu panel de Nginx Proxy Manager (usualmente puerto 81).

1.  **Add Proxy Host**:
    *   **Domain Names**: `demo-restaurant.guidomuratore.com.ar`
    *   **Scheme**: `http`
    *   **Forward Host**: `host.docker.internal` (o la IP local de tu RPi, ej: `192.168.1.X`)
    *   **Forward Port**: `4200`
    *   **Publicly Accessible**: A tu gusto (On).

2.  **SSL**:
    *   Pestaña SSL -> Request a new SSL Certificate (Let's Encrypt).
    *   Activa **Force SSL** y **HTTP/2 Support**.

3.  ¡Guardar y listo!

Ahora tu web debería estar accesible en `https://demo-restaurant.guidomuratore.com.ar`. 🚀

## 5. Solución de Problemas y Pruebas (MercadoPago) ⚠️

**IMPORTANTE:** Si estás probando pagos y recibes errores "Fatal" o rechazos:

1.  **Credenciales:** Usa tus credenciales de **TEST** (`APP_USR-...`) en n8n.
2.  **URL:** Usa la URL de **Producción** (`init_point`), **NO** la de Sandbox (`sandbox_init_point`).
3.  **Navegador:** Abre el link de pago SIEMPRE en **Modo Incógnito**.
4.  **Email:** Usa un email falso (ej: `test@test.com`), **NUNCA** tu email real de MercadoPago.
5.  **Tarjeta:** Usa las tarjetas de prueba de MP (ej: Visa terminada en `3704`, titular `APRO`).

*Para más detalles, revisa la guía de pruebas generada.*
