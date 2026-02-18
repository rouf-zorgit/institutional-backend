import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
    token?: string;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { requiresAuth = true, token, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers);

    // Set default headers
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (requiresAuth) {
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        } else if (typeof window !== "undefined") {
            // Client-side: Try to get token from cookie
            const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
            if (match) {
                headers.set("Authorization", `Bearer ${match[2]}`);
            }
        }
    }

    // Auth is handled by middleware setting the cookie, but for client-side fetches
    // we might need to rely on the browser sending the cookie automatically.
    // We should ensure credentials are included.
    fetchOptions.credentials = "include";

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
}
