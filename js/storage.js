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
    init() {
        // 사용자 목록이 없으면 기본 관리자 생성
        if (!this.getUsers()) {
            const defaultAdmin = {
                id: 'admin_001',
                name: '관리자',
                email: 'admin@typingtutor.com',
                password: 'admin123', // 실제 환경에서는 해시 처리 필요
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            this.saveUsers([defaultAdmin]);
        }

        // 연습 기록이 없으면 빈 배열 생성
        if (!this.getRecords()) {
            this.saveRecords([]);
        }

        // 기본 설정
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
    getUsers() {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : null;
    },

    /**
     * 사용자 목록 저장
     */
    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    /**
     * ID로 사용자 조회
     */
    getUserById(userId) {
        const users = this.getUsers() || [];
        return users.find(u => u.id === userId);
    },

    /**
     * 이메일로 사용자 조회
     */
    getUserByEmail(email) {
        const users = this.getUsers() || [];
        return users.find(u => u.email === email);
    },

    /**
     * 사용자 생성
     */
    createUser(userData) {
        const users = this.getUsers() || [];
        
        // 이메일 중복 확인
        if (this.getUserByEmail(userData.email)) {
            return { success: false, message: '이미 사용 중인 이메일입니다.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // 실제로는 해시 처리 필요
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
    updateUser(userId, updates) {
        const users = this.getUsers() || [];
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
        this.saveUsers(users);

        return { success: true, user: users[index] };
    },

    /**
     * 사용자 삭제
     */
    deleteUser(userId) {
        const users = this.getUsers() || [];
        const filtered = users.filter(u => u.id !== userId);

        if (filtered.length === users.length) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        this.saveUsers(filtered);
        
        // 해당 사용자의 연습 기록도 삭제
        const records = this.getRecords() || [];
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
    login(email, password) {
        const user = this.getUserByEmail(email);
        
        if (!user) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        if (user.password !== password) {
            return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }

        // 현재 사용자 저장 (비밀번호 제외)
        const { password: _, ...safeUser } = user;
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));

        return { success: true, user: safeUser };
    },

    /**
     * 로그아웃
     */
    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        return { success: true };
    },

    /**
     * 현재 로그인한 사용자 조회
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
    getRecords() {
        const data = localStorage.getItem(this.KEYS.PRACTICE_RECORDS);
        return data ? JSON.parse(data) : null;
    },

    /**
     * 연습 기록 저장
     */
    saveRecords(records) {
        localStorage.setItem(this.KEYS.PRACTICE_RECORDS, JSON.stringify(records));
    },

    /**
     * 연습 기록 추가
     */
    addRecord(recordData) {
        const records = this.getRecords() || [];
        const currentUser = this.getCurrentUser();

        const newRecord = {
            id: 'record_' + Date.now(),
            userId: currentUser ? currentUser.id : 'guest',
            userName: currentUser ? currentUser.name : '게스트',
            mode: recordData.mode,           // position, word, sentence, longtext
            language: recordData.language,   // korean, english
            level: recordData.level,         // home, top, bottom, all
            duration: recordData.duration,   // 초
            typedChars: recordData.typedChars,
            correctChars: recordData.correctChars,
            speed: recordData.speed,         // 타/분
            accuracy: recordData.accuracy,   // %
            createdAt: new Date().toISOString()
        };

        records.push(newRecord);
        this.saveRecords(records);

        // 사용자 통계 업데이트
        if (currentUser) {
            this.updateUserStats(currentUser.id, newRecord);
        }

        return { success: true, record: newRecord };
    },

    /**
     * 사용자별 연습 기록 조회
     */
    getRecordsByUser(userId) {
        const records = this.getRecords() || [];
        return records.filter(r => r.userId === userId);
    },

    /**
     * 사용자 통계 업데이트
     */
    updateUserStats(userId, record) {
        const user = this.getUserById(userId);
        if (!user) return;

        const userRecords = this.getRecordsByUser(userId);
        const totalRecords = userRecords.length;

        // 통계 계산
        const totalPracticeTime = userRecords.reduce((sum, r) => sum + r.duration, 0);
        const totalTypedChars = userRecords.reduce((sum, r) => sum + r.typedChars, 0);
        const avgSpeed = totalRecords > 0 
            ? Math.round(userRecords.reduce((sum, r) => sum + r.speed, 0) / totalRecords) 
            : 0;
        const avgAccuracy = totalRecords > 0 
            ? Math.round(userRecords.reduce((sum, r) => sum + r.accuracy, 0) / totalRecords) 
            : 0;

        this.updateUser(userId, {
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
     * 사용자 성장 데이터 조회 (최근 N일)
     */
    getGrowthData(userId, days = 30) {
        const records = this.getRecordsByUser(userId);
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // 날짜별 그룹화
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

        // 평균 계산
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
     * 설정 조회
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
