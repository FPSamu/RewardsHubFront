import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: '1. DEFINICIONES',
    body: `Para efectos del presente contrato:

"RewardsHub" o "La Plataforma": Sistema de software propiedad de Samuel Pia Figueroa, ofrecido bajo el modelo SaaS (Software as a Service).
"El Negocio": Persona física o moral que contrata los servicios.
"Clientes Finales": Consumidores del Negocio que participan en programas de lealtad.
"Servicios": Herramientas digitales proporcionadas por RewardsHub para la gestión de programas de lealtad y gestión de herramientas de uso del cliente final.
"Cuenta": Acceso digital asignado al Negocio o Cliente Final.
"Datos": Información generada, almacenada o procesada dentro de la plataforma.`,
  },
  {
    title: '2. ACEPTACIÓN DE LOS TÉRMINOS',
    body: `Al registrarse, acceder o utilizar la Plataforma, El Negocio y el Cliente Final acepta obligarse legalmente por estos Términos y Condiciones.
Si no está de acuerdo, deberá abstenerse de utilizar los Servicios.`,
  },
  {
    title: '3. NATURALEZA DEL SERVICIO',
    body: `RewardsHub es un proveedor de tecnología bajo modelo SaaS.
No participa en la relación comercial entre El Negocio y sus Clientes Finales.
No es responsable de promociones, recompensas ni beneficios ofrecidos por El Negocio.
No actúa como intermediario financiero, agente, ni representante.`,
  },
  {
    title: '4. LICENCIA DE USO',
    body: `RewardsHub otorga al Negocio una licencia limitada, no exclusiva, no transferible y revocable para usar la plataforma durante la vigencia del servicio.

Queda prohibido:
• Copiar, modificar o replicar el software
• Realizar ingeniería inversa
• Revender o sublicenciar el acceso`,
  },
  {
    title: '5. USO PERMITIDO Y PROHIBIDO',
    body: `El Negocio se obliga a utilizar la plataforma únicamente para fines legales.

Queda estrictamente prohibido:
• Utilizar la plataforma para actividades ilícitas
• Manipular el sistema para generar beneficios indebidos
• Introducir virus, malware o código malicioso
• Intentar acceder a cuentas de terceros
• Alterar métricas, recompensas o registros de forma fraudulenta

RewardsHub podrá suspender el servicio sin previo aviso ante cualquier uso indebido.`,
  },
  {
    title: '6. GESTIÓN DE CUENTAS Y SEGURIDAD',
    body: `El Negocio es responsable de:
• La confidencialidad de sus credenciales
• El uso de su cuenta por empleados o terceros
• Cualquier actividad realizada desde su acceso

RewardsHub no será responsable por:
• Uso indebido de credenciales compartidas
• Accesos no autorizados derivados de negligencia del Negocio`,
  },
  {
    title: '7. FRANQUICIAS Y SUCURSALES',
    body: `En modelos de franquicia:
• RewardsHub no interviene en disputas internas
• La gestión de accesos y datos es responsabilidad del Negocio
• No actúa como mediador entre franquiciador y franquiciatarios`,
  },
  {
    title: '8. RESPONSABILIDAD OPERATIVA DEL NEGOCIO',
    body: `El Negocio es el único responsable de:
• Configuración de promociones
• Viabilidad económica de recompensas
• Condiciones ofrecidas a Clientes Finales
• Cumplimiento de leyes de consumo y fiscales

RewardsHub no garantiza rentabilidad ni resultados comerciales.`,
  },
  {
    title: '9. EMPLEADOS Y FRAUDE INTERNO',
    body: `El Negocio es responsable de supervisar a su personal.

RewardsHub no será responsable por:
• Uso indebido del sistema por empleados
• Fraude interno
• Asignación incorrecta de beneficios`,
  },
  {
    title: '10. PAGOS Y FACTURACIÓN',
    body: `Los pagos se procesan a través de terceros (ej. Stripe).

El Negocio acepta que:
• Stripe es un proveedor independiente
• RewardsHub no controla ni garantiza el servicio de Stripe
• No se almacenan datos bancarios en RewardsHub

RewardsHub no será responsable por cargos duplicados, retenciones o fallas en el procesamiento.
La falta de pago podrá resultar en suspensión o cancelación del servicio.`,
  },
  {
    title: '11. DISPONIBILIDAD DEL SERVICIO',
    body: `RewardsHub no garantiza disponibilidad ininterrumpida. El servicio puede verse afectado por fallas técnicas, mantenimiento o problemas de terceros (hosting, internet, Stripe).
No existe obligación de compensación por interrupciones.`,
  },
  {
    title: '12. LIMITACIÓN DE RESPONSABILIDAD',
    body: `En la máxima medida permitida por la ley, RewardsHub no será responsable por pérdidas indirectas, lucro cesante, daños reputacionales ni pérdida de datos.
La responsabilidad total se limitará al monto pagado por El Negocio en los últimos 3 meses.`,
  },
  {
    title: '13. INDEMNIZACIÓN',
    body: `El Negocio se obliga a indemnizar y sacar en paz y a salvo a RewardsHub de cualquier reclamación derivada de:
• Promociones o beneficios ofrecidos
• Incumplimiento legal del Negocio
• Relación con Clientes Finales
• Uso indebido de la plataforma`,
  },
  {
    title: '14. PROPIEDAD INTELECTUAL',
    body: `Todo el software, diseño, algoritmos y marca son propiedad de RewardsHub.
El Negocio no adquiere ningún derecho de propiedad.`,
  },
  {
    title: '15. PROPIEDAD Y USO DE DATOS',
    body: `El Negocio es propietario de sus datos.

RewardsHub podrá usar datos anonimizados y agregados para:
• Mejora del servicio
• Estadísticas
• Análisis internos`,
  },
  {
    title: '16. PROTECCIÓN DE DATOS PERSONALES',
    body: `De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP):
• El Negocio es el Responsable
• RewardsHub actúa como Encargado

El Negocio garantiza tener consentimiento de sus Clientes Finales y cumplir con su aviso de privacidad.
RewardsHub tratará los datos conforme a instrucciones del Negocio.`,
  },
  {
    title: '17. TERMINACIÓN DEL SERVICIO',
    body: `RewardsHub podrá suspender o cancelar el servicio en caso de incumplimiento de estos términos, falta de pago o uso indebido.
El Negocio puede cancelar en cualquier momento. No habrá reembolsos, salvo disposición expresa.

Tras la terminación, los datos podrán eliminarse tras un periodo razonable. Es responsabilidad del Negocio solicitar exportación previa.`,
  },
  {
    title: '18. MODIFICACIONES DEL SERVICIO Y TÉRMINOS',
    body: `RewardsHub podrá modificar funcionalidades, actualizar precios o cambiar estos términos.
Las modificaciones surtirán efecto al ser publicadas.`,
  },
  {
    title: '19. FUERZA MAYOR',
    body: `RewardsHub no será responsable por incumplimientos derivados de eventos fuera de su control, incluyendo fallas de internet, ataques cibernéticos, desastres naturales o fallas de terceros.`,
  },
  {
    title: '20. COMUNICACIONES',
    body: `El Negocio y el Cliente Final autoriza recibir correos electrónicos, notificaciones y comunicaciones operativas y promocionales.`,
  },
  {
    title: '21. LEGISLACIÓN APLICABLE Y JURISDICCIÓN',
    body: `Este contrato se rige por las leyes de México.
Las partes se someten a los tribunales de Guadalajara, Jalisco, renunciando a cualquier otro fuero.`,
  },
];

export default function TermsPage() {
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
            <h1 className="text-base font-bold text-neutral-900 leading-tight">Términos y Condiciones</h1>
            <p className="text-xs text-neutral-500">RewardsHub – Uso para Negocios</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-xl font-extrabold text-neutral-900 mb-1">
            REWARDSHUB – TÉRMINOS Y CONDICIONES DE USO PARA NEGOCIOS
          </h2>
          <p className="text-xs text-neutral-400">Última actualización: Abril 2026</p>
        </div>

        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#EBA626] uppercase tracking-wide mb-3">{s.title}</h3>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}

        <p className="text-center text-xs text-neutral-400 pb-4">
          © 2026 RewardsHub · Samuel Pia Figueroa · Guadalajara, Jalisco, México
        </p>
      </div>
    </div>
  );
}
