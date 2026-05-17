import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: '1. RESPONSABLE DEL TRATAMIENTO',
    body: `Sámuel Pia Figueroa, operando bajo la marca comercial RewardsHub (en adelante "RewardsHub", "nosotros" o "el Responsable"), con domicilio en Guadalajara, Jalisco, México, es el responsable del uso y protección de sus datos personales conforme a lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.

Para cualquier consulta relacionada con el tratamiento de sus datos personales puede contactarnos a través de:
• Correo electrónico: rewardshubplat@gmail.com
• Sitio web: https://rewardshub.cloud`,
  },
  {
    title: '2. TIPOS DE USUARIOS Y DATOS PERSONALES RECOPILADOS',
    body: `RewardsHub opera con dos tipos de usuarios. Los datos recopilados varían según el perfil:

CLIENTE FINAL (usuarios de recompensas)
• Datos de identificación: Nombre de usuario.
• Datos de contacto: Correo electrónico.
• Datos de acceso: Credenciales de autenticación gestionadas a través de Firebase Authentication (Google LLC). Las contraseñas nunca son almacenadas directamente por RewardsHub.
• Datos de actividad: Historial de puntos, sellos canjeados, recompensas obtenidas, negocios visitados y transacciones realizadas dentro de la plataforma.
• Datos de ubicación geográfica (GPS): Posición en tiempo real, recopilada únicamente cuando el usuario activa la función de búsqueda de negocios cercanos. El acceso es opcional y puede desactivarse en cualquier momento desde los ajustes del dispositivo.
• Datos técnicos: Sistema operativo, tipo de navegador y zona horaria del dispositivo.
• Códigos de entrega: Códigos generados para reclamar recompensas por pedidos a domicilio.

USUARIO NEGOCIO (negocios afiliados)
• Datos de identificación: Nombre o razón social, nombre de usuario de la plataforma.
• Datos de contacto: Correo electrónico.
• Datos del negocio: Nombre comercial, logotipo, dirección(es) de sucursal(es) y coordenadas geográficas del establecimiento.
• Datos de acceso: Credenciales de autenticación gestionadas a través de Firebase Authentication (Google LLC).
• Datos financieros: Información necesaria para el procesamiento de pagos de suscripción, gestionada exclusivamente a través de Stripe, Inc. RewardsHub no almacena datos de tarjetas de crédito o débito.
• Datos de actividad comercial: Historial de transacciones, recompensas configuradas, sistemas de puntos y sellos, planes de membresía y reportes de clientes.
• Datos técnicos: Zona horaria del dispositivo del cajero para registro de turnos y transacciones.`,
  },
  {
    title: '3. FINALIDADES DEL TRATAMIENTO',
    body: `FINALIDADES PRIMARIAS (necesarias para la prestación del servicio)
• Creación, gestión y autenticación de cuentas de usuario.
• Operación del programa de lealtad: registro de puntos, sellos, recompensas y membresías.
• Procesamiento de pagos de suscripción para negocios a través de Stripe.
• Generación y validación de códigos QR para transacciones.
• Mostrar negocios cercanos al usuario (requiere acceso a ubicación GPS).
• Envío de notificaciones sobre recompensas disponibles, canjes y actividad de la cuenta.
• Atención a solicitudes de soporte y resolución de incidencias.
• Registro de turnos y transacciones de cajeros con información de zona horaria.

FINALIDADES SECUNDARIAS (puede oponerse a su uso)
• Envío de comunicaciones sobre nuevas funciones, actualizaciones y promociones.
• Análisis estadístico agregado y anonimizado para mejorar la plataforma.
• Generación de reportes de rendimiento para negocios afiliados.

Si no desea que sus datos sean tratados para las finalidades secundarias, puede manifestar su negativa enviando un correo electrónico a la dirección indicada en la Sección 1 o desde la configuración de su cuenta.`,
  },
  {
    title: '4. TRANSFERENCIA DE DATOS PERSONALES',
    body: `Sus datos personales pueden ser compartidos con los siguientes terceros, estrictamente para las finalidades descritas en este aviso:

• Firebase Authentication (Google LLC) — Estados Unidos — Autenticación segura de usuarios.
• Stripe, Inc. — Estados Unidos — Procesamiento de pagos de suscripción.
• Amazon Web Services (AWS) — Estados Unidos — Almacenamiento de base de datos e imágenes.
• Vercel, Inc. — Estados Unidos — Hospedaje de la aplicación web.
• Autoridades competentes — México — Cumplimiento de obligaciones legales.

TRANSFERENCIAS INTERNACIONALES
Los proveedores listados se encuentran en los Estados Unidos de América. Conforme a los artículos 36 y 37 de la LFPDPPP, le informamos que dichas transferencias se realizan con proveedores que cuentan con niveles de protección adecuados y que han asumido compromisos contractuales de confidencialidad y seguridad sobre sus datos.

RewardsHub no vende, renta ni comercializa sus datos personales a terceros con fines distintos a los descritos en este aviso.`,
  },
  {
    title: '5. DERECHOS ARCO Y MECANISMO DE EJERCICIO',
    body: `Conforme a la LFPDPPP, usted tiene derecho a:

• Acceso: Conocer qué datos personales tenemos y cómo los utilizamos.
• Rectificación: Solicitar la corrección de sus datos cuando sean inexactos o incompletos.
• Cancelación: Pedir la supresión de sus datos cuando no sean necesarios para las finalidades del tratamiento.
• Oposición: Oponerse al tratamiento de sus datos para finalidades específicas.

PROCEDIMIENTO
Para ejercer sus derechos ARCO, envíe una solicitud escrita al correo electrónico indicado en la Sección 1 incluyendo:
1. Nombre completo y correo electrónico registrado en la plataforma.
2. Descripción clara del derecho que desea ejercer.
3. Copia de identificación oficial.

Atenderemos su solicitud en un plazo máximo de 20 días hábiles. De ser procedente, la respuesta se hará efectiva en los siguientes 15 días hábiles.`,
  },
  {
    title: '6. REVOCACIÓN DEL CONSENTIMIENTO',
    body: `Usted puede revocar el consentimiento otorgado para el tratamiento de sus datos en cualquier momento, siempre que no exista una obligación legal que lo impida. La revocación no tendrá efectos retroactivos.

Para ejercer la revocación, siga el procedimiento indicado en la Sección 5.

Nota importante: La revocación del consentimiento para finalidades primarias implica la imposibilidad de continuar prestando el servicio, lo que puede resultar en la cancelación de su cuenta.`,
  },
  {
    title: '7. USO DE LA UBICACIÓN GEOGRÁFICA',
    body: `La plataforma solicita acceso a la ubicación GPS del dispositivo exclusivamente para la función de negocios cercanos, que permite al Cliente Final visualizar establecimientos afiliados próximos a su posición.

• La ubicación no se almacena de forma permanente en nuestros servidores.
• Se accede a ella solo cuando el usuario utiliza activamente dicha función.
• El usuario puede denegar o revocar el permiso en cualquier momento:
  — iOS: Ajustes → Privacidad → Localización
  — Android: Ajustes → Aplicaciones → Permisos
• Las coordenadas de las sucursales de los negocios sí se almacenan permanentemente, al ser datos proporcionados voluntariamente por el usuario negocio como parte de su perfil.`,
  },
  {
    title: '8. COOKIES Y TECNOLOGÍAS DE RASTREO',
    body: `Nuestra plataforma web utiliza cookies y tecnologías similares para:

• Mantener la sesión activa del usuario (cookies de sesión).
• Recordar preferencias de navegación.
• Analizar el comportamiento de uso con fines estadísticos.

Las cookies de sesión son eliminadas al cerrar el navegador. Puede configurar su navegador para rechazarlas, aunque esto puede afectar el funcionamiento de algunas funciones de la plataforma.`,
  },
  {
    title: '9. NOTIFICACIONES Y COMUNICACIONES',
    body: `Al registrarse en la plataforma, el usuario otorga su consentimiento para recibir:

• Notificaciones de la aplicación: Alertas sobre recompensas, canjes y actividad de la cuenta.
• Correos electrónicos transaccionales: Confirmaciones de registro, cambios en la cuenta y actividad de suscripción.

Este consentimiento puede revocarse en cualquier momento:
• Notificaciones push: Desde Ajustes → Notificaciones en su dispositivo, o desde la configuración de la app.
• Correos electrónicos: A través del enlace de cancelación incluido en cada correo o enviando una solicitud a nuestro correo de soporte.`,
  },
  {
    title: '10. MEDIDAS DE SEGURIDAD',
    body: `RewardsHub implementa medidas técnicas, administrativas y físicas para proteger sus datos personales contra pérdida, uso indebido, acceso no autorizado, divulgación, alteración o destrucción, incluyendo:

• Transmisión de datos mediante cifrado HTTPS/TLS.
• Autenticación segura mediante Firebase Authentication.
• Tokens de acceso con tiempo de expiración y mecanismos de refresco.
• Acceso restringido a la base de datos mediante roles y permisos.
• Almacenamiento en infraestructura en la nube con certificaciones de seguridad reconocidas (AWS).

En caso de una vulneración de datos que afecte significativamente sus derechos, le notificaremos a la brevedad posible conforme a los procedimientos establecidos en la LFPDPPP.`,
  },
  {
    title: '11. DATOS DE MENORES DE EDAD',
    body: `RewardsHub no está dirigida a menores de 18 años ni recopila intencionalmente datos de menores. Si usted es padre, madre o tutor y tiene conocimiento de que un menor nos ha proporcionado datos personales, le solicitamos que nos lo informe a través del correo de soporte para proceder con su eliminación.`,
  },
  {
    title: '12. RETENCIÓN DE DATOS',
    body: `Sus datos personales serán conservados durante el tiempo que su cuenta permanezca activa y por el período adicional necesario para cumplir con obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.

Una vez concluido dicho período, los datos serán eliminados o anonimizados de forma segura.`,
  },
  {
    title: '13. CAMBIOS AL AVISO DE PRIVACIDAD',
    body: `RewardsHub se reserva el derecho de modificar este aviso en cualquier momento para reflejar cambios en la legislación aplicable, en nuestras prácticas de privacidad o en los servicios ofrecidos.

Cualquier modificación será notificada a través de:
• Un aviso visible dentro de la plataforma o aplicación.
• Correo electrónico al registrado en su cuenta, cuando el cambio sea sustancial.

El uso continuado de la plataforma tras la notificación implica la aceptación de los cambios.`,
  },
  {
    title: '14. AUTORIDAD COMPETENTE',
    body: `Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI) en www.inai.org.mx.`,
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-neutral-900 leading-tight">Aviso de Privacidad</h1>
            <p className="text-xs text-neutral-500">RewardsHub – Protección de Datos Personales</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-xl font-extrabold text-neutral-900 mb-1">
            AVISO DE PRIVACIDAD INTEGRAL – REWARDSHUB
          </h2>
          <p className="text-xs text-neutral-400">Última actualización: Mayo 2025</p>
        </div>

        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#EBA626] uppercase tracking-wide mb-3">{s.title}</h3>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}

        <p className="text-center text-xs text-neutral-400 pb-4">
          © 2025 RewardsHub · Samuel Pia Figueroa · Guadalajara, Jalisco, México
        </p>
      </div>
    </div>
  );
}
