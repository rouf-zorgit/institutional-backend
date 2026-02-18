import { apiRequest } from '@/lib/api';

export const UploadService = {
    uploadFile: async (file: File, category: 'assignments' | 'study-materials') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        // apiRequest handles JSON by default, but for FormData we need to let browser set Content-Type
        // The apiRequest helper in lib/api.ts might enforce Content-Type: application/json.
        // I need to check api.ts again.

        // Checking api.ts content from previous view_file:
        // if (!headers.has("Content-Type")) { headers.set("Content-Type", "application/json"); }
        // This is problematic for FormData.

        // I'll bypass the helper for upload or update the helper.
        // For now, I'll just use fetch directly here to avoid modifying shared lib/api.ts if possible, 
        // to minimize regression risk. But I need auth token.

        // Actually, let's see api.ts:
        // const { requiresAuth = true, token, ...fetchOptions } = options;
        // const headers = new Headers(fetchOptions.headers);
        // if (!headers.has("Content-Type")) { headers.set("Content-Type", "application/json"); }

        // If I pass headers with Content-Type undefined, it might still set it?
        // No, headers.has checks existence.
        // If I pass 'Content-Type': 'multipart/form-data', the browser boundary won't be set correctly.
        // So I need to ensure Content-Type header is NOT set.

        // I'll use a hack: pass a custom header 'X-Skip-Content-Type': 'true' and modify api.ts? 
        // No, I'll just copy the logic or import the constants.

        // simpler: I'll just use the apiRequest but passing a specific content type implies I want that.
        // But for FormData, we want NO Content-Type header so browser sets it with boundary.

        // I will use fetch directly here for simplicity and safety.

        const token = typeof window !== 'undefined'
            ? document.cookie.match(new RegExp('(^| )access_token=([^;]+)'))?.[2]
            : undefined;

        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/upload`, {
            method: 'POST',
            body: formData,
            headers
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.data.url; // Assuming backend returns { success: true, data: { url: ... } }
    }
};
