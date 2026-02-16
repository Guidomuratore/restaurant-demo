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
    git remote add origin <LA_URL_DE_TU_NUEVO_REPO.git>
    git branch -M main
    git add .
    git commit -m "Primer deploy a producción"
    git push -u origin main
    ```

## 3. Desplegar en Raspberry Pi 🍓

Conéctate a tu Raspberry Pi.

**Opción A: Si es la primera vez (Clonar):**
```bash
git clone <LA_URL_DE_TU_NUEVO_REPO.git> restaurant-demo
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
