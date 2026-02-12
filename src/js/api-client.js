/**
 * 타자 연습 프로그램 - API 클라이언트
 * Google Apps Script 웹 앱과 통신
 */

const ApiClient = {
    /**
     * API 요청 보내기
     */
    async request(action, params = {}) {
        if (!USE_API || !API_URL || API_URL.includes('YOUR_')) {
            console.warn('API not configured, using localStorage');
            return null;
        }

        const url = new URL(API_URL);
        url.searchParams.append('action', action);

        // 파라미터 추가
        Object.keys(params).forEach(key => {
            if (typeof params[key] === 'object') {
                url.searchParams.append(key, JSON.stringify(params[key]));
            } else {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url.toString());
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: error.toString() };
        }
    },

    // ========================================
    // 사용자 관리
    // ========================================

    /**
     * 모든 사용자 조회
     */
    async getUsers() {
        return await this.request('getUsers');
    },

    /**
     * 이메일로 사용자 조회
     */
    async getUserByEmail(email) {
        return await this.request('getUserByEmail', { email });
    },

    /**
     * 사용자 생성
     */
    async createUser(userData) {
        return await this.request('createUser', { data: userData });
    },

    /**
     * 사용자 정보 수정
     */
    async updateUser(userId, updates) {
        return await this.request('updateUser', { id: userId, data: updates });
    },

    /**
     * 사용자 삭제
     */
    async deleteUser(userId) {
        return await this.request('deleteUser', { id: userId });
    },

    /**
     * 로그인
     */
    async login(email, password) {
        return await this.request('login', { email, password });
    },

    // ========================================
    // 연습 기록 관리
    // ========================================

    /**
     * 모든 연습 기록 조회
     */
    async getRecords() {
        return await this.request('getRecords');
    },

    /**
     * 사용자별 연습 기록 조회
     */
    async getRecordsByUser(userId) {
        return await this.request('getRecordsByUser', { userId });
    },

    /**
     * 연습 기록 추가
     */
    async addRecord(recordData) {
        return await this.request('addRecord', { data: recordData });
    },

    // ========================================
    // 초기화
    // ========================================

    /**
     * 스프레드시트 초기화
     */
    async initialize() {
        return await this.request('init');
    }
};
