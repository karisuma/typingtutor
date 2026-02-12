/**
 * 타자 연습 프로그램 - 메인 애플리케이션
 * UI 이벤트 및 전체 앱 로직 관리
 */

const App = {
    // 현재 상태
    state: {
        currentPage: 'home',  // home, practice
        isLoggedIn: false,
        currentUser: null
    },

    /**
     * 초기화
     */
    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.setupModalListeners();
        this.updateAuthUI();
    },

    /**
     * 로그인 상태 확인
     */
    checkLoginStatus() {
        const user = Storage.getCurrentUser();
        if (user) {
            this.state.isLoggedIn = true;
            this.state.currentUser = user;
        }
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 네비게이션 토글 (모바일)
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // 네비게이션 링크
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = link.dataset.mode;
                if (mode) {
                    this.showPracticeArea(mode);
                }
            });
        });

        // 히어로 버튼
        const startPractice = document.getElementById('startPractice');
        if (startPractice) {
            startPractice.addEventListener('click', () => {
                this.scrollToModes();
            });
        }

        const learnMore = document.getElementById('learnMore');
        if (learnMore) {
            learnMore.addEventListener('click', () => {
                this.scrollToModes();
            });
        }

        // 모드 카드 클릭
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.showPracticeArea(mode);
            });
        });

        // 연습 영역 닫기
        const closePractice = document.getElementById('closePractice');
        if (closePractice) {
            closePractice.addEventListener('click', () => {
                this.hidePracticeArea();
            });
        }

        // 설정 변경 (언어, 레벨)
        const languageSelect = document.getElementById('languageSelect');
        const levelSelect = document.getElementById('levelSelect');

        if (languageSelect) {
            languageSelect.addEventListener('change', () => {
                this.updatePracticeSettings();
            });
        }

        if (levelSelect) {
            levelSelect.addEventListener('change', () => {
                this.updatePracticeSettings();
            });
        }

        // 결과 모달 버튼
        const retryBtn = document.getElementById('retryBtn');
        const backToMenuBtn = document.getElementById('backToMenuBtn');

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                Practice.retry();
            });
        }

        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                Practice.hideResult();
                this.hidePracticeArea();
            });
        }

        // 로그인/회원가입 버튼
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showModal('loginModal');
            });
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.showModal('signupModal');
            });
        }
    },

    /**
     * 모달 이벤트 리스너 설정
     */
    setupModalListeners() {
        // 로그인 모달
        const closeLoginModal = document.getElementById('closeLoginModal');
        const loginForm = document.getElementById('loginForm');
        const switchToSignup = document.getElementById('switchToSignup');

        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                this.hideModal('loginModal');
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('loginModal');
                this.showModal('signupModal');
            });
        }

        // 회원가입 모달
        const closeSignupModal = document.getElementById('closeSignupModal');
        const signupForm = document.getElementById('signupForm');
        const switchToLogin = document.getElementById('switchToLogin');

        if (closeSignupModal) {
            closeSignupModal.addEventListener('click', () => {
                this.hideModal('signupModal');
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('signupModal');
                this.showModal('loginModal');
            });
        }

        // 모달 오버레이 클릭시 닫기
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    },

    /**
     * 로그인 처리
     */
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // 로딩 상태 표시 (선택 사항)
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = loginBtn ? loginBtn.textContent : '로그인';
        if (loginBtn) {
            loginBtn.textContent = '로그인 중...';
            loginBtn.disabled = true;
        }

        try {
            const result = await Storage.login(email, password);

            if (result.success) {
                this.state.isLoggedIn = true;
                this.state.currentUser = result.user;
                this.updateAuthUI();
                this.hideModal('loginModal');
                this.showNotification('로그인되었습니다.', 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Login Error:', error);
            this.showNotification('로그인 중 오류가 발생했습니다.', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        }
    },

    /**
     * 회원가입 처리
     */
    async handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

        // 유효성 검사
        if (password !== passwordConfirm) {
            this.showNotification('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        if (password.length < 4) {
            this.showNotification('비밀번호는 4자 이상이어야 합니다.', 'error');
            return;
        }

        const signupBtn = document.querySelector('#signupForm button[type="submit"]');
        const originalText = signupBtn ? signupBtn.textContent : '가입하기';
        if (signupBtn) {
            signupBtn.textContent = '가입 중...';
            signupBtn.disabled = true;
        }

        try {
            const result = await Storage.createUser({ name, email, password, role: 'student' });

            if (result.success) {
                // 자동 로그인
                const loginResult = await Storage.login(email, password);
                if (loginResult.success) {
                    this.state.isLoggedIn = true;
                    this.state.currentUser = loginResult.user;
                    this.updateAuthUI();
                }

                this.hideModal('signupModal');
                this.showNotification('회원가입이 완료되었습니다.', 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Signup Error:', error);
            this.showNotification('가입 중 오류가 발생했습니다.', 'error');
        } finally {
            if (signupBtn) {
                signupBtn.textContent = originalText;
                signupBtn.disabled = false;
            }
        }
    },

    /**
     * 로그아웃 처리
     */
    handleLogout() {
        Storage.logout();
        this.state.isLoggedIn = false;
        this.state.currentUser = null;
        this.updateAuthUI();
        this.showNotification('로그아웃되었습니다.', 'success');
    },

    /**
     * 인증 UI 업데이트
     */
    updateAuthUI() {
        const authContainer = document.querySelector('.nav-auth');
        if (!authContainer) return;

        if (this.state.isLoggedIn && this.state.currentUser) {
            const user = this.state.currentUser;
            const isAdmin = user.role === 'admin';

            authContainer.innerHTML = `
                <span class="user-name">${user.name}님</span>
                ${isAdmin ? '<a href="admin/index.html" class="btn btn-ghost">관리자</a>' : ''}
                <a href="pages/profile.html" class="btn btn-ghost">내 프로필</a>
                <button class="btn btn-ghost" id="logoutBtn">로그아웃</button>
            `;

            // 로그아웃 버튼 이벤트
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.handleLogout());
            }
        } else {
            authContainer.innerHTML = `
                <button class="btn btn-ghost" id="loginBtn">로그인</button>
                <button class="btn btn-primary" id="signupBtn">회원가입</button>
            `;

            // 버튼 이벤트 다시 연결
            document.getElementById('loginBtn')?.addEventListener('click', () => {
                this.showModal('loginModal');
            });
            document.getElementById('signupBtn')?.addEventListener('click', () => {
                this.showModal('signupModal');
            });
        }
    },

    /**
     * 모달 표시
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    /**
     * 모달 숨기기
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    /**
     * 연습 모드 섹션으로 스크롤
     */
    scrollToModes() {
        const modesSection = document.getElementById('modes');
        if (modesSection) {
            modesSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * 연습 영역 표시
     */
    showPracticeArea(mode) {
        // 히어로와 모드 선택 숨기기
        document.querySelector('.hero')?.classList.add('hidden');
        document.querySelector('.practice-modes')?.classList.add('hidden');

        // 연습 영역 표시
        const practiceArea = document.getElementById('practice');
        if (practiceArea) {
            practiceArea.classList.remove('hidden');
        }

        // 제목 업데이트
        const titles = {
            'position': '자리 연습',
            'word': '단어 연습',
            'sentence': '문장 연습',
            'longtext': '장문 연습'
        };

        const titleEl = document.querySelector('.practice-title');
        if (titleEl) {
            titleEl.textContent = titles[mode] || '타자 연습';
        }

        // 레벨 선택 옵션 업데이트
        this.updateLevelOptions(mode);

        // 연습 시작
        const language = document.getElementById('languageSelect')?.value || 'korean';
        const level = document.getElementById('levelSelect')?.value || 'home';

        Practice.start(mode, language, level);

        this.state.currentPage = 'practice';
    },

    /**
     * 레벨 선택 옵션 업데이트
     */
    updateLevelOptions(mode) {
        const levelSelect = document.getElementById('levelSelect');
        if (!levelSelect) return;

        if (mode === 'position') {
            levelSelect.innerHTML = `
                <option value="home">기본자리</option>
                <option value="home-top">기본+윗자리</option>
                <option value="home-bottom">기본+아랫자리</option>
                <option value="all">전체</option>
            `;
            levelSelect.parentElement.style.display = '';
        } else if (mode === 'word') {
            levelSelect.innerHTML = `
                <option value="home">기본자리</option>
                <option value="home-top">기본자리 + 윗자리</option>
                <option value="home-bottom">기본자리 + 아랫자리</option>
                <option value="all">모든 단어</option>
            `;
            levelSelect.parentElement.style.display = '';
        } else {
            // 문장, 장문은 레벨 선택 불필요
            levelSelect.parentElement.style.display = 'none';
        }
    },

    /**
     * 연습 영역 숨기기
     */
    hidePracticeArea() {
        Practice.stop();

        // 연습 영역 숨기기
        const practiceArea = document.getElementById('practice');
        if (practiceArea) {
            practiceArea.classList.add('hidden');
        }

        // 히어로와 모드 선택 표시
        document.querySelector('.hero')?.classList.remove('hidden');
        document.querySelector('.practice-modes')?.classList.remove('hidden');

        this.state.currentPage = 'home';
    },

    /**
     * 연습 설정 업데이트
     */
    updatePracticeSettings() {
        if (Practice.state.isActive) {
            Practice.stop();
        }

        const mode = Practice.state.mode;
        const language = document.getElementById('languageSelect')?.value || 'korean';
        const level = document.getElementById('levelSelect')?.value || 'home';

        Practice.start(mode, language, level);
    },

    /**
     * 알림 표시
     */
    showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // 스타일 추가
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #10b981; color: white;' : ''}
            ${type === 'error' ? 'background: #ef4444; color: white;' : ''}
            ${type === 'info' ? 'background: #6366f1; color: white;' : ''}
        `;

        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// 알림 애니메이션 CSS 추가
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .typing-area.error-flash {
        animation: errorFlash 0.2s ease;
    }
    @keyframes errorFlash {
        0%, 100% { background: var(--color-bg-card); }
        50% { background: rgba(239, 68, 68, 0.2); }
    }
    .user-name {
        color: var(--color-accent-primary);
        font-weight: 500;
        margin-right: 8px;
    }
`;
document.head.appendChild(notificationStyles);

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
