/**
 * src/api/adminMenu.ts
 *
 * Admin menu management API calls.
 * All endpoints require a content_admin or super_admin JWT.
 *
 * Backend endpoints:
 *   POST   /menu-items              — create
 *   PUT    /menu-items/{id}         — update
 *   PATCH  /menu-items/{id}/availability — toggle availability
 *   DELETE /menu-items/{id}         — soft delete
 *   POST   /menu-categories         — create category
 */
import api from './client';
import type { BackendMenuItem } from './menu';

export interface MenuItemCreatePayload {
  category_id: string;    // UUID
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  ar_enabled?: boolean;
  is_available?: boolean;
  model_3d_url?: string;
}

export interface MenuItemUpdatePayload {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  ar_enabled?: boolean;
  is_available?: boolean;
  model_3d_url?: string;
}

export async function createMenuItem(
  payload: MenuItemCreatePayload
): Promise<{ data: BackendMenuItem }> {
  const res = await api.post<{ success: boolean; message: string; data: BackendMenuItem }>(
    '/menu-items',
    payload
  );
  return res.data;
}

export async function updateMenuItem(
  id: string,
  payload: MenuItemUpdatePayload
): Promise<{ data: BackendMenuItem }> {
  const res = await api.put<{ success: boolean; message: string; data: BackendMenuItem }>(
    `/menu-items/${id}`,
    payload
  );
  return res.data;
}

export async function patchAvailability(
  id: string,
  is_available: boolean
): Promise<{ data: BackendMenuItem }> {
  const res = await api.patch<{ success: boolean; message: string; data: BackendMenuItem }>(
    `/menu-items/${id}/availability`,
    { is_available }
  );
  return res.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu-items/${id}`);
}

export async function createCategory(
  name: string,
  description?: string
): Promise<{ data: { id: string; name: string } }> {
  const res = await api.post<{ success: boolean; message: string; data: { id: string; name: string } }>(
    '/categories',
    { name, description }
  );
  return res.data;
}

export async function getAvailableModels(): Promise<{ data: string[] }> {
  const res = await api.get<{ success: boolean; message: string; data: string[] }>('/admin/models');
  return res.data;
}

export async function uploadModel(fileUri: string, fileName: string, mimeType: string): Promise<{ data: { filename: string } }> {
  const formData = new FormData();
  // @ts-ignore - React Native FormData expects this shape
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  });

  const res = await api.post<{ success: boolean; message: string; data: { filename: string } }>(
    '/admin/models/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
}
