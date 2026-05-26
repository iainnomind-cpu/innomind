import React, { useState, useEffect } from 'react';
import { useTrak } from '../../context/TrakContext';
import { supabase } from '@/lib/supabase';
import { useUsers } from '@/context/UserContext';
import { 
  Package, Plus, Search, Edit3, Trash2, X, AlertTriangle, 
  ArrowDown, ArrowUp, RotateCw, MapPin, ClipboardList, ArrowRightLeft, FolderOpen, User, ChevronDown, ChevronUp
} from 'lucide-react';

const categoryOptions = ['General', 'Materiales', 'Herramientas', 'Consumibles', 'Equipos', 'Refacciones', 'Otro'];
const unitOptions = ['pza', 'kg', 'lt', 'mt', 'rollo', 'caja', 'par', 'juego', 'servicio'];

export default function InventoryList() {
  const { workspaceId, projects } = useTrak();
  const { users } = useUsers();

  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouses' | 'movements'>('inventory');
  
  // States for products, warehouses, stocks and movements
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [movementSearch, setMovementSearch] = useState('');
  const [filterMovementType, setFilterMovementType] = useState('all');
  const [filterMovementLoc, setFilterMovementLoc] = useState('all');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showMovement, setShowMovement] = useState<any>(null);

  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  // Expandable product IDs (to show stocks breakdown)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  useEffect(() => { 
    if (workspaceId) {
      fetchData(); 
    }
  }, [workspaceId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch products
      const { data: itemsData } = await supabase
        .from('trak_inventory')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name');
      
      // 2. Fetch locations
      const { data: locData } = await supabase
        .from('trak_warehouse_locations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name');

      const activeItems = itemsData || [];
      const activeLocs = locData || [];

      setItems(activeItems);
      setLocations(activeLocs);

      // 3. Fetch stocks for these products
      if (activeItems.length > 0) {
        const { data: stocksData } = await supabase
          .from('trak_inventory_stocks')
          .select('*')
          .in('inventory_id', activeItems.map(i => i.id));
        setStocks(stocksData || []);
      } else {
        setStocks([]);
      }

      // 4. Fetch movements
      const { data: moveData } = await supabase
        .from('trak_inventory_movements')
        .select('*, project:project_id(id, name)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      setMovements(moveData || []);

    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este producto del inventario? Se eliminará todo su historial y stock.')) return;
    await supabase.from('trak_inventory').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('¿Eliminar este almacén? Todo el stock en esta locación quedará sin asignar.')) return;
    await supabase.from('trak_warehouse_locations').delete().eq('id', id);
    fetchData();
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProductStocks = (productId: string) => {
    return stocks.filter(s => s.inventory_id === productId);
  };

  const getUserName = (userId: string) => {
    const u = users.find(x => x.id === userId);
    return u ? u.name : 'Usuario Trak';
  };

  // Product filters
  const filteredItems = items.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  // Movement filters
  const filteredMovements = movements.filter(m => {
    const product = items.find(i => i.id === m.inventory_id);
    const prodName = product ? product.name : '';
    const matchSearch = !movementSearch || 
      prodName.toLowerCase().includes(movementSearch.toLowerCase()) || 
      (m.notes || '').toLowerCase().includes(movementSearch.toLowerCase());
    
    const matchType = filterMovementType === 'all' || m.type === filterMovementType;
    const matchLoc = filterMovementLoc === 'all' || m.from_location_id === filterMovementLoc || m.to_location_id === filterMovementLoc;
    
    return matchSearch && matchType && matchLoc;
  });

  // Stats computation
  const lowStock = items.filter(i => {
    const productStocks = getProductStocks(i.id);
    // Alert if stock is below min in any of the locations, or total sum is below aggregate min
    const totalQty = productStocks.reduce((sum, s) => sum + parseFloat(s.quantity), 0);
    return totalQty <= i.min_stock && i.min_stock > 0;
  });
  const totalValue = items.reduce((sum, i) => {
    const productStocks = getProductStocks(i.id);
    const totalQty = productStocks.reduce((s, st) => s + parseFloat(st.quantity), 0);
    return sum + (totalQty * (i.unit_cost || 0));
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-purple-600 animate-pulse" size={26} /> Gestión de Inventario
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {items.length} productos · Valorización: ${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'warehouses' ? (
            <button onClick={() => { setEditingLocation(null); setShowLocationForm(true); }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-600/20">
              <Plus size={18} /> Nuevo Almacén
            </button>
          ) : (
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-600/20">
              <Plus size={18} /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button onClick={() => setActiveTab('inventory')}
          className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'inventory' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Package size={16} /> Inventario de Productos
        </button>
        <button onClick={() => setActiveTab('warehouses')}
          className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'warehouses' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <MapPin size={16} /> Almacenes y Bodegas
        </button>
        <button onClick={() => setActiveTab('movements')}
          className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'movements' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <ClipboardList size={16} /> Historial de Movimientos
        </button>
      </div>

      {/* Warnings */}
      {lowStock.length > 0 && activeTab === 'inventory' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-amber-800 font-bold">Stock bajo detectado</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con existencia crítica: {lowStock.map(i => i.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PRODUCT INVENTORY TAB */}
      {/* ======================================================== */}
      {activeTab === 'inventory' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar por nombre o SKU..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm transition-all" />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm cursor-pointer focus:ring-2 focus:ring-purple-500">
              <option value="all">Todas las categorías</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4 text-center">Stock Total</th>
                    <th className="px-6 py-4 text-right">Costo Promedio</th>
                    <th className="px-6 py-4 text-right">Valor Total</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Cargando catálogo...</td></tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <Package className="mx-auto mb-3 text-gray-200" size={40} />
                        <p className="font-semibold text-gray-900">No se encontraron productos</p>
                        <p className="text-xs text-gray-500 mt-1">Intenta ajustando los filtros o crea un nuevo producto.</p>
                      </td>
                    </tr>
                  ) : filteredItems.map(item => {
                    const prodStocks = getProductStocks(item.id);
                    const totalQty = prodStocks.reduce((s, st) => s + parseFloat(st.quantity), 0);
                    const isLow = totalQty <= item.min_stock && item.min_stock > 0;
                    const isExpanded = !!expandedItems[item.id];

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <button onClick={() => toggleExpand(item.id)} className="p-1 text-gray-400 hover:text-purple-600 transition-colors mt-0.5 rounded-lg hover:bg-gray-100">
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                              <div>
                                <p className="font-bold text-gray-950">{item.name}</p>
                                {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg">{item.category || 'General'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold text-base ${isLow ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md' : 'text-gray-900'}`}>
                              {totalQty} {item.unit}
                            </span>
                            {item.min_stock > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Mínimo: {item.min_stock} {item.unit}</p>}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-700">
                            ${(item.unit_cost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-950">
                            ${(totalQty * (item.unit_cost || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setShowMovement(item)} title="Registrar Movimiento"
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><RotateCw size={16} /></button>
                              <button onClick={() => { setEditingItem(item); setShowForm(true); }} title="Editar"
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                              <button onClick={() => handleDeleteItem(item.id)} title="Eliminar"
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded stock breakdown row */}
                        {isExpanded && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={6} className="px-10 py-3 border-t border-gray-100">
                              <div className="max-w-md space-y-2 py-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Desglose de existencias por locación</p>
                                {locations.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic">No hay almacenes configurados. Agrega uno en la pestaña 'Almacenes'.</p>
                                ) : (
                                  locations.map((loc: any) => {
                                    const matchStock = prodStocks.find(s => s.location_id === loc.id);
                                    const qty = matchStock ? parseFloat(matchStock.quantity) : 0;
                                    const min = matchStock ? parseFloat(matchStock.min_stock) : 0;
                                    const isLocLow = qty <= min && min > 0;

                                    return (
                                      <div key={loc.id} className="flex justify-between items-center py-1.5 px-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                                        <div className="flex items-center gap-2">
                                          <MapPin size={12} className="text-gray-400" />
                                          <span className="text-xs font-semibold text-gray-700">{loc.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          {min > 0 && <span className="text-[10px] text-gray-400">Min: {min}</span>}
                                          <span className={`text-xs font-bold ${isLocLow ? 'text-red-600' : 'text-gray-900'}`}>
                                            {qty} {item.unit}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. WAREHOUSES TAB */}
      {/* ======================================================== */}
      {activeTab === 'warehouses' && (
        <div className="space-y-8">
          {/* Comparison / Summary Table */}
          {!isLoading && locations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5">
              <h2 className="text-base font-bold text-gray-950 mb-3 flex items-center gap-2">
                <ClipboardList size={18} className="text-purple-600 animate-pulse" /> Resumen de Inventario por Almacén
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Almacén / Bodega</th>
                      <th className="px-4 py-3 text-center">Productos Distintos</th>
                      <th className="px-4 py-3 text-center">Stock Total Almacenado</th>
                      <th className="px-4 py-3 text-center">Productos Disponibles</th>
                      <th className="px-4 py-3 text-center">Productos Stock Bajo</th>
                      <th className="px-4 py-3 text-right">Valor Total de Inventario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {locations.map((loc: any) => {
                      const locStocks = stocks.filter(s => s.location_id === loc.id);
                      const diffProducts = locStocks.length;
                      const totalStock = locStocks.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0);
                      const availableCount = locStocks.filter(s => (parseFloat(s.quantity) || 0) > 0).length;
                      const lowStockCount = locStocks.filter(s => {
                        const qty = parseFloat(s.quantity) || 0;
                        const min = parseFloat(s.min_stock) || 0;
                        return qty <= min && min > 0;
                      }).length;
                      const totalVal = locStocks.reduce((sum, s) => {
                        const prod = items.find(i => i.id === s.inventory_id);
                        const cost = prod ? parseFloat(prod.unit_cost) || 0 : 0;
                        return sum + ((parseFloat(s.quantity) || 0) * cost);
                      }, 0);

                      return (
                        <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors font-medium">
                          <td className="px-4 py-3 text-gray-950 font-bold flex items-center gap-1.5">
                            <MapPin size={12} className="text-purple-500 shrink-0" /> {loc.name}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-900 font-bold">{diffProducts} ítems</td>
                          <td className="px-4 py-3 text-center text-gray-900 font-bold">{totalStock}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">{availableCount}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-bold ${lowStockCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-500'}`}>
                              {lowStockCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-950 font-bold">
                            ${totalVal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}

                    {/* GRAND TOTAL ROW */}
                    {(() => {
                      const totalDiffProducts = items.length;
                      
                      // Calculate total stock aggregated
                      const totalStockAll = stocks.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0);
                      
                      // For available products, count products where the sum of stocks in all locations is > 0
                      const totalAvailableAll = items.filter(item => {
                        const prodStocks = stocks.filter(s => s.inventory_id === item.id);
                        const qty = prodStocks.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0);
                        return qty > 0;
                      }).length;

                      // For low stock, count products where the sum of stocks in all locations is <= min_stock
                      const totalLowAll = items.filter(item => {
                        const prodStocks = stocks.filter(s => s.inventory_id === item.id);
                        const qty = prodStocks.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0);
                        const min = parseFloat(item.min_stock) || 0;
                        return qty <= min && min > 0;
                      }).length;

                      const totalValueAll = stocks.reduce((sum, s) => {
                        const prod = items.find(i => i.id === s.inventory_id);
                        const cost = prod ? parseFloat(prod.unit_cost) || 0 : 0;
                        return sum + ((parseFloat(s.quantity) || 0) * cost);
                      }, 0);

                      return (
                        <tr className="bg-purple-50/70 hover:bg-purple-50 transition-colors font-bold border-t-2 border-purple-200">
                          <td className="px-4 py-3 text-purple-950 uppercase tracking-wide flex items-center gap-1.5 font-black">
                            <Package size={13} className="text-purple-700 shrink-0 animate-bounce" /> Total General (Sistema)
                          </td>
                          <td className="px-4 py-3 text-center text-purple-900 font-extrabold">{totalDiffProducts} ítems</td>
                          <td className="px-4 py-3 text-center text-purple-900 font-extrabold">{totalStockAll}</td>
                          <td className="px-4 py-3 text-center text-emerald-800 font-extrabold">{totalAvailableAll}</td>
                          <td className="px-4 py-3 text-center text-amber-800 font-extrabold">{totalLowAll}</td>
                          <td className="px-4 py-3 text-right text-purple-950 font-black">
                            ${totalValueAll.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-12 text-center text-gray-400">Cargando almacenes...</div>
            ) : locations.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <MapPin className="mx-auto mb-3 text-gray-200" size={40} />
                <p className="font-semibold text-gray-900">No hay almacenes configurados</p>
                <p className="text-xs text-gray-500 mt-1">Crea un almacén o bodega para comenzar a gestionar stock por locación.</p>
              </div>
            ) : locations.map((loc: any) => {
              const stockInLoc = stocks.filter(s => s.location_id === loc.id && parseFloat(s.quantity) > 0);
              return (
                <div key={loc.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <MapPin size={18} className="text-purple-600" /> {loc.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingLocation(loc); setShowLocationForm(true); }}
                          className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit3 size={15} /></button>
                        <button onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{loc.description || 'Sin descripción detallada'}</p>
                    {loc.address && (
                      <p className="text-xs text-gray-400 flex items-start gap-1 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" /> 
                        <span className="line-clamp-2">{loc.address}</span>
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Productos activos en stock:</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">{stockInLoc.length} ítems</span>
                  </div>
                  <button onClick={() => setSelectedWarehouse(loc)}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors">
                    <ClipboardList size={14} /> Ver Detalle y Kardex
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. HISTORICAL MOVEMENTS TAB */}
      {/* ======================================================== */}
      {activeTab === 'movements' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar por producto o notas..." value={movementSearch}
                onChange={e => setMovementSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm transition-all" />
            </div>
            
            <select value={filterMovementType} onChange={e => setFilterMovementType(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-purple-500 cursor-pointer">
              <option value="all">Todos los movimientos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste de Stock</option>
              <option value="transferencia">Transferencia</option>
              <option value="proyecto">Asignado a Proyecto</option>
            </select>

            <select value={filterMovementLoc} onChange={e => setFilterMovementLoc(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-purple-500 cursor-pointer">
              <option value="all">Todas las locaciones</option>
              {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4 text-center">Tipo</th>
                    <th className="px-6 py-4">Origen / Destino</th>
                    <th className="px-6 py-4 text-center">Cantidad</th>
                    <th className="px-6 py-4">Operador</th>
                    <th className="px-6 py-4">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Cargando movimientos...</td></tr>
                  ) : filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <ClipboardList className="mx-auto mb-3 text-gray-200" size={40} />
                        <p className="font-semibold text-gray-900">No hay movimientos registrados</p>
                        <p className="text-xs text-gray-500 mt-1">Los movimientos de stock aparecerán aquí en orden cronológico.</p>
                      </td>
                    </tr>
                  ) : filteredMovements.map(m => {
                    const prod = items.find(i => i.id === m.inventory_id);
                    const fromLoc = locations.find(l => l.id === m.from_location_id);
                    const toLoc = locations.find(l => l.id === m.to_location_id);
                    
                    const badgeStyles: Record<string, string> = {
                      entrada: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      salida: 'bg-red-50 text-red-700 border-red-100',
                      ajuste: 'bg-blue-50 text-blue-700 border-blue-100',
                      transferencia: 'bg-amber-50 text-amber-700 border-amber-100',
                      proyecto: 'bg-purple-50 text-purple-700 border-purple-100',
                    };

                    const typeLabels: Record<string, string> = {
                      entrada: 'Entrada',
                      salida: 'Salida',
                      ajuste: 'Ajuste',
                      transferencia: 'Transf.',
                      proyecto: 'Proyecto',
                    };

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">
                          {new Date(m.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{prod ? prod.name : 'Producto Eliminado'}</p>
                          {prod?.sku && <p className="text-[10px] text-gray-400">SKU: {prod.sku}</p>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${badgeStyles[m.type] || 'bg-gray-50 text-gray-600 border-gray-150'}`}>
                            {typeLabels[m.type] || m.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                          {m.type === 'entrada' && (
                            <span className="flex items-center gap-1 text-emerald-700">
                              Entra a: <span className="font-bold">{toLoc?.name || '---'}</span>
                            </span>
                          )}
                          {m.type === 'salida' && (
                            <span className="flex items-center gap-1 text-red-700">
                              Sale de: <span className="font-bold">{fromLoc?.name || '---'}</span>
                            </span>
                          )}
                          {m.type === 'ajuste' && (
                            <span className="flex items-center gap-1 text-blue-700">
                              Ajuste en: <span className="font-bold">{toLoc?.name || '---'}</span>
                            </span>
                          )}
                          {m.type === 'transferencia' && (
                            <span className="flex items-center gap-1 text-amber-700">
                              <span>{fromLoc?.name || '---'}</span> 
                              <ArrowRightLeft size={10} className="mx-0.5 text-amber-400" />
                              <span>{toLoc?.name || '---'}</span>
                            </span>
                          )}
                          {m.type === 'proyecto' && (
                            <span className="flex flex-col gap-0.5">
                              <span className="text-purple-700">Sale de: <span className="font-bold">{fromLoc?.name || '---'}</span></span>
                              <span className="text-[10px] text-purple-400 flex items-center gap-0.5 mt-0.5 bg-purple-50 w-fit px-1.5 py-0.5 rounded-md">
                                <FolderOpen size={10} /> {m.project ? m.project.name : 'Proyecto'}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">
                          {m.type === 'salida' || m.type === 'proyecto' ? '-' : '+'}{m.quantity} {prod?.unit || 'pza'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-700 font-medium">
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-gray-400" /> {getUserName(m.created_by)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate" title={m.notes}>
                          {m.notes || '---'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 4. MODALS */}
      {/* ======================================================== */}
      
      {/* Product Form Modal */}
      {showForm && (
        <InventoryFormModal 
          item={editingItem} 
          locations={locations}
          stocks={stocks}
          workspaceId={workspaceId!} 
          onClose={() => setShowForm(false)} 
          onSaved={() => { setShowForm(false); fetchData(); }} 
        />
      )}
      
      {/* Movement Modal */}
      {showMovement && (
        <MovementModal 
          item={showMovement} 
          locations={locations}
          stocks={stocks}
          projects={projects}
          workspaceId={workspaceId!} 
          onClose={() => setShowMovement(null)} 
          onSaved={() => { setShowMovement(null); fetchData(); }} 
        />
      )}

      {/* Warehouse Location Form Modal */}
      {showLocationForm && (
        <LocationFormModal
          location={editingLocation}
          workspaceId={workspaceId!}
          onClose={() => setShowLocationForm(false)}
          onSaved={() => { setShowLocationForm(false); fetchData(); }}
        />
      )}

      {/* Warehouse Detail and local Kardex Modal */}
      {selectedWarehouse && (
        <WarehouseDetailModal
          warehouse={selectedWarehouse}
          locations={locations}
          stocks={stocks}
          items={items}
          movements={movements}
          users={users}
          onClose={() => setSelectedWarehouse(null)}
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* PRODUCT FORM MODAL SUBCOMPONENT */
/* ========================================================================== */
function InventoryFormModal({ item, locations, stocks, workspaceId, onClose, onSaved }: any) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || '', 
    description: item?.description || '', 
    sku: item?.sku || '',
    category: item?.category || 'General', 
    unit: item?.unit || 'pza',
    unit_cost: item?.unit_cost ?? 0, 
    unit_price: item?.unit_price ?? 0, 
    min_stock: item?.min_stock ?? 0,
  });

  // State to hold quantities and min_stock per location
  const [initialStocks, setInitialStocks] = useState<Record<string, { quantity: number; min_stock: number }>>({});

  useEffect(() => {
    // Populate stock inputs
    const locMap: Record<string, { quantity: number; min_stock: number }> = {};
    
    locations.forEach((loc: any) => {
      if (isEdit) {
        const match = stocks.find((s: any) => s.inventory_id === item.id && s.location_id === loc.id);
        locMap[loc.id] = {
          quantity: match ? parseFloat(match.quantity) || 0 : 0,
          min_stock: match ? parseFloat(match.min_stock) || 0 : 0
        };
      } else {
        locMap[loc.id] = { quantity: 0, min_stock: 0 };
      }
    });

    setInitialStocks(locMap);
  }, [locations, item, isEdit, stocks]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let productId = item?.id;
      // Calculate total stock aggregated
      const totalQty = Object.values(initialStocks).reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
      const aggregateMin = Object.values(initialStocks).reduce((sum: number, s: any) => sum + (s.min_stock || 0), 0);

      if (isEdit) {
        // Update product table
        await supabase.from('trak_inventory').update({
          name: form.name,
          description: form.description,
          sku: form.sku,
          category: form.category,
          unit: form.unit,
          unit_cost: form.unit_cost,
          unit_price: form.unit_price,
          quantity: totalQty,
          min_stock: aggregateMin > 0 ? aggregateMin : form.min_stock
        }).eq('id', item.id);
      } else {
        // Insert new product
        const { data, error } = await supabase.from('trak_inventory').insert({
          workspace_id: workspaceId,
          name: form.name,
          description: form.description,
          sku: form.sku,
          category: form.category,
          unit: form.unit,
          unit_cost: form.unit_cost,
          unit_price: form.unit_price,
          quantity: totalQty,
          min_stock: aggregateMin > 0 ? aggregateMin : form.min_stock
        }).select('id').single();
        
        if (error) throw error;
        productId = data.id;
      }

      // Upsert into trak_inventory_stocks
      const stockUpserts = locations.map((loc: any) => ({
        inventory_id: productId,
        location_id: loc.id,
        quantity: initialStocks[loc.id]?.quantity || 0,
        min_stock: initialStocks[loc.id]?.min_stock || 0
      }));

      if (stockUpserts.length > 0) {
        const { error: upsertError } = await supabase
          .from('trak_inventory_stocks')
          .upsert(stockUpserts, { onConflict: 'inventory_id,location_id' });
        if (upsertError) throw upsertError;
      }

      onSaved();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("No se pudo guardar el producto. Verifica los datos o permisos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-extrabold text-lg text-gray-950 flex items-center gap-2">
            {isEdit ? '✏️ Editar Producto' : '✨ Nuevo Producto Catalogado'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* General Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-semibold" placeholder="Ej. Cable Eléctrico Cobre Calibre 10" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">SKU / Código</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" placeholder="Ej. ELEC-CAB-10" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white">
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unidad de Medida</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white">
                {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Costo Unitario Promedio ($)</label>
              <input type="number" step="0.01" min="0" value={form.unit_cost} onChange={e => setForm({...form, unit_cost: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Precio Venta Referencial ($)</label>
              <input type="number" step="0.01" min="0" value={form.unit_price} onChange={e => setForm({...form, unit_price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Mínimo Global (Alerta)</label>
              <input type="number" step="0.01" min="0" value={form.min_stock} onChange={e => setForm({...form, min_stock: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción corta</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none" rows={2} placeholder="Detalles de especificación técnica..." />
          </div>

          {/* Location-Specific Stocks Section */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Existencias e inventario mínimo por almacén</h4>
            
            {locations.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-2">
                <AlertTriangle className="text-amber-600 shrink-0" size={16} />
                <p className="text-xs text-amber-800 font-medium">No se han registrado almacenes sucursales. Crea uno en la pestaña 'Almacenes' para parametrizar stock por locación.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {locations.map((loc: any) => (
                  <div key={loc.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex flex-col justify-between">
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2.5 truncate">
                      <MapPin size={12} className="text-purple-600 shrink-0" /> {loc.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Existencia</label>
                        <input type="number" step="0.01" min="0" 
                          value={initialStocks[loc.id]?.quantity ?? 0}
                          onChange={e => setInitialStocks({
                            ...initialStocks,
                            [loc.id]: {
                              ...initialStocks[loc.id],
                              quantity: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500 font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-0.5">S. Mínimo</label>
                        <input type="number" step="0.01" min="0" 
                          value={initialStocks[loc.id]?.min_stock ?? 0}
                          onChange={e => setInitialStocks({
                            ...initialStocks,
                            [loc.id]: {
                              ...initialStocks[loc.id],
                              min_stock: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500 font-bold text-red-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/10">
            {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Registrar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* MOVEMENT FORM MODAL SUBCOMPONENT */
/* ========================================================================== */
function MovementModal({ item, locations, stocks, projects, workspaceId, onClose, onSaved }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    type: 'entrada', // entrada, salida, ajuste, transferencia, proyecto
    quantity: 0, 
    notes: '',
    from_location_id: '',
    to_location_id: '',
    project_id: ''
  });

  const [currentStocks, setCurrentStocks] = useState<any[]>([]);

  useEffect(() => {
    // Filter stocks for this product
    const match = stocks.filter((s: any) => s.inventory_id === item.id);
    setCurrentStocks(match);

    // Set default locations if available
    if (locations.length > 0) {
      setForm(prev => ({
        ...prev,
        from_location_id: locations[0].id,
        to_location_id: locations[0].id
      }));
    }
  }, [item, stocks, locations]);

  const handleSave = async () => {
    if (form.quantity <= 0) return;
    setSaving(true);
    
    try {
      const auth = await supabase.auth.getUser();
      const userId = auth.data.user?.id;

      // Define variables according to movement type
      let fromLoc: string | null = null;
      let toLoc: string | null = null;
      let projId: string | null = null;

      if (form.type === 'entrada') {
        toLoc = form.to_location_id;
      } else if (form.type === 'salida') {
        fromLoc = form.from_location_id;
      } else if (form.type === 'ajuste') {
        toLoc = form.to_location_id; // target location being adjusted
      } else if (form.type === 'transferencia') {
        fromLoc = form.from_location_id;
        toLoc = form.to_location_id;
        if (fromLoc === toLoc) {
          alert('El almacén de origen y destino deben ser diferentes.');
          setSaving(false);
          return;
        }
      } else if (form.type === 'proyecto') {
        fromLoc = form.from_location_id;
        projId = form.project_id || null;
        if (!projId) {
          alert('Por favor selecciona un proyecto.');
          setSaving(false);
          return;
        }
      }

      // 1. Insert Movement record
      const { error: moveError } = await supabase.from('trak_inventory_movements').insert({
        workspace_id: workspaceId,
        inventory_id: item.id,
        type: form.type,
        quantity: form.quantity,
        unit_cost: item.unit_cost,
        notes: form.notes,
        created_by: userId,
        from_location_id: fromLoc,
        to_location_id: toLoc,
        project_id: projId
      });
      if (moveError) throw moveError;

      // 2. Update specific location stocks
      if (fromLoc) {
        const matchStock = currentStocks.find(s => s.location_id === fromLoc);
        const prevQty = matchStock ? parseFloat(matchStock.quantity) || 0 : 0;
        const newQty = Math.max(0, prevQty - form.quantity);

        const { error: updErr } = await supabase.from('trak_inventory_stocks').upsert({
          inventory_id: item.id,
          location_id: fromLoc,
          quantity: newQty
        }, { onConflict: 'inventory_id,location_id' });
        if (updErr) throw updErr;
      }

      if (toLoc) {
        const matchStock = currentStocks.find(s => s.location_id === toLoc);
        const prevQty = matchStock ? parseFloat(matchStock.quantity) || 0 : 0;
        
        // If type is adjustment, set exact value. Else, sum the quantity
        const newQty = form.type === 'ajuste' ? form.quantity : prevQty + form.quantity;

        const { error: updErr } = await supabase.from('trak_inventory_stocks').upsert({
          inventory_id: item.id,
          location_id: toLoc,
          quantity: newQty
        }, { onConflict: 'inventory_id,location_id' });
        if (updErr) throw updErr;
      }

      // 3. If type is project, also create the assignment in trak_project_materials
      if (form.type === 'proyecto' && projId) {
        const { error: matError } = await supabase.from('trak_project_materials').insert({
          project_id: projId,
          inventory_id: item.id,
          name: item.name,
          quantity: form.quantity,
          unit_cost: item.unit_cost || 0,
          total_cost: form.quantity * (item.unit_cost || 0),
          notes: form.notes || 'Asignado desde inventario por locación'
        });
        if (matError) throw matError;
      }

      // 4. Calculate total sum across all locations and sync main quantity in trak_inventory
      const { data: updatedStocks, error: selectErr } = await supabase
        .from('trak_inventory_stocks')
        .select('quantity')
        .eq('inventory_id', item.id);
      
      if (!selectErr && updatedStocks) {
        const aggregatedSum = updatedStocks.reduce((sum, s) => sum + parseFloat(s.quantity), 0);
        await supabase
          .from('trak_inventory').update({ quantity: aggregatedSum })
          .eq('id', item.id);
      }

      onSaved();
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      alert("Hubo un error al guardar el movimiento en la base de datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-extrabold text-lg text-gray-950">Movimiento de Kardex</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Producto seleccionado</span>
            <p className="font-bold text-gray-900 text-base">{item.name}</p>
          </div>

          {/* Current Stocks Display */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block mb-1">Existencia por locación:</span>
            {locations.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No hay almacenes configurados.</p>
            ) : (
              locations.map((loc: any) => {
                const matchStock = currentStocks.find(s => s.location_id === loc.id);
                const qty = matchStock ? parseFloat(matchStock.quantity) : 0;
                return (
                  <div key={loc.id} className="text-xs flex justify-between font-semibold">
                    <span className="text-gray-500">{loc.name}:</span>
                    <span className="text-gray-800">{qty} {item.unit}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Movement Type selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Tipo de Movimiento</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { v: 'entrada', l: 'Entr.', icon: ArrowDown, c: 'emerald' },
                { v: 'salida', l: 'Sal.', icon: ArrowUp, c: 'red' },
                { v: 'ajuste', l: 'Ajuste', icon: RotateCw, c: 'blue' },
                { v: 'transferencia', l: 'Transf.', icon: ArrowRightLeft, c: 'amber' },
                { v: 'proyecto', l: 'Proy.', icon: FolderOpen, c: 'purple' },
              ].map(t => {
                const isSelected = form.type === t.v;
                const activeColorClass = {
                  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                  red: 'bg-red-50 text-red-700 border-red-300',
                  blue: 'bg-blue-50 text-blue-700 border-blue-300',
                  amber: 'bg-amber-50 text-amber-700 border-amber-300',
                  purple: 'bg-purple-50 text-purple-700 border-purple-300',
                }[t.c];

                return (
                  <button key={t.v} onClick={() => setForm({ ...form, type: t.v })}
                    className={`py-2 rounded-xl text-[10px] font-extrabold flex flex-col items-center justify-center gap-1 border transition-all ${
                      isSelected 
                        ? `${activeColorClass} shadow-xs font-black` 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}>
                    <t.icon size={13} className="mb-0.5" /> {t.l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dinamic Fields based on Type */}
          
          {/* FROM LOCATION: Show for Salida, Transferencia, Proyecto */}
          {(form.type === 'salida' || form.type === 'transferencia' || form.type === 'proyecto') && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Almacén Origen</label>
              <select value={form.from_location_id} onChange={e => setForm({ ...form, from_location_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-semibold">
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* TO LOCATION: Show for Entrada, Transferencia, Ajuste */}
          {(form.type === 'entrada' || form.type === 'transferencia' || form.type === 'ajuste') && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {form.type === 'ajuste' ? 'Almacén a Ajustar' : 'Almacén Destino'}
              </label>
              <select value={form.to_location_id} onChange={e => setForm({ ...form, to_location_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-semibold">
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* PROJECT SELECTOR: Show only for Proyecto */}
          {form.type === 'proyecto' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Asociar a Proyecto Trak</label>
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-semibold">
                <option value="">-- Selecciona Proyecto --</option>
                {projects.map((proj: any) => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {form.type === 'ajuste' ? 'Nueva Existencia Total' : 'Cantidad a Registrar'}
            </label>
            <input type="number" step="0.01" min="0" value={form.quantity} 
              onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-gray-900" />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notas / Bitácora</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" placeholder="Ej. Compra Factura F-1234, Traspaso a Sucursal..." />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || form.quantity <= 0}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/10">
            {saving ? 'Procesando...' : 'Aplicar Movimiento'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* WAREHOUSE LOCATION FORM MODAL SUBCOMPONENT */
/* ========================================================================== */
function LocationFormModal({ location, workspaceId, onClose, onSaved }: any) {
  const isEdit = !!location;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: location?.name || '',
    description: location?.description || '',
    address: location?.address || '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await supabase
          .from('trak_warehouse_locations')
          .update({ ...form, updated_at: new Date() })
          .eq('id', location.id);
      } else {
        await supabase
          .from('trak_warehouse_locations')
          .insert({ workspace_id: workspaceId, ...form });
      }
      onSaved();
    } catch (error) {
      console.error("Error saving warehouse location:", error);
      alert("Hubo un error al guardar los datos del almacén.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-extrabold text-lg text-gray-950 flex items-center gap-2">
            <MapPin size={18} className="text-purple-600" />
            {isEdit ? 'Editar Almacén' : '✨ Nuevo Almacén/Ubicación'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Almacén *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" placeholder="Ej. Bodega General, Sucursal Norte..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección Física</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white" placeholder="Ej. Av. Central #456, Col. Parque Industrial" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción / Notas</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none" rows={3} placeholder="Notas sobre el tipo de resguardo, encargado o área de cobertura..." />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/10">
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Almacén'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* WAREHOUSE DETAILED STOCK & LOCAL KARDEX VIEW MODAL SUBCOMPONENT */
/* ========================================================================== */
function WarehouseDetailModal({ warehouse, locations, stocks, items, movements, users, onClose }: any) {
  const [modalTab, setModalTab] = useState<'stocks' | 'movements'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Get stocks for this warehouse
  const warehouseStocks = stocks.filter((s: any) => s.location_id === warehouse.id);

  // Map stocks to include product details
  const storedProducts = warehouseStocks.map((s: any) => {
    const prod = items.find((i: any) => i.id === s.inventory_id);
    return {
      stockId: s.id,
      productId: s.inventory_id,
      name: prod ? prod.name : 'Producto Eliminado',
      sku: prod ? prod.sku : '',
      category: prod ? prod.category : 'General',
      unit: prod ? prod.unit : 'pza',
      unit_cost: prod ? parseFloat(prod.unit_cost) || 0 : 0,
      quantity: parseFloat(s.quantity) || 0,
      min_stock: parseFloat(s.min_stock) || 0,
    };
  }).filter((p: any) => {
    return !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate metrics
  const totalItemsCount = warehouseStocks.reduce((sum: number, s: any) => sum + (parseFloat(s.quantity) || 0), 0);
  const totalWarehouseValue = warehouseStocks.reduce((sum: number, s: any) => {
    const prod = items.find((i: any) => i.id === s.inventory_id);
    const cost = prod ? parseFloat(prod.unit_cost) || 0 : 0;
    return sum + ((parseFloat(s.quantity) || 0) * cost);
  }, 0);

  // 2. Get movements related to this warehouse
  const localMovements = movements.filter((m: any) => 
    m.from_location_id === warehouse.id || m.to_location_id === warehouse.id
  ).filter((m: any) => {
    const prod = items.find((i: any) => i.id === m.inventory_id);
    const prodName = prod ? prod.name : '';
    return !searchQuery || 
      prodName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getUserName = (userId: string) => {
    const u = users.find((x: any) => x.id === userId);
    return u ? u.name : 'Usuario Trak';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 shadow-2xl" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start shrink-0">
          <div>
            <h2 className="font-extrabold text-xl text-gray-950 flex items-center gap-2">
              <MapPin size={22} className="text-purple-600 animate-bounce" /> Detalle de Almacén: {warehouse.name}
            </h2>
            {warehouse.address && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" /> {warehouse.address}
              </p>
            )}
            {warehouse.description && (
              <p className="text-xs text-gray-500 mt-1.5 italic font-medium">{warehouse.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"><X size={22} /></button>
        </div>

        {/* Metrics Cards */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-4 shrink-0">
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Productos Registrados</span>
            <span className="font-black text-lg text-purple-700 mt-0.5 block">{warehouseStocks.length} ítems</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Existencias Totales</span>
            <span className="font-black text-lg text-gray-900 mt-0.5 block">{totalItemsCount.toLocaleString()} unidades</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Valorización de Bodega</span>
            <span className="font-black text-lg text-emerald-700 mt-0.5 block">
              ${totalWarehouseValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Sub-Tabs and Search */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex gap-4">
            <button onClick={() => setModalTab('stocks')}
              className={`pb-2 font-bold text-sm transition-all relative ${modalTab === 'stocks' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
              Existencias ({storedProducts.length})
            </button>
            <button onClick={() => setModalTab('movements')}
              className={`pb-2 font-bold text-sm transition-all relative ${modalTab === 'movements' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
              Kardex Local ({localMovements.length})
            </button>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Buscar por producto..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white transition-all font-semibold" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[280px]">
          {modalTab === 'stocks' ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wide border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-center">Disponible</th>
                    <th className="px-4 py-3 text-center">Stock Mínimo</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Valor Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {storedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-semibold italic">
                        No hay existencias registradas en esta bodega.
                      </td>
                    </tr>
                  ) : (
                    storedProducts.map((p: any) => {
                      const isLow = p.quantity <= p.min_stock && p.min_stock > 0;
                      const isOutOfStock = p.quantity === 0;

                      return (
                        <tr key={p.stockId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-950">{p.name}</p>
                            {p.sku && <p className="text-[10px] text-gray-400">SKU: {p.sku}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">{p.category}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-sm text-gray-900">
                            {p.quantity} {p.unit}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-500">
                            {p.min_stock > 0 ? `${p.min_stock} ${p.unit}` : '---'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {isOutOfStock ? (
                              <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-extrabold">Sin Stock</span>
                            ) : isLow ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-extrabold">Bajo Stock</span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-extrabold">Suficiente</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-950">
                            ${(p.quantity * p.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wide border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-center">Tipo</th>
                    <th className="px-4 py-3">Flujo del Movimiento</th>
                    <th className="px-4 py-3 text-center">Cantidad</th>
                    <th className="px-4 py-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {localMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-semibold italic">
                        No hay movimientos registrados para este almacén.
                      </td>
                    </tr>
                  ) : (
                    localMovements.map((m: any) => {
                      const prod = items.find((i: any) => i.id === m.inventory_id);
                      
                      // Calculate the stock impact locally in this warehouse
                      let isIncrement = false;
                      let isDecrement = false;
                      let flowDescription = '';

                      if (m.type === 'entrada') {
                        isIncrement = true;
                        flowDescription = 'Entrada directa a este almacén';
                      } else if (m.type === 'salida') {
                        isDecrement = true;
                        flowDescription = 'Salida directa de este almacén';
                      } else if (m.type === 'ajuste') {
                        flowDescription = 'Ajuste físico de existencias';
                      } else if (m.type === 'transferencia') {
                        if (m.from_location_id === warehouse.id) {
                          isDecrement = true;
                          const dest = locations.find((l: any) => l.id === m.to_location_id);
                          flowDescription = `Traspasado hacia: ${dest ? dest.name : 'Almacén Destino'}`;
                        } else {
                          isIncrement = true;
                          const orig = locations.find((l: any) => l.id === m.from_location_id);
                          flowDescription = `Recibido desde: ${orig ? orig.name : 'Almacén Origen'}`;
                        }
                      } else if (m.type === 'proyecto') {
                        isDecrement = true;
                        flowDescription = `Asignado al proyecto: ${m.project ? m.project.name : 'Proyecto'}`;
                      }

                      const badgeStyles: Record<string, string> = {
                        entrada: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        salida: 'bg-red-50 text-red-700 border-red-100',
                        ajuste: 'bg-blue-50 text-blue-700 border-blue-100',
                        transferencia: 'bg-amber-50 text-amber-700 border-amber-100',
                        proyecto: 'bg-purple-50 text-purple-700 border-purple-100',
                      };

                      return (
                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-[10px] text-gray-400 font-semibold">
                            {new Date(m.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-950">{prod ? prod.name : 'Producto Eliminado'}</p>
                            {prod?.sku && <p className="text-[10px] text-gray-400">SKU: {prod.sku}</p>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${badgeStyles[m.type]}`}>
                              {m.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-600">
                            {flowDescription}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold text-sm ${
                            isIncrement ? 'text-emerald-700' : isDecrement ? 'text-red-600' : 'text-blue-700'
                          }`}>
                            {isIncrement ? '+' : isDecrement ? '-' : ''}{m.quantity} {prod?.unit || 'pza'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-semibold">
                            {getUserName(m.created_by)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-gray-950 hover:bg-gray-900 text-white font-bold text-xs rounded-xl transition-all shadow-md">
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}

