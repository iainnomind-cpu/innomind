import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { useAuth } from '@/context/AuthContext';
import { useAI } from '../../context/AIContext';
import { supabase } from '@/lib/supabase';
import { Settings, Boxes, ToggleLeft, ToggleRight, Building2, Zap, Save, Plus, X, Bell, Upload, ImageIcon, Sparkles } from 'lucide-react';

const availableModules = [
  { key: 'inventory', label: 'Inventario', description: 'Gestiona productos, stock, entradas/salidas y asigna materiales a proyectos.', icon: Boxes },
  { key: 'hr', label: 'Recursos Humanos', description: 'Gestiona empleados, tarifas por hora y roles.', icon: Building2 },
];

export default function TrakSettings() {
  const { workspaceId, moduleSettings, toggleModule } = useTrak();
  const { tokensUsed, tokensLimit } = useAI();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'modules' | 'automation' | 'notifications' | 'ai'>('general');
  const [workspaceSettings, setWorkspaceSettings] = useState<any>({
    default_currency: 'MXN',
    default_tax_rate: 16,
    default_project_phases: ['Planificación', 'Ejecución', 'Cierre'],
    alert_low_inventory: true,
    alert_overdue_tasks: true,
    company_name: '',
    company_logo_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPhase, setNewPhase] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => { 
    if (workspaceId) {
      fetchSettings();
    }
  }, [workspaceId]);

  const fetchSettings = async () => {
    setIsLoading(true);

    // Fetch Workspace Settings
    const { data: wsData } = await supabase.from('trak_workspace_settings').select('*').eq('workspace_id', workspaceId).single();
    if (wsData) {
      setWorkspaceSettings(wsData);
    } else {
      // Initialize if not exists
        const initialSettings = { 
          workspace_id: workspaceId, 
          default_currency: 'MXN', 
          default_tax_rate: 16, 
          default_project_phases: ['Planificación', 'Ejecución', 'Cierre'],
          alert_low_inventory: true,
          alert_overdue_tasks: true,
          company_name: '',
          company_logo_url: ''
        };
      await supabase.from('trak_workspace_settings').insert([initialSettings]);
      setWorkspaceSettings(initialSettings);
    }
    
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await supabase.from('trak_workspace_settings')
      .update({
        default_currency: workspaceSettings.default_currency,
        default_tax_rate: workspaceSettings.default_tax_rate,
        default_project_phases: workspaceSettings.default_project_phases,
        alert_low_inventory: workspaceSettings.alert_low_inventory,
        alert_overdue_tasks: workspaceSettings.alert_overdue_tasks,
        company_name: workspaceSettings.company_name,
        company_logo_url: workspaceSettings.company_logo_url
      })
      .eq('workspace_id', workspaceId);
    setIsSaving(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 2 MB.');
      return;
    }
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setWorkspaceSettings((prev: any) => ({ ...prev, company_logo_url: reader.result as string }));
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhase = () => {
    if (!newPhase.trim()) return;
    setWorkspaceSettings({
      ...workspaceSettings,
      default_project_phases: [...(workspaceSettings.default_project_phases || []), newPhase.trim()]
    });
    setNewPhase('');
  };

  const handleRemovePhase = (index: number) => {
    const newPhases = [...workspaceSettings.default_project_phases];
    newPhases.splice(index, 1);
    setWorkspaceSettings({ ...workspaceSettings, default_project_phases: newPhases });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando configuraciones...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings size={24} className="text-purple-600" /> Configuración de Trak
          </h1>
          <p className="text-gray-500 text-sm mt-1">Personaliza el comportamiento del sistema para tu empresa.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Building2 size={16}/> General
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'automation' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Zap size={16}/> Automatización
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notifications' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Bell size={16}/> Alertas y Notificaciones
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'modules' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Boxes size={16}/> Módulos Opcionales
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ai' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Sparkles size={16}/> IA Assistant
          </button>
        </div>

        {/* Content */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-8">
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-4">Identidad de la Empresa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                  <input 
                    type="text" 
                    value={workspaceSettings.company_name || ''}
                    onChange={(e) => setWorkspaceSettings({...workspaceSettings, company_name: e.target.value})}
                    placeholder="Ej. Innomind Solutions"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Este nombre aparecerá en tus cotizaciones y reportes.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logotipo de la Empresa</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {workspaceSettings.company_logo_url ? (
                        <img src={workspaceSettings.company_logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImageIcon size={28} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <Upload size={15} />
                        {logoUploading ? 'Procesando...' : 'Subir imagen'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                        />
                      </label>
                      {workspaceSettings.company_logo_url && (
                        <button
                          onClick={() => setWorkspaceSettings((prev: any) => ({ ...prev, company_logo_url: '' }))}
                          className="text-xs text-red-500 hover:text-red-700 font-medium text-left"
                        >
                          Eliminar logo
                        </button>
                      )}
                      <p className="text-xs text-gray-400">PNG, JPG, SVG · Máx. 2 MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Finanzas y Facturación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda por Defecto</label>
                  <select 
                    value={workspaceSettings.default_currency || 'MXN'}
                    onChange={(e) => setWorkspaceSettings({...workspaceSettings, default_currency: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Se usará en cotizaciones y control de costos.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Impuesto Base (%)</label>
                  <input 
                    type="number" 
                    value={workspaceSettings.default_tax_rate || 0}
                    onChange={(e) => setWorkspaceSettings({...workspaceSettings, default_tax_rate: parseFloat(e.target.value) || 0})}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">El IVA que se aplicará por defecto en nuevas cotizaciones.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                <Save size={18} />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Fases de Proyecto Predeterminadas</h2>
              <p className="text-sm text-gray-500 mb-4">Estas fases se crearán automáticamente cada vez que inicies un nuevo proyecto.</p>
              
              <div className="space-y-3 mb-4">
                {(workspaceSettings.default_project_phases || []).map((phase: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <span className="flex-1 font-medium text-sm text-gray-900">{phase}</span>
                    <button onClick={() => handleRemovePhase(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Nueva fase (ej. Análisis de Requerimientos)"
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPhase()}
                  className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                />
                <button 
                  onClick={handleAddPhase}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} /> Agregar
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                <Save size={18} />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Preferencias de Alertas</h2>
              <p className="text-sm text-gray-500 mb-6">Configura qué eventos deben generar notificaciones automáticas en el sistema.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Alerta de Inventario Bajo</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Te avisa cuando un producto alcanza o baja de su nivel mínimo de stock.</p>
                  </div>
                  <button 
                    onClick={() => setWorkspaceSettings({...workspaceSettings, alert_low_inventory: !workspaceSettings.alert_low_inventory})} 
                    className="shrink-0"
                  >
                    {workspaceSettings.alert_low_inventory ? (
                      <ToggleRight size={36} className="text-purple-600" />
                    ) : (
                      <ToggleLeft size={36} className="text-gray-300" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Alerta de Tareas Vencidas</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Te notifica si hay tareas importantes que han superado su fecha de entrega.</p>
                  </div>
                  <button 
                    onClick={() => setWorkspaceSettings({...workspaceSettings, alert_overdue_tasks: !workspaceSettings.alert_overdue_tasks})} 
                    className="shrink-0"
                  >
                    {workspaceSettings.alert_overdue_tasks ? (
                      <ToggleRight size={36} className="text-purple-600" />
                    ) : (
                      <ToggleLeft size={36} className="text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                <Save size={18} />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Módulos Opcionales</h2>
              <p className="text-xs text-gray-500 mt-1">Los módulos activados aparecerán en tu menú lateral izquierdo.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {availableModules.map(mod => {
                const Icon = mod.icon;
                const enabled = !!moduleSettings[mod.key];
                return (
                  <div key={mod.key} className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{mod.label}</h3>
                      <p className="text-sm text-gray-500">{mod.description}</p>
                    </div>
                    <button onClick={() => toggleModule(mod.key)} className="shrink-0">
                      {enabled ? (
                        <ToggleRight size={36} className="text-purple-600" />
                      ) : (
                        <ToggleLeft size={36} className="text-gray-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Assistant */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Inno – Asistente IA</h2>
                  <p className="text-sm text-gray-500">Configura tu asistente inteligente global y gestiona el uso de tokens (OpenAI).</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">Uso de Tokens (Ciclo Mensual)</h3>
                
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Progreso de consumo</span>
                  <span className="font-bold text-gray-900">{tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className={`h-3 rounded-full ${tokensUsed / tokensLimit > 0.9 ? 'bg-red-500' : tokensUsed / tokensLimit > 0.75 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${Math.min((tokensUsed / tokensLimit) * 100, 100)}%` }}></div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <Zap size={24} className="text-purple-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-900 text-sm mb-1">Recargar Tokens Extras</h4>
                    <p className="text-xs text-purple-700 mb-3">Si excedes tu límite mensual, puedes comprar paquetes de tokens adicionales para mantener a Inno funcionando sin interrupciones.</p>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
                      Comprar +1M Tokens ($15 USD)
                    </button>
                    <p className="text-[10px] text-purple-500 mt-2">* La integración con pago seguro de Stripe estará disponible próximamente.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-gray-900">Capacidades de Inno</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: 'Proyectos', desc: 'Crear y consultar proyectos' },
                    { name: 'Cotizaciones', desc: 'Generar y listar cotizaciones' },
                    { name: 'Clientes', desc: 'Crear y consultar clientes' },
                    { name: 'Tareas', desc: 'Crear y consultar tareas pendientes' },
                    { name: 'Inventario', desc: 'Registrar y consultar productos' },
                    { name: 'Recursos Humanos', desc: 'Registrar y consultar empleados' },
                    { name: 'Calendario', desc: 'Ver eventos y vencimientos próximos' },
                    { name: 'Historial', desc: 'Conversaciones guardadas automáticamente' },
                  ].map(cap => (
                    <label key={cap.name} className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-purple-200 transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">{cap.name}</p>
                        <p className="text-xs text-gray-500">{cap.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
