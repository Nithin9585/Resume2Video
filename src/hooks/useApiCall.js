import { useState, useCallback } from 'react';
/**
 * Custom hook for API calls with caching, retry logic, and loading states
 */
export const useApiCall = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const cache = new Map();
    const callApi = useCallback(async (url, options = {}) => {
        const {
            cacheKey = url,
            cacheTTL = 5 * 60 * 1000, // 5 minutes
            retries = 3,
            timeout = 10000,
            skipCache = false
        } = options;
        if (!skipCache && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            const now = Date.now();
            if ((now - cached.timestamp) < cacheTTL) {
                setData(cached.data);
                setError(null);
                return cached.data;
            }
        }
        setLoading(true);
        setError(null);
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'public, max-age=300',
                        ...options.headers
                    }
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();
                cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
                setData(result);
                setLoading(false);
                return result;
            } catch (err) {
                if (attempt === retries) {
                    setError(err.message);
                    setLoading(false);
                    if (cache.has(cacheKey)) {
                        const stale = cache.get(cacheKey);
                        setData(stale.data);
                        return stale.data;
                    }
                    throw err;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
            }
        }
    }, [cache]);
    const retry = useCallback(() => {
        setError(null);
        setLoading(false);
    }, []);
    return {
        loading,
        error,
        data,
        callApi,
        retry,
        clearCache: () => cache.clear()
    };
};
/**
 * Custom hook specifically for avatar and voice data
 */
export const useAvatarVoiceData = (avatarId, voiceId) => {
    const [avatarData, setAvatarData] = useState(null);
    const [voiceData, setVoiceData] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(true);
    const [voiceLoading, setVoiceLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(null);
    const [voiceError, setVoiceError] = useState(null);
    const avatarApi = useApiCall();
    const voiceApi = useApiCall();
    const fetchData = useCallback(async () => {
        if (!avatarId || !voiceId) return;
        avatarApi.callApi('/api/GetAvatars', { cacheKey: 'avatars' })
            .then(data => {
                const avatar = data.data?.avatars?.find(a => a.avatar_id === avatarId);
                if (avatar) {
                    setAvatarData(avatar);
                } else {
                    setAvatarError('Avatar not found');
                }
            })
            .catch(error => {
                setAvatarError(error.message);
            })
            .finally(() => {
                setAvatarLoading(false);
            });
        voiceApi.callApi('/api/GetVoices', { cacheKey: 'voices' })
            .then(data => {
                const voice = data.data?.voices?.find(v => v.voice_id === voiceId);
                if (voice) {
                    setVoiceData(voice);
                } else {
                    setVoiceError('Voice not found');
                }
            })
            .catch(error => {
                setVoiceError(error.message);
            })
            .finally(() => {
                setVoiceLoading(false);
            });
    }, [avatarId, voiceId, avatarApi, voiceApi]);
    const retryAvatar = useCallback(() => {
        setAvatarError(null);
        setAvatarLoading(true);
        fetchData();
    }, [fetchData]);
    const retryVoice = useCallback(() => {
        setVoiceError(null);
        setVoiceLoading(true);
        fetchData();
    }, [fetchData]);
    return {
        avatarData,
        voiceData,
        avatarLoading,
        voiceLoading,
        avatarError,
        voiceError,
        fetchData,
        retryAvatar,
        retryVoice
    };
};
