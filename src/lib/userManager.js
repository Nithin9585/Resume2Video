import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
export class UserManager {
    constructor() {
        this.collection = 'users';
    }
    async createUserProfile(uid, userData) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            const userProfile = {
                uid,
                firstName: userData.firstName?.trim() || '',
                lastName: userData.lastName?.trim() || '',
                displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
                email: userData.email?.toLowerCase() || '',
                gender: userData.gender || '',
                profilePictureUrl: userData.profilePictureUrl || '',
                emailVerified: userData.emailVerified || false,
                accountType: userData.accountType || 'free',
                accountStatus: 'active',
                profileCompleted: false,
                preferences: {
                    notifications: true,
                    newsletter: false,
                    theme: 'dark',
                    language: 'en',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    ...userData.preferences
                },
                stats: {
                    loginCount: 0,
                    videosCreated: 0,
                    scriptsGenerated: 0,
                    lastActiveAt: serverTimestamp(),
                    totalUsageTime: 0
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                resumeData: {
                    hasResume: false,
                    resumeUrl: '',
                    extractedText: '',
                    lastUpdated: null
                },
                projects: {
                    total: 0,
                    completed: 0,
                    inProgress: 0
                }
            };
            await setDoc(userRef, userProfile);
            return userProfile;
        } catch (error) {
            throw error;
        }
    }
    /**
     * Get user profile by UID
     */
    async getUserProfile(uid) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                return { uid, ...userDoc.data() };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
    /**
     * Update user profile
     */
    async updateUserProfile(uid, updates) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };
            if (updates.preferences) {
                updateData.preferences = updates.preferences;
            }
            if (updates.stats) {
                updateData.stats = updates.stats;
            }
            await updateDoc(userRef, updateData);
            return true;
        } catch (error) {
            throw error;
        }
    }
    /**
     * Update user login information
     */
    async updateLoginInfo(uid) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            await updateDoc(userRef, {
                lastLoginAt: serverTimestamp(),
                'stats.loginCount': increment(1),
                'stats.lastActiveAt': serverTimestamp(),
                emailVerified: true,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw error;
        }
    }
    /**
     * Update resume data
     */
    async updateResumeData(uid, resumeData) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            await updateDoc(userRef, {
                'resumeData.hasResume': true,
                'resumeData.resumeUrl': resumeData.resumeUrl || '',
                'resumeData.extractedText': resumeData.extractedText || '',
                'resumeData.lastUpdated': serverTimestamp(),
                profileCompleted: true,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw error;
        }
    }
    /**
     * Track video creation
     */
    async trackVideoCreation(uid, videoData) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            await updateDoc(userRef, {
                'stats.videosCreated': increment(1),
                'projects.total': increment(1),
                'projects.inProgress': increment(1),
                'stats.lastActiveAt': serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            const videoRef = doc(collection(firestore, 'videos'), videoData.videoId);
            await setDoc(videoRef, {
                userId: uid,
                videoId: videoData.videoId,
                status: 'processing',
                avatarId: videoData.avatarId,
                voiceId: videoData.voiceId,
                script: videoData.script,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw error;
        }
    }
    /**
     * Update video status
     */
    async updateVideoStatus(videoId, status) {
        try {
            const videoRef = doc(firestore, 'videos', videoId);
            await updateDoc(videoRef, {
                status,
                updatedAt: serverTimestamp()
            });
            if (status === 'completed') {
                const videoDoc = await getDoc(videoRef);
                if (videoDoc.exists()) {
                    const videoData = videoDoc.data();
                    const userRef = doc(firestore, this.collection, videoData.userId);
                    await updateDoc(userRef, {
                        'projects.completed': increment(1),
                        'projects.inProgress': increment(-1),
                        'stats.lastActiveAt': serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
            }
        } catch (error) {
            throw error;
        }
    }
    /**
     * Track script generation
     */
    async trackScriptGeneration(uid) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            await updateDoc(userRef, {
                'stats.scriptsGenerated': increment(1),
                'stats.lastActiveAt': serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw error;
        }
    }
    /**
     * Get user videos
     */
    async getUserVideos(uid, limit = 10) {
        try {
            const videosQuery = query(
                collection(firestore, 'videos'),
                where('userId', '==', uid),
                orderBy('createdAt', 'desc')
            );
            const videosSnapshot = await getDocs(videosQuery);
            const videos = [];
            videosSnapshot.forEach(doc => {
                videos.push({ id: doc.id, ...doc.data() });
            });
            return videos;
        } catch (error) {
            throw error;
        }
    }
    /**
     * Delete user account (soft delete)
     */
    async deleteUserAccount(uid) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            await updateDoc(userRef, {
                accountStatus: 'deleted',
                deletedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw error;
        }
    }
    /**
     * Update user activity
     */
    async updateActivity(uid, activityType, metadata = {}) {
        try {
            const userRef = doc(firestore, this.collection, uid);
            await updateDoc(userRef, {
                'stats.lastActiveAt': serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            const activityRef = doc(collection(firestore, 'user_activities'));
            await setDoc(activityRef, {
                userId: uid,
                type: activityType,
                metadata,
                timestamp: serverTimestamp()
            });
        } catch (error) {
        }
    }
}
export const userManager = new UserManager();
export const createUser = (uid, userData) => userManager.createUserProfile(uid, userData);
export const getUser = (uid) => userManager.getUserProfile(uid);
export const updateUser = (uid, updates) => userManager.updateUserProfile(uid, updates);
export const trackLogin = (uid) => userManager.updateLoginInfo(uid);
export const trackVideo = (uid, videoData) => userManager.trackVideoCreation(uid, videoData);
export const trackScript = (uid) => userManager.trackScriptGeneration(uid);
