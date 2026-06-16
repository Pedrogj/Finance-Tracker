# MoneyFlow - Especificación inicial

## 1. Objetivo

MoneyFlow es una aplicación web de gestión de finanzas personales. Su
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
- Recuperación de contraseña mediante correo de Supabase Auth.
- Sesión persistente administrada por Supabase en el navegador.
- Confirmación de correo electrónico según la configuración del proyecto.
- Perfil privado creado automáticamente al registrar un usuario.
- Dashboard responsive conectado a información financiera persistente.
- Registro, edición y eliminación de ingresos y gastos por cuenta y categoría.
- Creación y eliminación de categorías personales de ingreso y gasto.
- Navegación mensual para consultar el historial financiero.
- Filtro por rango de días dentro del mes seleccionado.
- Preferencia visual de tema claro u oscuro desde el perfil.
- Navegación visual hacia futuras áreas de movimientos, presupuestos y metas.
- Formato de moneda CLP, textos en español y fechas con contexto local.

No incluye edición de perfil, transferencias entre cuentas ni recurrencia
automática de movimientos.

## 3. Stack y estructura

- React 19 con TypeScript.
- Vite como servidor de desarrollo y empaquetador.
- React Router para las rutas del cliente.
- Supabase Auth y PostgreSQL para autenticación y perfil.
- React Context API para centralizar el estado y las operaciones de autenticación.
- React Context API también administra la preferencia visual de tema.
- React Hook Form para estado, envío y errores de formularios.
- Zod como fuente única de validación y tipos de entrada.
- Tailwind CSS 4 para estilos responsive.
- Componentes shadcn y Radix UI como base de interfaz.
- Lucide React para iconografía.
- Fuente Geist Variable.

`AuthProvider` mantiene el usuario y la carga inicial, escucha los cambios de
sesión de Supabase y expone `signIn`, `signUp`, `requestPasswordReset`,
`updatePassword` y `signOut` mediante `useAuth`.
`FinanceProvider` carga y administra cuentas, categorías, movimientos,
presupuestos y metas mediante `useFinance`.
`ThemeProvider` aplica `light` o `dark` al documento, respeta la preferencia
guardada en el navegador y expone `toggleTheme` mediante `useTheme`.
`FinanceTrackerApp` consume ese contexto y se limita a controlar las rutas.
Las páginas residen en `src/pages`; los elementos compartidos y componentes UI
residen en `src/components`.

## 4. Identidad visual

- Apariencia fintech clara, profesional y cercana.
- La interfaz prioriza saldo, registro de movimientos y actividad reciente.
- No se muestran controles sin funcionalidad ni secciones vacías opcionales.
- Verde esmeralda como color primario para acciones, progreso y estados
  positivos.
- Slate para superficies, tipografía y navegación.
- Tarjetas blancas, bordes suaves, radios amplios y sombras discretas.
- La interfaz debe conservar contraste suficiente y estados de foco visibles.
- El tema oscuro usa la clase `dark` en el documento y debe mantener contraste
  suficiente en navegación, tarjetas, formularios y perfil.
- Navegación superior mínima con identidad, usuario y cierre de sesión.
- Tablet y móvil: contenido apilado y acción principal a ancho completo.

## 5. Pantallas y rutas

### `/login`

Contiene correo, contraseña, control para mostrar u ocultar la contraseña y
enlaces hacia registro y recuperación de contraseña. El envío válido autentica
con Supabase y navega a `/`.

### `/register`

Contiene nombre completo, correo, contraseña y confirmación. El envío válido
crea un usuario en Supabase, guarda el nombre en sus metadatos y genera su
perfil. Si la confirmación de correo está activa, informa al usuario que debe
revisar su bandeja; si Supabase entrega una sesión inmediata, navega a `/`.

### `/forgot-password`

Solicita el correo del usuario y envía un enlace seguro con
`resetPasswordForEmail`. El mensaje de éxito no confirma si el correo existe,
para evitar enumeración de cuentas. El enlace de Supabase debe redirigir a
`/reset-password`.

### `/reset-password`

Recibe la sesión temporal generada por el enlace de recuperación. Permite
ingresar una nueva contraseña, confirmar que coincide y actualizarla con
`updateUser`. Al completar el cambio, cierra la sesión temporal y vuelve al
flujo de inicio de sesión.

### `/`

Ruta protegida por el estado de sesión de Supabase. Sin sesión redirige a
`/login`. Presenta:

- Encabezado mínimo con identidad, usuario y cierre de sesión.
- Balance disponible, ingresos y gastos mensuales.
- Selector de mes con navegación desde el primer período disponible hasta el
  mes actual.
- Calendario shadcn para seleccionar un rango limitado al mes visible.
- Presupuesto, meta y distribución por categoría solo cuando contienen datos.
- Lista de movimientos recientes.
- Acción visual para agregar un movimiento.
- Administrador de categorías con nombre, tipo, color y eliminación confirmada.
- Formulario funcional para registrar y editar ingresos y gastos.
- Acciones compactas para editar o eliminar cada movimiento.
- Confirmación obligatoria antes de eliminar un movimiento.
- Cierre de sesión con retorno a `/login`.

### `/profile`

Ruta protegida por sesión. Muestra la información básica de la cuenta actual:
nombre, correo, avatar con iniciales, navegación de regreso al dashboard y
cierre de sesión. Incluye una preferencia para alternar entre tema claro y tema
oscuro, persistida en `localStorage`.

Las rutas desconocidas redirigen a `/login`. Si ya existe una sesión, visitar
login o registro redirige al dashboard.

## 6. Validación

- Los formularios usan `useForm` con `zodResolver`.
- Los tipos de cada formulario se infieren desde su esquema Zod.
- Todos los campos de los formularios son obligatorios.
- El correo debe tener un formato válido.
- La contraseña debe tener al menos seis caracteres.
- En registro y restablecimiento, la confirmación debe coincidir con la
  contraseña.
- Los errores aparecen junto al campo y se relacionan mediante atributos ARIA.
- Los errores de Supabase se presentan mediante mensajes en español sin exponer
  detalles internos.
- Los errores remotos se registran en `root.server`; los errores de campo
  provienen exclusivamente de Zod.

## 7. Autenticación y perfil

- El cliente usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Nunca se expone una clave secreta o `service_role` en el frontend.
- `public.profiles` referencia a `auth.users` y elimina el perfil en cascada.
- Un trigger crea el perfil con `full_name` después del registro.
- RLS permite a cada usuario autenticado consultar y actualizar solo su perfil.
- La sesión se restaura al recargar y se actualiza con `onAuthStateChange`.
- La recuperación de contraseña usa `resetPasswordForEmail` con `redirectTo`
  hacia `/reset-password`; esa URL debe estar permitida en la configuración de
  Redirect URLs de Supabase Auth.
- El contexto de autenticación conserva el evento `PASSWORD_RECOVERY` para
  distinguir un enlace válido de una visita manual a `/reset-password`.
- El cambio de contraseña se ejecuta solo con una sesión de recuperación válida
  y usa `updateUser({ password })`.
- Las páginas no acceden directamente al cliente Supabase ni reciben la sesión
  por props; consumen el estado compartido mediante `useAuth`.

## 8. Modelo financiero

- `accounts`: cuentas de efectivo, corriente, ahorro, crédito o inversión.
- `categories`: categorías independientes de ingreso y gasto.
- `transactions`: movimientos positivos vinculados a una cuenta y categoría;
  el tipo determina si suman o restan al balance.
- `budgets`: límites mensuales por categoría.
- `savings_goals`: metas con monto objetivo, progreso, fecha y estado.
- Cada usuario recibe una cuenta principal y categorías base al registrarse.
- Las relaciones compuestas impiden asociar datos pertenecientes a usuarios
  diferentes.
- Las claves compuestas también garantizan que ingresos, gastos y presupuestos
  solo utilicen categorías del tipo correspondiente.
- Todas las tablas tienen RLS para SELECT, INSERT, UPDATE y DELETE, limitado a
  `auth.uid()`.
- Los importes se almacenan como `numeric(14,2)` y se presentan en CLP.

El dashboard calcula balance, ingresos, gastos y distribución por categorías
desde los movimientos reales del usuario. Los presupuestos y metas muestran
estados vacíos hasta que el usuario los configure.

Al seleccionar un mes, el dashboard muestra los ingresos, gastos, categorías,
presupuesto y movimientos de ese período. El saldo corresponde al acumulado
hasta el cierre del mes seleccionado.

El usuario puede acotar la consulta a un rango de días. Los ingresos, gastos,
categorías y movimientos respetan ambas fechas; el saldo se calcula acumulado
hasta el día final del rango.

## 9. Evolución futura

- Gestión visual de cuentas y edición de categorías.
- CRUD completo de presupuestos y metas.
- Transferencias entre cuentas y movimientos recurrentes.
- Filtros y búsqueda de movimientos.
- Gráficos basados en información real.
- Preferencias de moneda, localización y tema.
- Pruebas automatizadas unitarias, de integración y end-to-end.

## 10. Criterios de aceptación

- Login válido accede al dashboard.
- Registro válido crea el usuario y su perfil; respeta la confirmación de correo.
- Campos vacíos, correo inválido, contraseña corta y confirmación diferente
  muestran mensajes claros.
- Los enlaces entre autenticación funcionan sin recargar la página.
- Solicitar recuperación de contraseña envía el correo y muestra una respuesta
  neutral.
- Un enlace válido de recuperación permite definir una nueva contraseña.
- Un enlace inválido o expirado ofrece solicitar un nuevo correo.
- La sesión persiste tras recargar la página.
- Cerrar sesión revoca la sesión local y retorna al login.
- El usuario autenticado puede abrir `/profile` y ver su nombre y correo.
- El usuario autenticado puede cambiar entre tema claro y oscuro desde
  `/profile`; la preferencia se mantiene al recargar.
- Las rutas no reconocidas se controlan mediante redirección.
- No existe desbordamiento horizontal en móvil, tablet o escritorio.
- La interfaz utiliza español y muestra importes en CLP.
- Un usuario no puede consultar ni modificar información financiera ajena.
- Registrar, editar o eliminar un movimiento actualiza el resumen y la lista
  reciente.
- Crear una categoría la incorpora a los formularios de movimientos.
- Una categoría con movimientos asociados no puede eliminarse.
- Cambiar de mes actualiza todos los indicadores y movimientos del período sin
  recargar la página.
- Cambiar el rango de días actualiza la consulta y no permite fechas fuera del
  mes ni posteriores al día actual.
- `npm run lint` y `npm run build` finalizan correctamente.
