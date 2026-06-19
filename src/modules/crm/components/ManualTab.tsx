import React from 'react';
import { BookOpen, CheckCircle, Lightbulb, AlertTriangle, LayoutDashboard, Users, Filter, FileText, Calendar, ShoppingBag, Package, DollarSign } from 'lucide-react';

const ManualTab: React.FC = () => {
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 animate-in fade-in max-h-[80vh] overflow-y-auto relative">
            <div className="pb-4 border-b border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Manual de Usuario - Innomind Corē</h2>
                    <p className="text-sm text-gray-500 mt-1">Guía completa para sacar el máximo provecho a la plataforma ERP & CRM.</p>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Navegación Rápida</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => scrollToSection('sec-dashboard')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">1. Panel de Control</button>
                    <button onClick={() => scrollToSection('sec-prospectos')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">2. Prospectos y Clientes</button>
                    <button onClick={() => scrollToSection('sec-embudo')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">3. Embudo de Ventas</button>
                    <button onClick={() => scrollToSection('sec-cotizaciones')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">4. Cotizaciones</button>
                    <button onClick={() => scrollToSection('sec-calendario')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">5. Calendario</button>
                    <button onClick={() => scrollToSection('sec-compras')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">6. Compras (Procurement)</button>
                    <button onClick={() => scrollToSection('sec-inventario')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">7. Inventario</button>
                    <button onClick={() => scrollToSection('sec-finanzas')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">8. Finanzas</button>
                    <button onClick={() => scrollToSection('sec-configuracion')} className="text-left text-sm text-gray-600 hover:text-blue-600 font-medium">9. Configuración</button>
                </div>
            </div>

            <div className="space-y-12">
                {/* 1. Dashboard */}
                <section id="sec-dashboard" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <LayoutDashboard className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">1. Panel de Control (Dashboard)</h3>
                    </div>
                    <p className="text-gray-600 mb-4">El Dashboard es tu pantalla principal. Funciona como el centro de mando gerencial en tiempo real.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-600 mb-4">
                        <li><strong>Métricas Clave:</strong> Visualiza de forma rápida tus ingresos, total de prospectos activos, y el valor total de tu embudo de ventas.</li>
                        <li><strong>Gráficas de Rendimiento:</strong> Observa la tendencia de crecimiento a través del tiempo.</li>
                        <li><strong>Agenda y Tareas:</strong> Del lado derecho, podrás ver tus próximas reuniones y seguimientos pendientes para el día de hoy.</li>
                    </ul>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3">
                        <Lightbulb className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-yellow-800"><strong>Recomendación:</strong> Convierte la revisión de este panel en tu primer paso todos los días. Te ayudará a organizar tus prioridades.</p>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 2. Prospectos */}
                <section id="sec-prospectos" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">2. CRM: Prospectos y Clientes</h3>
                    </div>
                    <p className="text-gray-600 mb-6">El corazón de la gestión comercial. Aquí administrarás toda la base de datos de personas y empresas con las que interactúas.</p>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-2">¿Cómo dar de alta un prospecto?</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600 mb-6">
                        <li>Ve a la sección de Prospectos en el menú.</li>
                        <li>Haz clic en el botón superior derecho "Nuevo Prospecto".</li>
                        <li>Llena el formulario con su Nombre, Empresa, Correo, Teléfono y nivel de interés.</li>
                        <li>Da clic en Guardar.</li>
                    </ol>

                    <h4 className="text-lg font-bold text-gray-800 mb-2">¿Cómo dar seguimiento? (Línea de Tiempo)</h4>
                    <p className="text-gray-600 mb-6">Al dar clic sobre el nombre de cualquier prospecto, entrarás a su perfil detallado. Ahí encontrarás la Línea de Tiempo, donde podrás registrar cada interacción (llamada, correo, reunión). Simplemente escribe lo que hablaron en el cuadro de texto y guárdalo. Así generarás un historial impecable.</p>

                    <h4 className="text-lg font-bold text-gray-800 mb-2">La Secuencia Mágica ✨</h4>
                    <p className="text-gray-600 mb-6">Si el sistema detecta que un prospecto ha estado abandonado por mucho tiempo o no tiene tareas asignadas, te sugerirá Lanzar Secuencia Mágica. Al activarla, el sistema creará automáticamente tareas sugeridas para evitar que la venta se enfríe.</p>

                    <h4 className="text-lg font-bold text-gray-800 mb-2">¿Cómo convertirlo a Cliente?</h4>
                    <p className="text-gray-600">Una vez que el prospecto acepta una cotización y confirma su primera compra, puedes ir a su perfil y cambiar su estado. Al cambiar de "Prospecto" a "Cliente", se moverá automáticamente a tu cartera de Clientes Activos.</p>
                </section>

                <hr className="border-gray-100" />

                {/* 3. Embudo */}
                <section id="sec-embudo" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">3. CRM: Embudo de Ventas</h3>
                    </div>
                    <p className="text-gray-600 mb-4">El embudo o Pipeline es una vista visual tipo tablero Kanban para tus oportunidades.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-600">
                        <li><strong>Columnas de Etapas:</strong> Tus prospectos estarán agrupados en columnas (Nuevo, Contactado, Cotizado, Ganado).</li>
                        <li><strong>Arrastrar y Soltar:</strong> Para cambiar a un prospecto de etapa, simplemente haz clic sobre su tarjeta, mantén presionado, y arrástralo a la siguiente columna.</li>
                        <li><strong>Visibilidad Rápida:</strong> Las tarjetas te muestran el valor monetario de esa oportunidad, ayudándote a enfocar esfuerzos en los tratos más jugosos.</li>
                    </ul>
                </section>

                <hr className="border-gray-100" />

                {/* 4. Cotizaciones */}
                <section id="sec-cotizaciones" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">4. CRM: Cotizaciones</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Genera propuestas comerciales profesionales en segundos, conectadas a tu inventario.</p>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-2">¿Cómo crear una cotización?</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600 mb-6">
                        <li>Entra al módulo de Cotizaciones y haz clic en Nueva Cotización.</li>
                        <li>Selecciona al Prospecto o Cliente.</li>
                        <li>Elige los productos o servicios de tu catálogo y define las cantidades. El sistema calculará automáticamente.</li>
                        <li>Puedes agregar Notas o Términos adicionales.</li>
                        <li>Al finalizar, la cotización se guardará. Puedes exportarla a PDF para enviarla.</li>
                    </ol>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-3">
                        <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-800">Cuando el cliente confirme la compra, asegúrate de marcar la cotización como <strong>Aceptada</strong>. Esto activará automáticamente una cuenta por cobrar en Finanzas.</p>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 5. Calendario */}
                <section id="sec-calendario" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">5. CRM: Calendario</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Tu agenda personal y de equipo, integrada al 100% con los prospectos.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-600">
                        <li>Crea eventos como "Llamada de Demostración" o "Comida de Negocios".</li>
                        <li>Al crear el evento, puedes vincularlo directamente a un prospecto en específico.</li>
                        <li><strong>Ventaja:</strong> Si lo vinculas, la reunión no solo aparecerá en el calendario, sino que también se quedará guardada en la Línea de Tiempo del prospecto para futuras referencias.</li>
                    </ul>
                </section>

                <hr className="border-gray-100" />

                {/* 6. Compras */}
                <section id="sec-compras" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ShoppingBag className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">6. Módulo de Compras (Procurement)</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Control total sobre lo que gasta la empresa. Administra proveedores y pide mercancía de forma controlada.</p>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Directorio de Proveedores</h4>
                    <p className="text-gray-600 mb-6">Da de alta a las empresas que te surten materiales o servicios. Puedes calificar su nivel de cumplimiento y guardar sus datos bancarios.</p>

                    <h4 className="text-lg font-bold text-gray-800 mb-2">Solicitudes y Órdenes de Compra</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-600">
                        <li><strong>Solicitudes:</strong> Cualquier miembro puede levantar una solicitud interna de compra.</li>
                        <li><strong>Aprobaciones:</strong> Los administradores revisan y aprueban o rechazan de acuerdo al presupuesto.</li>
                        <li><strong>Órdenes (PO):</strong> Si se aprueba, se convierte en Orden de Compra para enviar al proveedor.</li>
                        <li><strong>Recepción:</strong> Cuando llega la mercancía, confirmas la recepción para actualizar el inventario automáticamente.</li>
                    </ul>
                </section>

                <hr className="border-gray-100" />

                {/* 7. Inventario */}
                <section id="sec-inventario" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Package className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">7. Inventario</h3>
                    </div>
                    <p className="text-gray-600 mb-4">El catálogo maestro de los productos y servicios que vendes o compras.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-600">
                        <li><strong>Alta de Productos:</strong> Asigna SKU, nombre, categoría y precio base.</li>
                        <li><strong>Control de Stock:</strong> Te dirá exactamente cuántas unidades quedan.</li>
                        <li><strong>Movimientos:</strong> Vender descuenta mercancía; comprar aumenta el stock.</li>
                    </ul>
                </section>

                <hr className="border-gray-100" />

                {/* 8. Finanzas */}
                <section id="sec-finanzas" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">8. Finanzas</h3>
                    </div>
                    <p className="text-gray-600 mb-6">El cerebro económico de la operación. Cuentas por Cobrar y Pagar.</p>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Cuentas por Cobrar y Abonos</h4>
                    <p className="text-gray-600 mb-6">Cuando se acepta una cotización, aparece aquí. Entra a la cuenta, haz clic en "Registrar Pago", ingresa el monto, y el sistema actualizará el saldo restante.</p>

                    <h4 className="text-lg font-bold text-gray-800 mb-2">Cuentas por Pagar</h4>
                    <p className="text-gray-600">Al recibir órdenes de compra, se genera una deuda con proveedores. Aquí llevas control de qué facturas faltan por pagar para evitar recargos.</p>
                </section>

                <hr className="border-gray-100" />

                {/* 9. Config */}
                <section id="sec-configuracion" className="scroll-mt-6 pb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-gray-700 font-bold">9</div>
                        <h3 className="text-2xl font-bold text-gray-900">Configuración de la Empresa</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Acceso exclusivo para Administradores desde la esquina inferior izquierda del menú.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-600 mb-6">
                        <li><strong>Identidad:</strong> Sube tu logo y define tu color corporativo.</li>
                        <li><strong>Módulos:</strong> Activa o desactiva módulos para que tu equipo solo vea lo que necesita.</li>
                        <li><strong>Usuarios:</strong> Invita a tu equipo y asígnales permisos.</li>
                    </ul>

                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg flex items-start gap-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-red-800"><strong>Advertencia:</strong> Ten mucho cuidado al otorgar el rol de "Administrador", ya que permite ver finanzas y configurar el sistema. Asigna rol "Empleado" al resto del equipo.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ManualTab;
