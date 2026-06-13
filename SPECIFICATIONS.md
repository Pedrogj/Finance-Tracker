# Finance Tracker - Especificación inicial

## 1. Objetivo

Finance Tracker es una aplicación web de gestión de finanzas personales. Su
objetivo es ayudar a una persona a entender sus ingresos, gastos, presupuesto y
metas de ahorro desde una interfaz clara y accesible.

Esta primera etapa establece el cascarón visual, la navegación y los patrones de
interacción que servirán como base para incorporar autenticación, persistencia y
operaciones financieras reales.

## 2. Audiencia y alcance

La aplicación está dirigida a personas que desean organizar un presupuesto
mensual sin enfrentarse a herramientas contables complejas.

Incluye en esta etapa:

- Inicio de sesión y registro mediante Supabase Auth.
- Sesión persistente administrada por Supabase en el navegador.
- Confirmación de correo electrónico según la configuración del proyecto.
- Perfil privado creado automáticamente al registrar un usuario.
- Dashboard responsive con información financiera demostrativa.
- Navegación visual hacia futuras áreas de movimientos, presupuestos y metas.
- Formato de moneda CLP, textos en español y fechas con contexto local.

No incluye recuperación de contraseña, edición de perfil, persistencia de
movimientos, creación efectiva de operaciones financieras ni cálculos sobre
datos ingresados por el usuario.

## 3. Stack y estructura

- React 19 con TypeScript.
- Vite como servidor de desarrollo y empaquetador.
- React Router para las rutas del cliente.
- Supabase Auth y PostgreSQL para autenticación y perfil.
- React Context API para centralizar el estado y las operaciones de autenticación.
- Tailwind CSS 4 para estilos responsive.
- Componentes shadcn y Radix UI como base de interfaz.
- Lucide React para iconografía.
- Fuente Geist Variable.

`AuthProvider` mantiene el usuario y la carga inicial, escucha los cambios de
sesión de Supabase y expone `signIn`, `signUp` y `signOut` mediante `useAuth`.
`FinanceTrackerApp` consume ese contexto y se limita a controlar las rutas.
Las páginas residen en `src/pages`; los elementos compartidos y componentes UI
residen en `src/components`.

## 4. Identidad visual

- Apariencia fintech clara, profesional y cercana.
- Verde esmeralda como color primario para acciones, progreso y estados
  positivos.
- Slate para superficies, tipografía y navegación.
- Tarjetas blancas, bordes suaves, radios amplios y sombras discretas.
- La interfaz debe conservar contraste suficiente y estados de foco visibles.
- Escritorio: sidebar fija y contenido organizado en columnas.
- Tablet y móvil: menú lateral desplegable, tarjetas apiladas y controles sin
  desbordamiento horizontal.

## 5. Pantallas y rutas

### `/login`

Contiene correo, contraseña, control para mostrar u ocultar la contraseña y
enlace hacia registro. El envío válido autentica con Supabase y navega a `/`.

### `/register`

Contiene nombre completo, correo, contraseña y confirmación. El envío válido
crea un usuario en Supabase, guarda el nombre en sus metadatos y genera su
perfil. Si la confirmación de correo está activa, informa al usuario que debe
revisar su bandeja; si Supabase entrega una sesión inmediata, navega a `/`.

### `/`

Ruta protegida por el estado de sesión de Supabase. Sin sesión redirige a
`/login`. Presenta:

- Sidebar con resumen, movimientos, presupuestos, metas y configuración.
- Encabezado con periodo, notificaciones y usuario.
- Balance disponible, ingresos y gastos mensuales.
- Progreso del presupuesto mensual.
- Meta de ahorro destacada.
- Distribución de gastos por categoría.
- Lista de movimientos recientes.
- Acción visual para agregar un movimiento.
- Cierre de sesión con retorno a `/login`.

Las rutas desconocidas redirigen a `/login`. Si ya existe una sesión, visitar
login o registro redirige al dashboard.

## 6. Validación

- Todos los campos de los formularios son obligatorios.
- El correo debe tener un formato válido.
- La contraseña debe tener al menos seis caracteres.
- En registro, la confirmación debe coincidir con la contraseña.
- Los errores aparecen junto al campo y se relacionan mediante atributos ARIA.
- Los errores de Supabase se presentan mediante mensajes en español sin exponer
  detalles internos.

## 7. Autenticación y perfil

- El cliente usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Nunca se expone una clave secreta o `service_role` en el frontend.
- `public.profiles` referencia a `auth.users` y elimina el perfil en cascada.
- Un trigger crea el perfil con `full_name` después del registro.
- RLS permite a cada usuario autenticado consultar y actualizar solo su perfil.
- La sesión se restaura al recargar y se actualiza con `onAuthStateChange`.
- Las páginas no acceden directamente al cliente Supabase ni reciben la sesión
  por props; consumen el estado compartido mediante `useAuth`.

## 8. Datos demostrativos

Los datos mock representan junio de 2026 e incluyen:

- Balance disponible: `$1.284.500`.
- Ingresos: `$1.850.000`.
- Gastos: `$565.500`.
- Presupuesto mensual: `$900.000`.
- Categorías: vivienda, alimentación, transporte y otros.
- Meta de fondo de emergencia por `$3.000.000`.
- Movimientos de ejemplo con comercio, categoría, fecha e importe.

Los importes se formatean con `Intl.NumberFormat`, locale `es-CL` y moneda
`CLP`, sin decimales.

## 9. Evolución futura

- Recuperación y cambio de contraseña.
- Persistencia de perfil, cuentas, categorías y movimientos.
- CRUD de ingresos, gastos, presupuestos y metas.
- Filtros, búsqueda y selección de periodos.
- Gráficos basados en información real.
- Preferencias de moneda, localización y tema.
- Pruebas automatizadas unitarias, de integración y end-to-end.

## 10. Criterios de aceptación

- Login válido accede al dashboard.
- Registro válido crea el usuario y su perfil; respeta la confirmación de correo.
- Campos vacíos, correo inválido, contraseña corta y confirmación diferente
  muestran mensajes claros.
- Los enlaces entre autenticación funcionan sin recargar la página.
- La sesión persiste tras recargar la página.
- Cerrar sesión revoca la sesión local y retorna al login.
- Las rutas no reconocidas se controlan mediante redirección.
- No existe desbordamiento horizontal en móvil, tablet o escritorio.
- La interfaz utiliza español y muestra importes en CLP.
- `npm run lint` y `npm run build` finalizan correctamente.
