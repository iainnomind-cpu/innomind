import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function PrivacidadPage() {
  return (
    <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 -z-10" />
          
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-center">
              Aviso de Privacidad
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 text-center mb-12">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-blue dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white">
              <h2>1. Identidad y domicilio del responsable</h2>
              <p>
                Innomind Inc. (en adelante "Innomind"), con domicilio en [Dirección de la empresa], es responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
              </p>

              <h2>2. Datos personales que recabamos</h2>
              <p>
                Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:
              </p>
              <ul>
                <li>Nombre completo</li>
                <li>Correo electrónico corporativo</li>
                <li>Teléfono de contacto</li>
                <li>Nombre de la empresa o lugar de trabajo</li>
                <li>Datos de facturación e información fiscal</li>
                <li>Información generada durante el uso de nuestras plataformas Corē y Trak</li>
              </ul>

              <h2>3. Finalidades del tratamiento de datos</h2>
              <p>
                Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades primarias que son necesarias para el servicio que solicita:
              </p>
              <ul>
                <li>Creación y administración de su cuenta en nuestras plataformas.</li>
                <li>Procesar sus pagos y emitir los comprobantes fiscales correspondientes.</li>
                <li>Brindar soporte técnico y atención al cliente.</li>
                <li>Garantizar la seguridad de su información y prevenir fraudes.</li>
              </ul>
              <p>
                De manera adicional, utilizaremos su información personal para las siguientes finalidades secundarias que nos permiten y facilitan brindarle un mejor servicio:
              </p>
              <ul>
                <li>Envío de correos promocionales y actualizaciones sobre nuevos productos o funciones.</li>
                <li>Evaluar la calidad del servicio que le brindamos.</li>
              </ul>

              <h2>4. Uso de Tecnologías de Rastreo (Cookies)</h2>
              <p>
                Le informamos que en nuestra página de internet utilizamos cookies, web beacons y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de internet, así como brindarle un mejor servicio y experiencia de usuario al navegar en nuestra página.
              </p>

              <h2>5. Medidas de Seguridad</h2>
              <p>
                Innomind ha implementado medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. Utilizamos encriptación AES-256 en reposo y TLS 1.3 en tránsito.
              </p>

              <h2>6. Derechos ARCO</h2>
              <p>
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
              </p>
              <p>
                Para el ejercicio de cualquiera de los derechos ARCO, usted deberá enviar una solicitud respectiva a través del correo electrónico: <strong>contacto@innomind.com</strong>.
              </p>

              <h2>7. Modificaciones al Aviso de Privacidad</h2>
              <p>
                El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas. 
                Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, a través de nuestra página web o mediante un correo electrónico dirigido a la dirección que nos haya proporcionado.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
