/**
 * 타자 연습 프로그램 - 데이터 저장 관리
 * LocalStorage 기반 사용자 및 기록 저장
 */

const Storage = {
    // 저장소 키
    KEYS: {
        USERS: 'typingtutor_users',
        CURRENT_USER: 'typingtutor_current_user',
        PRACTICE_RECORDS: 'typingtutor_records',
        SETTINGS: 'typingtutor_settings'
    },

    /**
     * 초기화 - 기본 데이터 구조 생성
     */
    async init() {
        // API 사용 시 초기화는 서버에서 처리되거나 필요 없음
        if (USE_API) {
            try {
                // 서버 연결 확인 겸 초기화
                await ApiClient.initialize();
                console.log('API Connected');
            } catch (e) {
                console.error('API Connection Failed:', e);
            }
            return;
        }

        // 로컬 스토리지 초기화
        if (!await this.getUsers()) {
            const defaultAdmin = {
                id: 'admin_001',
                name: '관리자',
                email: 'admin@typingtutor.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            this.saveUsers([defaultAdmin]);
        }

        if (!await this.getRecords()) {
            this.saveRecords([]);
        }

        if (!this.getSettings()) {
            this.saveSettings({
                theme: 'dark',
                language: 'korean',
                showKeyboard: true,
                soundEnabled: true
            });
        }
    },

    // ===========================================
    // 사용자 관리
    // ===========================================

    /**
     * 모든 사용자 조회
     */
    async getUsers() {
        if (USE_API) {
            const result = await ApiClient.getUsers();
            return result.success ? result.users : [];
        }
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : null;
    },

    /**
     * 사용자 목록 저장 (로컬 전용)
     */
    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    /**
     * ID로 사용자 조회
     */
    async getUserById(userId) {
        // API 모드에서는 리스트에서 검색 (API 최적화 가능)
        const users = await this.getUsers() || [];
        return users.find(u => u.id === userId);
    },

    /**
     * 이메일로 사용자 조회
     */
    async getUserByEmail(email) {
        if (USE_API) {
            const result = await ApiClient.getUserByEmail(email);
            return result.success ? result.user : null;
        }
        const users = await this.getUsers() || [];
        return users.find(u => u.email === email);
    },

    /**
     * 사용자 생성
     */
    async createUser(userData) {
        if (USE_API) {
            return await ApiClient.createUser(userData);
        }

        const users = await this.getUsers() || [];

        if (await this.getUserByEmail(userData.email)) {
            return { success: false, message: '이미 사용 중인 이메일입니다.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'student',
            createdAt: new Date().toISOString(),
            stats: {
                totalPracticeTime: 0,
                totalTypedChars: 0,
                averageSpeed: 0,
                averageAccuracy: 0,
                practiceCount: 0
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        return { success: true, user: newUser };
    },

    /**
     * 사용자 정보 수정
     */
    async updateUser(userId, updates) {
        if (USE_API) {
            return await ApiClient.updateUser(userId, updates);
        }

        const users = await this.getUsers() || [];
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
        this.saveUsers(users);

        // 현재 로그인한 사용자가 업데이트된 경우 로컬 세션도 업데이트
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const { password, ...safeUser } = users[index];
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));
        }

        return { success: true, user: users[index] };
    },

    /**
     * 사용자 삭제
     */
    async deleteUser(userId) {
        if (USE_API) {
            return await ApiClient.deleteUser(userId);
        }

        const users = await this.getUsers() || [];
        const filtered = users.filter(u => u.id !== userId);

        if (filtered.length === users.length) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        this.saveUsers(filtered);

        const records = await this.getRecords() || [];
        const filteredRecords = records.filter(r => r.userId !== userId);
        this.saveRecords(filteredRecords);

        return { success: true };
    },

    // ===========================================
    // 인증
    // ===========================================

    /**
     * 로그인
     */
    async login(email, password) {
        let user;

        if (USE_API) {
            const result = await ApiClient.login(email, password);
            if (!result.success) return result;
            user = result.user;
        } else {
            const fullUser = await this.getUserByEmail(email);
            if (!fullUser) {
                return { success: false, message: '사용자를 찾을 수 없습니다.' };
            }
            if (fullUser.password !== password) {
                return { success: false, message: '비밀번호가 일치하지 않습니다.' };
            }
            // 비밀번호 제외
            const { password: _, ...safeUser } = fullUser;
            user = safeUser;
        }

        // 로그인 성공 시 로컬에 세션 저장 (공통)
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
        return { success: true, user: user };
    },

    /**
     * 로그아웃
     */
    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        return { success: true };
    },

    /**
     * 현재 로그인한 사용자 조회 (동기 유지 - 성능상 이유)
     */
    getCurrentUser() {
        const data = localStorage.getItem(this.KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    },

    /**
     * 관리자 여부 확인
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // ===========================================
    // 연습 기록 관리
    // ===========================================

    /**
     * 모든 연습 기록 조회
     */
    async getRecords() {
        if (USE_API) {
            const result = await ApiClient.getRecords();
            return result.success ? result.records : [];
        }
        const data = localStorage.getItem(this.KEYS.PRACTICE_RECORDS);
        return data ? JSON.parse(data) : null;
    },

    /**
     * 연습 기록 저장 (로컬 전용)
     */
    saveRecords(records) {
        localStorage.setItem(this.KEYS.PRACTICE_RECORDS, JSON.stringify(records));
    },

    /**
     * 연습 기록 추가
     */
    async addRecord(recordData) {
        const currentUser = this.getCurrentUser();

        if (USE_API) {
            // API 호출 시 사용자 정보는 서버에서 토큰 등으로 처리하는게 좋지만, 
            // 현재 구조상 클라이언트 데이터를 신뢰하고 보냄
            const apiRecordData = {
                ...recordData,
                userId: currentUser ? currentUser.id : 'guest',
                userName: currentUser ? currentUser.name : '게스트'
            };
            return await ApiClient.addRecord(apiRecordData);
        }

        const records = await this.getRecords() || [];

        const newRecord = {
            id: 'record_' + Date.now(),
            userId: currentUser ? currentUser.id : 'guest',
            userName: currentUser ? currentUser.name : '게스트',
            mode: recordData.mode,
            language: recordData.language,
            level: recordData.level,
            duration: recordData.duration,
            typedChars: recordData.typedChars,
            correctChars: recordData.correctChars,
            speed: recordData.speed,
            accuracy: recordData.accuracy,
            createdAt: new Date().toISOString()
        };

        records.push(newRecord);
        this.saveRecords(records);

        if (currentUser) {
            await this.updateUserStats(currentUser.id, newRecord);
        }

        return { success: true, record: newRecord };
    },

    /**
     * 사용자별 연습 기록 조회
     */
    async getRecordsByUser(userId) {
        if (USE_API) {
            const result = await ApiClient.getRecordsByUser(userId);
            return result.success ? result.records : [];
        }
        const records = await this.getRecords() || [];
        return records.filter(r => r.userId === userId);
    },

    /**
     * 사용자 통계 업데이트 (로컬 전용 - API는 서버 사이드에서 자동 계산 권장)
     */
    async updateUserStats(userId, record) {
        if (USE_API) return; // API 모드에서는 서버가 처리

        const user = await this.getUserById(userId);
        if (!user) return;

        const userRecords = await this.getRecordsByUser(userId);
        const totalRecords = userRecords.length;

        const totalPracticeTime = userRecords.reduce((sum, r) => sum + r.duration, 0);
        const totalTypedChars = userRecords.reduce((sum, r) => sum + r.typedChars, 0);
        const avgSpeed = totalRecords > 0
            ? Math.round(userRecords.reduce((sum, r) => sum + r.speed, 0) / totalRecords)
            : 0;
        const avgAccuracy = totalRecords > 0
            ? Math.round(userRecords.reduce((sum, r) => sum + r.accuracy, 0) / totalRecords)
            : 0;

        await this.updateUser(userId, {
            stats: {
                totalPracticeTime,
                totalTypedChars,
                averageSpeed: avgSpeed,
                averageAccuracy: avgAccuracy,
                practiceCount: totalRecords
            }
        });
    },

    /**
     * 사용자 성장 데이터 조회
     */
    async getGrowthData(userId, days = 30) {
        // API에 해당 엔드포인트가 없으므로 클라이언트에서 records를 받아 계산
        // (API 개선 시 서버 사이드 로직으로 이동 가능)
        const records = await this.getRecordsByUser(userId);
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const dailyData = {};

        records.forEach(record => {
            const date = new Date(record.createdAt);
            if (date >= startDate) {
                const dateKey = date.toISOString().split('T')[0];
                if (!dailyData[dateKey]) {
                    dailyData[dateKey] = {
                        date: dateKey,
                        speed: [],
                        accuracy: [],
                        count: 0
                    };
                }
                dailyData[dateKey].speed.push(record.speed);
                dailyData[dateKey].accuracy.push(record.accuracy);
                dailyData[dateKey].count++;
            }
        });

        return Object.values(dailyData).map(day => ({
            date: day.date,
            avgSpeed: Math.round(day.speed.reduce((a, b) => a + b, 0) / day.speed.length),
            avgAccuracy: Math.round(day.accuracy.reduce((a, b) => a + b, 0) / day.accuracy.length),
            practiceCount: day.count
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // ===========================================
    // 설정 관리
    // ===========================================

    /**
     * 설정 조회 (로컬 전용 유지)
     */
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    },

    /**
     * 설정 저장
     */
    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * 설정 업데이트
     */
    updateSettings(updates) {
        const current = this.getSettings() || {};
        const updated = { ...current, ...updates };
        this.saveSettings(updated);
        return updated;
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
});
