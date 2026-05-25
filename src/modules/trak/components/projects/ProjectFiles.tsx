import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Upload, Trash2, Download, Image as ImageIcon, File, FileArchive, X } from 'lucide-react';

export default function ProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchFiles(); }, [projectId]);

  const fetchFiles = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('trak_project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (data) setFiles(data);
    setIsLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      try {
        // 1. Upload to Supabase Storage (bucket: trak_documents)
        // Note: Make sure the 'trak_documents' bucket exists and is public (or has RLS policies)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('trak_documents')
          .upload(fileName, file);
          
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          alert(`Error subiendo ${file.name}. Asegúrate de haber creado el bucket 'trak_documents' en Supabase Storage.`);
          continue;
        }

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage.from('trak_documents').getPublicUrl(fileName);

        // 3. Save metadata to database
        const userId = (await supabase.auth.getUser()).data.user?.id;
        await supabase.from('trak_project_files').insert({
          project_id: projectId,
          file_name: file.name,
          file_url: publicUrl,
          file_size_bytes: file.size,
          file_type: file.type || fileExt,
          uploaded_by: userId
        });
      } catch (err) {
        console.error(err);
      }
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
    fetchFiles();
  };

  const handleDelete = async (fileId: string, fileUrl: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
    
    // Extract path from URL to delete from storage
    // Assuming URL format: .../storage/v1/object/public/trak_documents/projectId/filename.ext
    try {
      const pathMatches = fileUrl.match(/trak_documents\/(.+)$/);
      if (pathMatches && pathMatches[1]) {
        await supabase.storage.from('trak_documents').remove([pathMatches[1]]);
      }
    } catch (e) {
      console.warn("Could not delete from storage, but will remove from DB", e);
    }

    await supabase.from('trak_project_files').delete().eq('id', fileId);
    fetchFiles();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={24} className="text-blue-500" />;
    if (type.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive size={24} className="text-amber-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando archivos...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Documentos del Proyecto</h2>
          <p className="text-sm text-gray-500">Planos, contratos, reportes y entregables.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-70"
          >
            {isUploading ? (
              <>Subiendo...</>
            ) : (
              <><Upload size={18} /> Subir Archivo</>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {files.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={32} />
            </div>
            <p className="font-bold text-gray-900">No hay archivos</p>
            <p className="text-sm text-gray-500 mt-1">Sube el primer documento del proyecto aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => (
              <div key={file.id} className="border border-gray-200 rounded-xl p-4 flex items-start gap-4 hover:border-purple-300 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  {getFileIcon(file.file_type || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate" title={file.file_name}>
                    {file.file_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatSize(file.file_size_bytes)} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg"
                    title="Descargar/Ver"
                  >
                    <Download size={16} />
                  </a>
                  <button 
                    onClick={() => handleDelete(file.id, file.file_url)}
                    className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
