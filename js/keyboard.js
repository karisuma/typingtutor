/**
 * 타자 연습 프로그램 - 가상 키보드 관리
 * 키보드 표시, 하이라이트, 손가락 가이드
 */

const Keyboard = {
    // 한글 키 매핑 (두벌식)
    koreanMap: {
        'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
        'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
        'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
        'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
        'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ',
        'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ'
    },

    // Shift + 한글 키 매핑 (쌍자음, 이중모음)
    koreanShiftMap: {
        'q': 'ㅃ', 'w': 'ㅉ', 'e': 'ㄸ', 'r': 'ㄲ', 't': 'ㅆ',
        'o': 'ㅒ', 'p': 'ㅖ'
    },

    // 영어 키 매핑
    englishMap: {
        'q': 'q', 'w': 'w', 'e': 'e', 'r': 'r', 't': 't',
        'y': 'y', 'u': 'u', 'i': 'i', 'o': 'o', 'p': 'p',
        'a': 'a', 's': 's', 'd': 'd', 'f': 'f', 'g': 'g',
        'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l',
        'z': 'z', 'x': 'x', 'c': 'c', 'v': 'v',
        'b': 'b', 'n': 'n', 'm': 'm'
    },

    // 자리별 키 분류 (한글)
    positionKeys: {
        home: {
            left: ['a', 's', 'd', 'f'],  // ㅁ, ㄴ, ㅇ, ㄹ
            right: ['j', 'k', 'l', ';']   // ㅓ, ㅏ, ㅣ, ;
        },
        top: {
            left: ['q', 'w', 'e', 'r', 't'],  // ㅂ, ㅈ, ㄷ, ㄱ, ㅅ
            right: ['y', 'u', 'i', 'o', 'p']   // ㅛ, ㅕ, ㅑ, ㅐ, ㅔ
        },
        bottom: {
            left: ['z', 'x', 'c', 'v'],  // ㅋ, ㅌ, ㅊ, ㅍ
            right: ['b', 'n', 'm']        // ㅠ, ㅜ, ㅡ
        },
        middle: {
            left: ['g'],   // ㅎ
            right: ['h']   // ㅗ
        }
    },

    // 자소들 (한글)
    koreanChars: {
        home: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ'],
        top: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
        bottom: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
        middle: ['ㅎ', 'ㅗ']
    },

    // 자소들 (영어)
    englishChars: {
        home: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
        top: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        bottom: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    },

    // 자소 -> 키 역매핑
    charToKey: {},

    // 현재 언어
    currentLanguage: 'korean',

    /**
     * 초기화
     */
    init() {
        this.buildCharToKeyMap();
        this.setupKeyboardEvents();
    },

    /**
     * 자소 -> 키 역매핑 생성
     */
    buildCharToKeyMap() {
        // 한글 매핑 (자음 + 모음 모두)
        for (const [key, char] of Object.entries(this.koreanMap)) {
            this.charToKey[char] = key;
        }
        // Shift 매핑 (쌍자음 등)
        for (const [key, char] of Object.entries(this.koreanShiftMap)) {
            this.charToKey[char] = key;
        }
        // 영어 매핑
        for (const [key, char] of Object.entries(this.englishMap)) {
            this.charToKey[char] = key;
            this.charToKey[char.toUpperCase()] = key;
        }

        // 복합 모음 매핑 (이중모음은 기본 모음 키로)
        this.complexVowelMap = {
            'ㅘ': ['h', 'k'],  // ㅗ + ㅏ
            'ㅙ': ['h', 'o'],  // ㅗ + ㅐ
            'ㅚ': ['h', 'l'],  // ㅗ + ㅣ
            'ㅝ': ['n', 'j'],  // ㅜ + ㅓ
            'ㅞ': ['n', 'p'],  // ㅜ + ㅔ
            'ㅟ': ['n', 'l'],  // ㅜ + ㅣ
            'ㅢ': ['m', 'l']   // ㅡ + ㅣ
        };

        // 이중받침(겹받침) 매핑 - 입력 순서대로 분해
        this.complexJongsungMap = {
            'ㄳ': ['ㄱ', 'ㅅ'],  // ㄱ + ㅅ
            'ㄵ': ['ㄴ', 'ㅈ'],  // ㄴ + ㅈ
            'ㄶ': ['ㄴ', 'ㅎ'],  // ㄴ + ㅎ
            'ㄺ': ['ㄹ', 'ㄱ'],  // ㄹ + ㄱ
            'ㄻ': ['ㄹ', 'ㅁ'],  // ㄹ + ㅁ
            'ㄼ': ['ㄹ', 'ㅂ'],  // ㄹ + ㅂ
            'ㄽ': ['ㄹ', 'ㅅ'],  // ㄹ + ㅅ
            'ㄾ': ['ㄹ', 'ㅌ'],  // ㄹ + ㅌ
            'ㄿ': ['ㄹ', 'ㅍ'],  // ㄹ + ㅍ
            'ㅀ': ['ㄹ', 'ㅎ'],  // ㄹ + ㅎ
            'ㅄ': ['ㅂ', 'ㅅ']   // ㅂ + ㅅ
        };
    },

    /**
     * 키보드 이벤트 설정
     */
    setupKeyboardEvents() {
        // 키 다운 - 하이라이트
        document.addEventListener('keydown', (e) => {
            this.highlightKey(e.key.toLowerCase(), true);
        });

        // 키 업 - 하이라이트 해제
        document.addEventListener('keyup', (e) => {
            this.highlightKey(e.key.toLowerCase(), false);
        });
    },

    /**
     * 키 하이라이트
     */
    highlightKey(key, active) {
        const keyElement = document.querySelector(`.virtual-keyboard .key[data-key="${key}"]`);
        if (keyElement) {
            if (active) {
                keyElement.classList.add('active');
            } else {
                keyElement.classList.remove('active');
            }
        }
    },

    /**
     * 다음에 눌러야 할 키 표시 (한 개의 자소만)
     * @param {string} jamo - 단일 자소 또는 복합 모음의 첫 번째 키
     */
    showNextKey(jamo) {
        // 기존 next 클래스 제거
        document.querySelectorAll('.virtual-keyboard .key.next').forEach(el => {
            el.classList.remove('next');
        });

        if (!jamo) return;

        // 해당 자소의 키 찾기
        let key = this.charToKey[jamo];

        // 영어인 경우
        if (!key && this.currentLanguage === 'english') {
            key = jamo.toLowerCase();
        }

        if (key) {
            const keyElement = document.querySelector(`.virtual-keyboard .key[data-key="${key}"]`);
            if (keyElement) {
                keyElement.classList.add('next');
            }
        }
    },

    /**
     * 한글 글자를 자소 시퀀스로 분해
     * @param {string} char - 한글 완성형 글자
     * @returns {string[]} - 자소 배열 (키 입력 순서)
     */
    getJamoSequence(char) {
        if (!char) return [];

        // 이미 자소인 경우
        if (this.charToKey[char]) {
            return [char];
        }

        // 복합 모음인 경우
        if (this.complexVowelMap && this.complexVowelMap[char]) {
            // 복합 모음을 구성하는 단일 모음들 반환
            const keys = this.complexVowelMap[char];
            return keys.map(k => this.koreanMap[k]);
        }

        // 한글 완성형인 경우 분해
        const decomposed = this.decomposeKorean(char);
        if (!decomposed) return [];

        // 자소 시퀀스 생성 (복합 모음 및 이중받침 풀어서)
        const sequence = [];
        for (const jamo of decomposed) {
            if (this.complexVowelMap && this.complexVowelMap[jamo]) {
                // 복합 모음 분해
                const keys = this.complexVowelMap[jamo];
                for (const k of keys) {
                    sequence.push(this.koreanMap[k]);
                }
            } else if (this.complexJongsungMap && this.complexJongsungMap[jamo]) {
                // 이중받침(겹받침) 분해
                const jamos = this.complexJongsungMap[jamo];
                for (const j of jamos) {
                    sequence.push(j);
                }
            } else {
                sequence.push(jamo);
            }
        }
        return sequence;
    },

    /**
     * 한글 글자 분해 (초성, 중성, 종성)
     */
    decomposeKorean(char) {
        const code = char.charCodeAt(0);

        // 한글 완성형 범위 (가 ~ 힣)
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const baseCode = code - 0xAC00;

            const chosung = Math.floor(baseCode / (21 * 28));
            const jungsung = Math.floor((baseCode % (21 * 28)) / 28);
            const jongsung = baseCode % 28;

            const chosungList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
            const jungsungList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
            const jongsungList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

            const result = [chosungList[chosung], jungsungList[jungsung]];
            if (jongsung > 0) {
                result.push(jongsungList[jongsung]);
            }
            return result;
        }

        // 이미 자소인 경우
        if (Object.values(this.koreanMap).includes(char) ||
            Object.values(this.koreanShiftMap).includes(char)) {
            return [char];
        }

        return null;
    },

    /**
     * 자리별 연습 문자 생성
     */
    getPositionChars(level, language = 'korean') {
        const chars = language === 'korean' ? this.koreanChars : this.englishChars;

        switch (level) {
            case 'home':
                return chars.home;
            case 'top':
                return [...chars.home, ...chars.top];
            case 'bottom':
                return [...chars.home, ...chars.bottom];
            case 'all':
                return [...chars.home, ...chars.top, ...chars.bottom, ...(chars.middle || [])];
            default:
                return chars.home;
        }
    },

    /**
     * 랜덤 자리 연습 문자열 생성
     */
    generatePositionPractice(level, count = 20, language = 'korean') {
        const chars = this.getPositionChars(level, language);
        let result = [];

        for (let i = 0; i < count; i++) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            result.push(randomChar);
        }

        return result;
    },

    /**
     * 언어 설정
     */
    setLanguage(language) {
        this.currentLanguage = language;
        this.updateKeyboardDisplay();
    },

    /**
     * 키보드 표시 업데이트 (한/영 전환)
     */
    updateKeyboardDisplay() {
        const keys = document.querySelectorAll('.virtual-keyboard .key[data-korean]');

        keys.forEach(key => {
            const englishKey = key.dataset.key;
            const koreanChar = key.dataset.korean;

            if (this.currentLanguage === 'korean') {
                key.textContent = koreanChar;
            } else {
                key.textContent = englishKey.toUpperCase();
            }
        });
    },

    /**
     * 모든 키 하이라이트 초기화
     */
    clearAllHighlights() {
        document.querySelectorAll('.virtual-keyboard .key').forEach(key => {
            key.classList.remove('active', 'next');
        });
    }
};

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    Keyboard.init();
});
