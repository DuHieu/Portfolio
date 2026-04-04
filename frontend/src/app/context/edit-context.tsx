import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface EditContextType {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  pendingChanges: Record<string, any>;
  updateDraft: (id: string, data: any) => void;
  publishChanges: () => Promise<void>;
  discardChanges: () => void;
  hasChanges: boolean;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function EditProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [isEditMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const updateDraft = (id: string, data: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...data }
    }));
  };

  const discardChanges = () => {
    setPendingChanges({});
    setEditMode(false);
  };

  const publishChanges = async () => {
    if (!session?.access_token) {
      alert("Bạn cần đăng nhập để thực hiện tác vụ này.");
      return;
    }

    const changeKeys = Object.keys(pendingChanges);
    if (changeKeys.length === 0) return;

    try {
      const promises = changeKeys.map(key => {
        const [type, id] = key.split(':');
        let url = '';
        let method = 'PATCH';

        if (type === 'profile') {
          url = `${API_BASE}/api/profile/update/`;
        } else if (type === 'project') {
          url = `${API_BASE}/api/projects/${id}/`;
        } else if (type === 'experience') {
          url = `${API_BASE}/api/experiences/${id}/`;
        }

        return fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(pendingChanges[key])
        });
      });

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`Đã có ${failed.length} lỗi xảy ra khi lưu.`);
      }

      alert("Tất cả thay đổi đã được xuất bản (Publish) thành công!");
      setPendingChanges({});
      setEditMode(false);
      
      // Reload to reflect changes globally
      window.location.reload();
      
    } catch (error) {
      console.error('Publish error:', error);
      alert("Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    }
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <EditContext.Provider value={{ 
      isEditMode, 
      setEditMode, 
      pendingChanges, 
      updateDraft, 
      publishChanges, 
      discardChanges,
      hasChanges
    }}>
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
}
