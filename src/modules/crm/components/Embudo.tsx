import React from 'react';
import KanbanBoard from './prospects/KanbanBoard';

export default function Embudo() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Embudo de Ventas</h1>
                <p className="text-gray-500 mt-1">Gestiona y da seguimiento a tus oportunidades comerciales. Arrastra y suelta los prospectos para actualizar su etapa en el proceso de venta.</p>
            </div>
            <KanbanBoard hideHeader={true} />
        </div>
    );
}
