import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function TerminosPage() {
  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 -z-10" />
          
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-center">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 text-center mb-12">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-blue dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-li:text-slate-600 dark:prose-li:text-slate-300">
              <h2>1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar las plataformas y servicios de Innomind Inc. (incluyendo Corē, Trak y desarrollos a medida), usted acepta estar sujeto a los presentes Términos y Condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de cualquier ley local aplicable. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio y sus servicios.
              </p>

              <h2>2. Licencia de Uso</h2>
              <p>
                Para nuestras plataformas SaaS (Corē y Trak), se le concede una licencia temporal, no exclusiva y no transferible para utilizar el software de Innomind bajo el modelo de suscripción, sujeta a las siguientes restricciones:
              </p>
              <ul>
                <li>No podrá modificar, descompilar, aplicar ingeniería inversa o copiar el software de la plataforma.</li>
                <li>No podrá utilizar el software para ningún propósito comercial que compita directamente con Innomind.</li>
                <li>No podrá transferir los materiales a otra persona o "reflejar" los materiales en cualquier otro servidor sin autorización expresa.</li>
              </ul>
              <p>
                Esta licencia terminará automáticamente si usted viola cualquiera de estas restricciones y puede ser terminada por Innomind en cualquier momento ante el incumplimiento de pago o uso indebido.
              </p>

              <h2>3. Suscripciones y Pagos</h2>
              <p>
                El acceso a Corē y Trak se factura mensualmente de forma anticipada. No hay reembolsos ni créditos por meses parciales de servicio, reembolsos de actualización/rebaja, o reembolsos por meses sin usar con una cuenta abierta.
              </p>
              <p>
                En el caso de Desarrollos a Medida, los pagos se realizarán de acuerdo al esquema acordado en el contrato de prestación de servicios específico para cada proyecto, siendo propiedad del cliente el código fuente una vez liquidado el 100% del proyecto.
              </p>

              <h2>4. Disponibilidad del Servicio</h2>
              <p>
                Innomind se esfuerza por asegurar que sus servicios estén disponibles el 99.9% del tiempo. Sin embargo, no nos hacemos responsables por la indisponibilidad temporal del servicio debido a mantenimiento programado o problemas técnicos fuera de nuestro control, como interrupciones de los proveedores de nube.
              </p>

              <h2>5. Propiedad de la Información</h2>
              <p>
                Usted conserva en todo momento la propiedad intelectual y los derechos sobre todos los datos e información que ingrese a través de nuestras plataformas. Innomind no reclamará ninguna propiedad sobre los datos de sus clientes. Usted puede exportar y descargar su información en cualquier momento mientras su suscripción esté activa.
              </p>

              <h2>6. Limitaciones de Responsabilidad</h2>
              <p>
                En ningún caso Innomind o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surja del uso o la imposibilidad de usar los materiales o servicios de Innomind.
              </p>

              <h2>7. Modificaciones a los Términos</h2>
              <p>
                Innomind puede revisar estos términos de servicio en cualquier momento sin previo aviso. Al utilizar este sitio web y nuestras plataformas, usted acepta estar sujeto a la versión actual de estos términos de servicio.
              </p>

              <h2>8. Ley Aplicable</h2>
              <p>
                Cualquier reclamación relacionada con el sitio web y servicios de Innomind se regirá por las leyes locales correspondientes al domicilio de la empresa, sin consideración a sus disposiciones de conflicto de leyes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
