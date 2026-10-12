# README — Evaluación

> **Curso:** PROGRAMACION WEB - II  
> **Código:** 30690  
> **Evaluación:** PA2  
> **Equipo:** Grupo 2  

**Proyecto:** API REST — Plataforma de Gestión de Solicitudes Académicas

## 1. Integrantes

| Integrante | Rol | Aporte principal |
|---|---|---|
| Ayrton Mihail Palomino Loli | Desarrollador | Actividad 1: Servidor y rutas (Node.js y Express) |
| Joseph Mathios Labra Espinal | Desarrollador | Actividad 2: CRUD de solicitudes |
| Roy Giovanni Quiroz Morales | Desarrollador | Actividad 3: MongoDB y Mongoose |
| Angel Jesús Vargas Manrique | Desarrollador | Actividad 4: Seguridad y autenticación |

## 2. Descripción y objetivo

**Problema:**  
La Plataforma de Gestión de Solicitudes Académicas necesita un backend que reciba, guarde y administre las solicitudes que registran los estudiantes (revisión de nota, revisión de examen, etc.). Sin una API organizada, sin persistencia y sin control de acceso, cualquier persona podría ver, modificar o eliminar solicitudes ajenas, y la información se perdería al reiniciar el servidor.

**Objetivo:**  
Construir una API REST con Node.js y Express que gestione usuarios y solicitudes, persista los datos en MongoDB mediante Mongoose y proteja el acceso con JWT, bcrypt.js, CORS y autorización basada en roles.

**Solución desarrollada:**  
Una API en capas (rutas → middlewares → controladores → modelos) con:

- CRUD completo de solicitudes (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- Persistencia en MongoDB con dos modelos Mongoose relacionados: `Usuario` y `Solicitud`.
- Registro e inicio de sesión con contraseñas cifradas con **bcrypt.js** y emisión de tokens **JWT**.
- Rutas protegidas y autorización por roles (`estudiante` y `admin`).
- Middlewares de registro de peticiones, manejo global de errores, rutas no encontradas, **CORS** y **helmet**.

### 2.1 Desarrollo (procedimiento seguido)

El trabajo se realizó de forma progresiva, con una rama `feature/*` y un Pull Request por cada etapa:

| Etapa | Rama / commit | Contenido |
|---|---|---|
| 1 | Primera parte | Servidor Express, ruta principal y estructura del proyecto |
| 2 | `feature/parte-2-crud-solicitudes` | CRUD de solicitudes con rutas y controladores |
| 3 | `feature/parte-3-mongodb` | Conexión a MongoDB con Mongoose, modelo `Solicitud` y variables de entorno |
| 4 | `feature/parte-4-ajustes-base` | Middleware de errores y 404, validación de PUT/PATCH, scripts npm, `.gitattributes` y retiro de `node_modules` del repositorio |
| 5 | `feature/parte-5-auth-jwt` | Modelo `Usuario`, registro con bcrypt y login con JWT |
| 6 | `feature/parte-6-roles-cors` | Protección de rutas, autorización por roles, CORS y helmet |

### 2.2 Estructura del proyecto

```
pa2-4060/
├── config/
│   └── db.js                    # Conexión a MongoDB con Mongoose
├── controllers/
│   ├── authController.js        # Registro, login y perfil
│   └── solicitudController.js   # CRUD de solicitudes con reglas por rol
├── middlewares/
│   ├── authMiddleware.js        # verificarToken (JWT) y permitirRoles
│   ├── errorHandler.js          # Rutas 404 y manejo global de errores
│   └── logger.js                # Registro de cada petición en consola
├── models/
│   ├── solicitudModel.js        # Esquema Solicitud (relacionado con Usuario)
│   └── usuarioModel.js          # Esquema Usuario + cifrado con bcrypt
├── routes/
│   ├── authRoutes.js            # /auth
│   └── solicitudRoutes.js       # /solicitudes
├── scripts/
│   └── crearAdmin.js            # Crea el usuario administrador inicial
├── evidencias/                  # Capturas de las pruebas
├── .env.example                 # Plantilla de variables de entorno (sin datos reales)
└── server.js                    # Punto de entrada de la aplicación
```

### 2.3 Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | Público | Estado de la API |
| POST | `/auth/register` | Público | Registra un usuario (siempre con rol `estudiante`) |
| POST | `/auth/login` | Público | Inicia sesión y devuelve un token JWT |
| GET | `/auth/perfil` | Token | Datos del usuario autenticado |
| GET | `/solicitudes` | Token | Estudiante: solo sus solicitudes · Admin: todas |
| GET | `/solicitudes/:id` | Token | Estudiante: solo si es suya · Admin: cualquiera |
| POST | `/solicitudes` | Token | Crea una solicitud a nombre del usuario autenticado |
| PUT | `/solicitudes/:id` | Token | Reemplaza `curso` y `descripcion` (admin también `estado`) |
| PATCH | `/solicitudes/:id` | Token | Actualización parcial |
| DELETE | `/solicitudes/:id` | Token + admin | Elimina una solicitud |

### 2.4 Decisiones técnicas

- **Arquitectura en capas (rutas, controladores, modelos, middlewares):** separa responsabilidades y facilita mantener y explicar el código.
- **Manejo de errores centralizado:** los controladores envían los errores con `next(error)` y un único middleware responde con el código correcto (400 por ID o datos inválidos, 409 por email duplicado, 500 por errores del servidor).
- **PUT vs. PATCH:** PUT exige todos los campos editables (reemplazo completo); PATCH acepta uno o más campos (actualización parcial).
- **Contraseñas con bcrypt:** se cifran en un hook `pre('save')` del modelo, por lo que nunca se guardan en texto plano; además el campo `password` usa `select: false` para no devolverse en las consultas.
- **JWT con id y rol:** el token identifica al usuario sin guardar sesiones en el servidor. El middleware vuelve a consultar al usuario para confirmar que sigue existiendo y usar su rol actual.
- **Registro siempre como `estudiante`:** aunque se envíe `"rol":"admin"` en el body, se ignora; el administrador solo se crea con el script `npm run crear-admin`. Esto evita que cualquiera se otorgue privilegios.
- **Dueño de la solicitud tomado del token:** el `usuario` y el `alumno` no se envían en el body, se obtienen del JWT. Así nadie puede crear solicitudes a nombre de otra persona.
- **Reglas de negocio por rol:** el estudiante solo edita sus solicitudes mientras están en `Pendiente` y no puede cambiar el `estado`; el admin revisa, cambia el estado y elimina.
- **Códigos 401 vs. 403:** 401 cuando no hay token o es inválido/expirado (no autenticado); 403 cuando el usuario está autenticado pero su rol no tiene permiso (no autorizado).
- **CORS y helmet:** CORS solo permite los orígenes definidos en `CORS_ORIGIN`; helmet agrega cabeceras HTTP de seguridad.
- **Variables de entorno:** la cadena de conexión, la clave JWT y los datos del admin están en `.env`, que no se sube al repositorio. Solo se publica `.env.example`.

### 2.5 Relación con los contenidos evaluados (sesiones 5 a 7)

| Contenido del sílabo | Dónde se aplica |
|---|---|
| Servidor con Node.js y Express, rutas y middleware | `server.js`, `routes/`, `middlewares/logger.js`, `middlewares/errorHandler.js` |
| Operaciones CRUD en el servidor | `controllers/solicitudController.js` |
| Integración con MongoDB mediante Mongoose | `config/db.js`, `models/` |
| Servicios REST con buenas prácticas | Códigos HTTP correctos, validaciones del modelo, PUT/PATCH diferenciados |
| JWT, bcrypt.js, CORS, protección de rutas y roles | `controllers/authController.js`, `models/usuarioModel.js`, `middlewares/authMiddleware.js`, `server.js` |

## 3. Cómo ejecutar o revisar

**Requisitos:** Node.js 18 o superior, MongoDB Community Server en ejecución (`mongodb://127.0.0.1:27017`), Postman (o similar) y, opcionalmente, MongoDB Compass.

```bash
# 1. Clonar el repositorio e instalar dependencias
git clone https://github.com/roy-quiroz/pa2-4060.git
cd pa2-4060
npm install

# 2. Crear el archivo de variables de entorno a partir de la plantilla
#    (Windows: copy .env.example .env)
cp .env.example .env
#    Editar .env: definir JWT_SECRET con una cadena larga y aleatoria,
#    y ADMIN_EMAIL / ADMIN_PASSWORD para el administrador.
#    Para generar una clave:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Crear el usuario administrador
npm run crear-admin

# 4. Iniciar el servidor
npm run dev        # con nodemon (desarrollo)
# o
npm start          # con node
```

El servidor queda disponible en `http://localhost:3001`.

**Pasos de revisión:**
1. Abrir `http://localhost:3001/` y verificar el mensaje "Servidor funcionando correctamente".
2. En Postman, registrar un estudiante con `POST /auth/register` y luego iniciar sesión con `POST /auth/login` (estudiante y admin) para obtener los tokens.
3. Enviar el token en **Authorization → Bearer Token** y probar las rutas de `/solicitudes` con cada rol (ver la tabla de endpoints).
4. Verificar en MongoDB Compass la base `solicitudes_academicas` con las colecciones `usuarios` (contraseñas cifradas) y `solicitudes`.

Ejemplos de body:

```json
// POST /auth/register
{ "nombre": "Ana", "email": "ana@isil.pe", "password": "secreto123" }

// POST /auth/login
{ "email": "ana@isil.pe", "password": "secreto123" }

// POST /solicitudes (con token)
{ "curso": "Programación Web II", "descripcion": "Revisión de nota" }

// PATCH /solicitudes/:id (con token de admin)
{ "estado": "Aprobada" }
```

> No publicar contraseñas, tokens, credenciales ni datos sensibles. El archivo `.env` está excluido en `.gitignore`. Los usuarios y datos de las capturas son de prueba, y los tokens visibles ya expiraron (vigencia de 1 hora).

## 4. Evidencias

Todas las capturas se encuentran en la carpeta [`evidencias/`](evidencias/).

**Etapa inicial: servidor, CRUD y persistencia (antes de agregar autenticación)**

| Prueba | Resultado esperado | Evidencia |
|---|---|---|
| POST `/solicitudes` desde PowerShell | Solicitud creada y guardada en MongoDB | [Prueba_POST.png](evidencias/Prueba_POST.png) |
| GET `/solicitudes` + documento en Compass | Persistencia verificada | [Prueba_GET.png](evidencias/Prueba_GET.png) |
| GET `/solicitudes/abc` | 400 — ID no válido | [id_no_valido.png](evidencias/id_no_valido.png) |
| POST con datos incompletos | 400 — lista de campos obligatorios | [post_incompleto.png](evidencias/post_incompleto.png) |
| PUT con datos incompletos | 400 — PUT requiere todos los campos | [PUT_incompleto.png](evidencias/PUT_incompleto.png) |

**Autenticación (bcrypt y JWT)**

| Prueba | Resultado esperado | Evidencia |
|---|---|---|
| POST `/auth/register` enviando `"rol":"admin"` | 201 — se registra como `estudiante` | [POST_Register_201.png](evidencias/POST_Register_201.png) |
| Registro con email repetido | 409 — email ya registrado | [POST_Register_409.png](evidencias/POST_Register_409.png) |
| POST `/auth/login` (estudiante) | 200 — token JWT | [POST_LOGIN_200.png](evidencias/POST_LOGIN_200.png) |
| Login con contraseña incorrecta | 401 — credenciales incorrectas | [POST_LOGIN_401.png](evidencias/POST_LOGIN_401.png) |
| Login del administrador | 200 — rol `admin` | [POST_LOGIN_ADMIN_200.png](evidencias/POST_LOGIN_ADMIN_200.png) |
| GET `/auth/perfil` con token | 200 — datos del usuario | [Perfil_admin_200.png](evidencias/Perfil_admin_200.png) |
| Contraseñas en MongoDB | Guardadas como hash bcrypt (`$2b$10$...`) | [Password_hashed.png](evidencias/Password_hashed.png) |

**Protección de rutas y autorización por roles**

| Prueba | Resultado esperado | Evidencia |
|---|---|---|
| GET `/solicitudes` sin token | 401 — token no proporcionado | [GET_SOLICITUDES_SIN_TOKEN_401.png](evidencias/GET_SOLICITUDES_SIN_TOKEN_401.png) |
| POST `/solicitudes` (estudiante 1) | 201 — `usuario` y `alumno` tomados del token | [POST_SOLICITUDES_ESTUDIANTE_201.png](evidencias/POST_SOLICITUDES_ESTUDIANTE_201.png) |
| POST `/solicitudes` (estudiante 2) | 201 | [POST_SOLICITUDES_ESTUDIANTE2_201.png](evidencias/POST_SOLICITUDES_ESTUDIANTE2_201.png) |
| GET `/solicitudes` (estudiante 2) | 200 — solo ve su propia solicitud | [GET_SOLICITUDES_ESTUDIANTE2_200.png](evidencias/GET_SOLICITUDES_ESTUDIANTE2_200.png) |
| GET `/solicitudes` (admin) | 200 — ve todas, con nombre y email del dueño | [GET_SOLICITUDES_ADMIN_200.png](evidencias/GET_SOLICITUDES_ADMIN_200.png) |
| PATCH `estado` (estudiante) | 403 — solo el admin cambia el estado | [PATCH_SOLICITUDES_ESTUDIANTE_403.png](evidencias/PATCH_SOLICITUDES_ESTUDIANTE_403.png) |
| PATCH `estado: Aprobada` (admin) | 200 — estado actualizado | [PATCH_SOLICITUDES_ADMIN_200.png](evidencias/PATCH_SOLICITUDES_ADMIN_200.png) |
| PATCH de una solicitud ya aprobada (estudiante) | 409 — no se puede modificar | [PATCH_SOLICITUDES_ESTUDIANTE_409.png](evidencias/PATCH_SOLICITUDES_ESTUDIANTE_409.png) |
| DELETE (estudiante) | 403 — se requiere rol admin | [DELETE_SOLICITUDES_ESTUDIANTE_403.png](evidencias/DELETE_SOLICITUDES_ESTUDIANTE_403.png) |
| DELETE (admin) | 200 — solicitud eliminada | [DELETE_SOLICITUDES_ADMIN_200.png](evidencias/DELETE_SOLICITUDES_ADMIN_200.png) |

**Persistencia final en MongoDB Compass**

| Colección | Evidencia |
|---|---|
| `usuarios` (3 usuarios: 1 admin y 2 estudiantes) | [USUARIOS.png](evidencias/USUARIOS.png) |
| `solicitudes` (relacionadas con su usuario) | [SOLICITUDES.png](evidencias/SOLICITUDES.png) |

## 5. Matriz de participación

| Integrante | Desarrollo | Pruebas | Documentación | Exposición | Evidencia de participación |
|---|---|---|---|---|---|
| Ayrton Mihail Palomino Loli | Alta | Alta | Alta | Sí | Commits y Pull Requests en el repositorio |
| Joseph Mathios Labra Espinal | Alta | Alta | Alta | Sí | Commits y Pull Requests en el repositorio |
| Roy Giovanni Quiroz Morales | Alta | Alta | Alta | Sí | Commits y Pull Requests en el repositorio |
| Angel Jesús Vargas Manrique | Alta | Alta | Alta | Sí | Commits y Pull Requests en el repositorio |

## 6. Video de exposición

**Video público de YouTube:** https://youtu.be/DMfm3PE6M7E?si=e1tG0VKh3WlaGrs9

Todos los integrantes deben participar en la exposición con sus cámaras prendidas y explicar el procedimiento, la solución desarrollada y las decisiones tomadas.

## 7. Conclusiones

- Separar la API en rutas, middlewares, controladores y modelos permitió construir el proyecto por etapas, repartir el trabajo y agregar seguridad sin reescribir el CRUD.
- Mongoose facilitó la persistencia y la validación de datos: las reglas del esquema (campos obligatorios, valores permitidos, email único) se aplican en un solo lugar y el middleware de errores las traduce en respuestas HTTP claras.
- La combinación de bcrypt (contraseñas cifradas), JWT (identidad del usuario) y middlewares de autorización por rol permitió que cada usuario acceda solo a lo que le corresponde, diferenciando correctamente los errores 401 y 403.
- Las decisiones de seguridad no dependen del cliente: el rol al registrarse y el dueño de cada solicitud se definen en el servidor, no en los datos que envía el usuario.
- Trabajar con ramas, Pull Requests, `.gitignore` y `.env.example` mantuvo un repositorio ordenado y sin credenciales expuestas.

---

**Última actualización:** 10/10/2026
