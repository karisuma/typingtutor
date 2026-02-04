/**
 * 타자 연습 프로그램 - 연습 모드 관리
 * 자리연습, 단어연습, 문장연습, 장문연습
 */

const Practice = {
    // 연습 상태
    state: {
        isActive: false,
        mode: 'position',      // position, word, sentence, longtext
        language: 'korean',
        level: 'home',

        targetText: [],        // 목표 문자/단어 배열
        currentIndex: 0,       // 현재 위치
        typedText: '',         // 입력된 텍스트

        startTime: null,
        elapsedTime: 0,
        timerInterval: null,
        timerStarted: false,   // 타이머 시작 여부 (첫 입력 시 시작)

        totalChars: 0,
        correctChars: 0,
        incorrectChars: 0,

        isComposing: false,    // 한글 조합 중 여부

        // 자소 시퀀스 추적 (한글 순차 하이라이트용)
        jamoSequence: [],      // 전체 목표 텍스트의 자소 시퀀스
        jamoIndex: 0,          // 현재 자소 위치
        completedJamoCount: 0, // 완성된 글자들의 자소 수 (compositionend에서 업데이트)

        // 단어 연습 전용 상태
        wordPractice: {
            allWords: [],          // 전체 100개 단어
            currentSet: 0,         // 현재 세트 (0-19)
            totalSets: 20,         // 총 20세트
            wordsPerSet: 5,        // 세트당 5단어
            currentWordIndex: 0,   // 현재 세트에서의 단어 인덱스
            completedWords: 0,     // 완료된 단어 수
            // 누적 통계
            cumulativeTotalChars: 0,    // 누적 총 타자 수
            cumulativeCorrectChars: 0   // 누적 정확 타자 수
        }
    },

    /**
     * 허용 자소 정의 (한글 두벌식)
     * 기본자리: ㅁㄴㅇㄹㅎㅗㅓㅏㅣ
     * 윗자리: ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ
     * 아랫자리: ㅋㅌㅊㅍㅠㅜㅡ
     */
    allowedJamo: {
        home: {
            cho: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ'],  // 초성
            jung: ['ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],        // 중성
            jong: ['', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ']     // 종성 (없음 포함)
        },
        top: {
            cho: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ'],
            jung: ['ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
            jong: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ']
        },
        bottom: {
            cho: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
            jung: ['ㅠ', 'ㅜ', 'ㅡ'],
            jong: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ']
        }
    },

    // 연습 데이터 - 정확한 자소 조합만 포함
    data: {
        /**
         * ===== 기본자리 단어 =====
         * 허용 자소: ㅁㄴㅇㄹㅎㅗㅓㅏㅣ
         * 초성: ㅁ, ㄴ, ㅇ, ㄹ, ㅎ
         * 중성: ㅗ, ㅓ, ㅏ, ㅣ
         * 종성: ㅁ, ㄴ, ㅇ, ㄹ (또는 없음)
         */
        koreanHomeWords: [
            // 1음절
            '나', '너', '노', '니', '마', '머', '모', '미', '아', '어', '오', '이',
            '라', '러', '로', '리', '하', '허', '호', '히',
            '남', '님', '람', '림', '힘', '안', '인', '온', '한', '흔',
            '말', '널', '날', '힐', '일', '알', '얼', '올',
            '강', '망', '농', '명', '영', '왕',
            // 2음절
            '나라', '나이', '마음', '마리', '아이', '오리', '이마', '머리', '어미',
            '하나', '하늘', '하얀', '하인', '호랑', '호리', '호흡',
            '아름', '어른', '올림', '이름', '나눔', '노름', '마음',
            '나날', '마을', '나란', '모란', '이런', '어린', '오랑',
            '안녕', '영혼', '인명', '한강', '망나', '농림',
            '나무', '너무', '오늘', '마늘', '어느', '나른', '노른',
            '아랑', '하늘', '머리', '마일', '호일', '나일', '오일',
            // 3음절
            '아리랑', '나라님', '안녕히', '어머니', '이러나', '어이없',
            '마음이', '나라의', '하나님', '하나로', '호리호', '어린이',
            '이리로', '오라니', '아라리', '나라리', '마나님', '머리말',
            // 4음절 이상
            '하나하나', '나라나라', '이리오라', '어리어리', '오리나무',
            '아리아리', '나라사랑', '마음마음', '안녕안녕'
        ],

        /**
         * ===== 기본자리 + 윗자리 단어 =====
         * 허용 자소: ㅁㄴㅇㄹㅎㅗㅓㅏㅣ + ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ
         * 초성: ㅁ, ㄴ, ㅇ, ㄹ, ㅎ, ㅂ, ㅈ, ㄷ, ㄱ, ㅅ
         * 중성: ㅗ, ㅓ, ㅏ, ㅣ, ㅛ, ㅕ, ㅑ, ㅐ, ㅔ
         * 종성: ㅁ, ㄴ, ㅇ, ㄹ, ㅂ, ㅈ, ㄷ, ㄱ, ㅅ (또는 없음)
         */
        koreanHomeTopWords: [
            // 기본자리 단어도 포함 (기본자리 연습 겸용)
            '나라', '마음', '하나', '아이', '어린',
            // 윗자리 포함 단어들
            '가다', '가방', '가게', '가을', '가지', '가요', '가야', '가며',
            '나가', '다가', '바다', '사다', '자다', '하다',
            '바람', '사랑', '다리', '자리', '가리', '바리', '사리',
            '바지', '사자', '다자', '가자', '나자', '하자',
            '거리', '머리', '어디', '여기', '저기', '거기',
            '고기', '노래', '도래', '보내', '소리', '조리',
            '사람', '나라', '가람', '다람', '바람', '살람',
            '자신', '마신', '하신', '가신', '다신', '나신',
            '어제', '오늘', '내일', '모레', '그대', '나대',
            '서로', '거로', '너로', '저로', '오로', '이로',
            '여행', '여자', '여기', '여름', '여보', '여야',
            '애기', '얘기', '예의', '예배', '예나', '예가',
            '사이', '나이', '마이', '가이', '다이', '바이',
            '요리', '요가', '요새', '요며', '요나', '요비',
            '이야기', '나야나', '가야가', '다야다', '사야사',
            // 3음절
            '가나다', '사나이', '바나나', '가로등', '나로서',
            '다리미', '바라기', '사라지', '자라나', '가라앉',
            '바라보', '사라져', '가라데', '나라마', '다라니',
            '어린이', '여러분', '사거리', '나거리', '다거리',
            '여기저기', '거기로', '저기로', '이리저리',
            // 4음절 이상
            '사랑해요', '가나다라', '나라사랑', '바다여행',
            '가요대상', '사이좋게', '여기저기', '이리저리'
        ],

        /**
         * ===== 기본자리 + 아랫자리 단어 =====
         * 허용 자소: ㅁㄴㅇㄹㅎㅗㅓㅏㅣ + ㅋㅌㅊㅍㅠㅜㅡ
         * 초성: ㅁ, ㄴ, ㅇ, ㄹ, ㅎ, ㅋ, ㅌ, ㅊ, ㅍ
         * 중성: ㅗ, ㅓ, ㅏ, ㅣ, ㅠ, ㅜ, ㅡ
         * 종성: ㅁ, ㄴ, ㅇ, ㄹ, ㅋ, ㅌ, ㅊ, ㅍ (또는 없음)
         */
        koreanHomeBottomWords: [
            // 기본자리 단어도 포함
            '나라', '마음', '하나', '아이', '어린',
            // 아랫자리 포함 단어들
            '크다', '트다', '치다', '피다', '키', '티', '치', '피',
            '커피', '토론', '초록', '포름', '코리', '토리', '초리',
            '나무', '너무', '오늘', '므늘', '어느', '이느', '하느',
            '우리', '으리', '아무', '이무', '오무', '허무', '나무',
            '누나', '무릎', '푸름', '으름', '누룽', '무릉', '푸릇',
            '하품', '마품', '나품', '어품', '오품', '이품',
            '칼', '탈', '찰', '팔', '칸', '탄', '찬', '판',
            '타오', '카오', '파오', '차오', '토오', '코오',
            '푸른', '으른', '무른', '누른', '하픈', '마픈',
            '풀이', '출입', '충분', '흔들', '플라', '틀림',
            '흐름', '으뜸', '크림', '프림', '트림', '츠름',
            '카톨', '타코', '파코', '차코', '커틀', '터틀',
            // 3음절
            '나무꾼', '푸른빛', '크나큰', '우리나라', '하느님',
            '코끼리', '토마토', '카스테', '파크라', '타르트',
            '피아노', '치즈', '커튼', '토스트', '크리스',
            // 4음절 이상
            '우리나라', '나무하나', '크나크나', '푸르푸른'
        ],

        /**
         * ===== 전체 단어 (모든 자소 사용 가능) =====
         */
        koreanAllWords: [
            // 일상 단어
            '안녕하세요', '감사합니다', '죄송합니다', '반갑습니다', '수고하세요',
            '오늘', '내일', '어제', '모레', '그저께', '이번주', '다음주', '지난주',
            '아침', '점심', '저녁', '새벽', '밤', '낮', '오전', '오후',
            // 학교
            '학교', '교실', '선생님', '학생', '공부', '시험', '성적', '졸업', '입학',
            '숙제', '책상', '의자', '연필', '지우개', '공책', '도서관', '체육관',
            // 음식
            '밥', '국', '반찬', '김치', '불고기', '비빔밥', '된장찌개', '삼겹살', '치킨',
            '피자', '햄버거', '라면', '김밥', '떡볶이', '순대', '만두', '짜장면',
            // 자연
            '하늘', '바다', '산', '강', '숲', '꽃', '나무', '풀', '바람', '비', '눈', '구름',
            // 동물
            '강아지', '고양이', '토끼', '햄스터', '새', '물고기', '거북이', '사자', '호랑이',
            // 기술
            '컴퓨터', '스마트폰', '태블릿', '노트북', '인터넷', '키보드', '마우스',
            // 취미
            '독서', '운동', '여행', '요리', '그림', '음악', '영화', '게임', '드라마',
            // 감정
            '행복', '슬픔', '기쁨', '분노', '놀람', '두려움', '사랑', '희망', '용기',
            // 기타
            '가족', '친구', '회사', '학원', '병원', '약국', '은행', '마트', '편의점'
        ],

        // 기본 영어 단어 (홈 로우)
        englishHomeWords: [
            'as', 'ask', 'dad', 'sad', 'fall', 'add', 'all',
            'salad', 'flask', 'lass', 'falls', 'shall', 'small',
            'a', 's', 'd', 'f', 'j', 'k', 'l', 'fad', 'lad'
        ],

        // 확장 영어 단어
        englishExpandedWords: [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
            'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
            'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
            'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
        ],

        // 한글 문장
        koreanSentences: [
            '나는 오늘 학교에 갔습니다.',
            '우리 가족은 행복합니다.',
            '맛있는 음식을 먹었습니다.',
            '친구와 함께 공부합니다.',
            '열심히 노력하면 성공합니다.',
            '독서는 마음의 양식입니다.',
            '아침 일찍 일어나는 것이 좋습니다.',
            '건강이 가장 소중합니다.',
            '꿈을 향해 달려갑니다.',
            '오늘도 좋은 하루 되세요.'
        ],

        // 영어 문장
        englishSentences: [
            'The quick brown fox jumps over the lazy dog.',
            'Hello, how are you today?',
            'I love learning new things every day.',
            'Practice makes perfect.',
            'Time flies when you are having fun.',
            'A journey of a thousand miles begins with a single step.',
            'Knowledge is power.',
            'Every day is a new opportunity.',
            'Believe in yourself and you will succeed.',
            'The early bird catches the worm.'
        ],

        // 한글 장문
        koreanLongTexts: [
            '타자 연습은 컴퓨터를 효율적으로 사용하기 위한 필수 기술입니다. 처음에는 느리더라도 꾸준히 연습하면 점점 빨라집니다. 올바른 자세와 손가락 위치를 유지하며 연습하는 것이 중요합니다. 화면을 보면서 타이핑하는 습관을 기르세요. 매일 조금씩이라도 연습하면 실력이 향상됩니다.',
            '봄이 오면 꽃이 피고 새들이 노래합니다. 따뜻한 햇살 아래 산책하는 것은 참으로 즐거운 일입니다. 겨울 동안 움츠러들었던 마음도 봄기운에 활짝 펴집니다. 자연의 아름다움을 느끼며 하루하루를 감사하게 보내세요.'
        ],

        // 영어 장문
        englishLongTexts: [
            'Typing is an essential skill in the modern world. With practice, anyone can improve their typing speed and accuracy. The key is to maintain proper posture and finger placement on the keyboard. Start with the home row keys and gradually expand to other rows. Consistent daily practice will lead to significant improvement over time.',
            'Reading books opens up new worlds and perspectives. Through literature, we can experience different cultures, times, and ideas without leaving our homes. Whether fiction or non-fiction, every book has something valuable to offer. Make reading a daily habit and watch your knowledge and imagination grow.'
        ]
    },

    /**
     * 초기화
     */
    init() {
        this.setupEventListeners();
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const input = document.getElementById('typingInput');
        if (!input) return;

        // 입력 이벤트
        input.addEventListener('input', (e) => this.handleInput(e));

        // 한글 조합 시작
        input.addEventListener('compositionstart', () => {
            this.state.isComposing = true;
        });

        // 한글 조합 중 (자소 입력마다 호출)
        input.addEventListener('compositionupdate', (e) => {
            this.handleCompositionUpdate(e);
        });

        // 한글 조합 종료 - 완성된 글자의 자소 수 누적
        input.addEventListener('compositionend', (e) => {
            this.state.isComposing = false;

            // 완성된 글자의 자소 수를 누적
            if (e.data && this.state.language === 'korean' && this.state.mode !== 'position') {
                const completedCharJamos = this.countJamos(e.data);
                this.state.completedJamoCount += completedCharJamos;
            }

            this.handleInput(e);
        });

        // 키다운 (자소 하이라이트 및 특수 키 처리)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.stop();
                return;
            }

            // 한글 모드에서 타이머 시작을 위한 처리만
            if (this.state.isActive && !this.state.timerStarted) {
                const koreanChar = Keyboard.koreanMap[e.key.toLowerCase()] || Keyboard.koreanShiftMap[e.key.toLowerCase()];
                if (koreanChar || e.key === ' ') {
                    // 첫 입력 - 타이머는 handleInput에서 시작됨
                }
            }
        });
    },

    /**
     * 입력된 텍스트의 총 자소 수 계산
     */
    countJamos(text) {
        let count = 0;
        for (const char of text) {
            if (char === ' ') {
                count += 1;
            } else {
                const jamos = Keyboard.getJamoSequence(char);
                if (jamos && jamos.length > 0) {
                    count += jamos.length;
                } else {
                    // 자소이거나 분해할 수 없는 문자는 1로 카운트
                    count += 1;
                }
            }
        }
        return count;
    },

    /**
     * 전체 목표 텍스트의 자소 시퀀스 생성
     */
    buildJamoSequence(text) {
        const sequence = [];

        for (const char of text) {
            if (char === ' ') {
                sequence.push(' ');
            } else {
                const jamos = Keyboard.getJamoSequence(char);
                if (jamos && jamos.length > 0) {
                    sequence.push(...jamos);
                } else {
                    // 자소이거나 분해할 수 없는 문자는 그대로 추가
                    sequence.push(char);
                }
            }
        }

        return sequence;
    },

    /**
     * 조합 중 업데이트 처리 (한글 자소별 하이라이트)
     */
    handleCompositionUpdate(e) {
        if (!this.state.isActive) return;

        const composingData = e.data; // 현재 조합 중인 글자
        if (!composingData) return;

        const { mode, language, jamoSequence, completedJamoCount } = this.state;

        // 단어/문장/장문 모드에서 현재 목표 글자와 비교
        if (mode !== 'position' && language === 'korean') {
            // 조합 중인 글자의 자소 수
            const composingJamoCount = this.countJamos(composingData);

            // 현재까지 입력된 총 자소 수 = 완성된 자소 + 조합 중인 자소
            const nextJamoIndex = completedJamoCount + composingJamoCount;

            // 다음 자소 하이라이트
            if (nextJamoIndex < jamoSequence.length) {
                const nextJamo = jamoSequence[nextJamoIndex];
                if (nextJamo !== ' ') {
                    Keyboard.showNextKey(nextJamo);
                } else {
                    // 스페이스바 하이라이트
                    const spaceKey = document.querySelector('.virtual-keyboard .key.spacebar');
                    if (spaceKey) {
                        document.querySelectorAll('.virtual-keyboard .key.next').forEach(el => el.classList.remove('next'));
                        spaceKey.classList.add('next');
                    }
                }
            } else {
                Keyboard.clearAllHighlights();
            }
        }
    },

    /**
     * 연습 시작
     */
    start(mode, language = 'korean', level = 'home') {
        this.state.mode = mode;
        this.state.language = language;
        this.state.level = level;

        // 키보드 언어 설정
        Keyboard.setLanguage(language);

        // 상태 초기화
        this.state.currentIndex = 0;
        this.state.typedText = '';
        this.state.totalChars = 0;
        this.state.correctChars = 0;
        this.state.incorrectChars = 0;
        this.state.elapsedTime = 0;
        this.state.timerStarted = false;
        this.state.startTime = null;

        // 자소 시퀀스 초기화
        this.state.jamoSequence = [];
        this.state.jamoIndex = 0;
        this.state.completedJamoCount = 0;

        // 단어 연습 모드 초기화
        if (mode === 'word') {
            this.initWordPractice();

            // 단어 연습은 비동기로 데이터 로드 후 UI 갱신하므로 여기서 기본 설정만 하고 종료
            this.state.isActive = true;

            // 입력 필드 초기화 및 포커스
            const input = document.getElementById('typingInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            return;
        } else if (mode === 'sentence') {
            this.initSentencePractice();
            this.state.isActive = true;
            const input = document.getElementById('typingInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            return;
        } else if (mode === 'longtext') {
            this.initLongTextPractice();
            this.state.isActive = true;
            const input = document.getElementById('typingInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            return;
        } else {
            this.generateTargetText();
        }

        // 자소 시퀀스 생성 (한글 모드 - 단어 연습 제외)
        if (language === 'korean' && mode !== 'position') {
            const fullTarget = this.state.targetText.join(' ');
            this.state.jamoSequence = this.buildJamoSequence(fullTarget);
        }

        // UI 업데이트
        this.renderTargetText();
        this.updateStats();

        // 입력 필드 초기화 및 포커스
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
            input.focus();
        }

        this.state.isActive = true;

        // 첫 번째 키 하이라이트
        this.showNextJamoHighlight();
    },

    /**
     * 다음에 입력해야 할 자소를 하이라이트
     */
    showNextJamoHighlight() {
        const { mode, targetText, currentIndex, language, jamoSequence, completedJamoCount } = this.state;

        if (mode === 'position') {
            // 자리 연습: 단일 자소
            if (currentIndex < targetText.length) {
                Keyboard.showNextKey(targetText[currentIndex]);
            }
        } else if (language === 'korean') {
            // 한글 모드: completedJamoCount 기반으로 다음 자소 결정
            // (조합 중이 아닐 때 호출되므로, 완성된 자소 수가 다음 인덱스)
            if (completedJamoCount < jamoSequence.length) {
                const nextJamo = jamoSequence[completedJamoCount];
                if (nextJamo !== ' ') {
                    Keyboard.showNextKey(nextJamo);
                } else {
                    // 스페이스는 별도 표시 (키보드에서 스페이스바)
                    const spaceKey = document.querySelector('.virtual-keyboard .key.spacebar');
                    if (spaceKey) {
                        document.querySelectorAll('.virtual-keyboard .key.next').forEach(el => el.classList.remove('next'));
                        spaceKey.classList.add('next');
                    }
                }
            } else {
                Keyboard.clearAllHighlights();
            }
        } else {
            // 영어 모드: 글자 단위
            const fullTarget = targetText.join(' ');
            const targetChar = fullTarget[currentIndex];
            if (targetChar) {
                Keyboard.showNextKey(targetChar);
            }
        }
    },

    /**
     * 단어 연습 모드 초기화 (100단어, 20세트)
     */
    async initWordPractice() {
        // 단어 로드 (비동기)
        const { language, level } = this.state;
        const words = await this.loadWordData(language, level);

        // 100개 단어 선택
        const allWords = [];
        if (words && words.length > 0) {
            for (let i = 0; i < 100; i++) {
                const randomWord = words[Math.floor(Math.random() * words.length)];
                allWords.push(randomWord);
            }
        } else {
            allWords.push('데이터 로딩 실패');
        }

        this.state.wordPractice = {
            allWords: allWords,
            currentSet: 0,
            totalSets: 20,
            wordsPerSet: 5,
            currentWordIndex: 0,
            completedWords: 0,
            // 누적 통계
            cumulativeTotalChars: 0,
            cumulativeCorrectChars: 0
        };

        // 첫 번째 세트 로드
        this.loadCurrentSet();

        // 데이터 로드 후 화면 갱신 및 자소 기반 하이라이트 설정
        this.renderTargetText();

        // 한글인 경우 자소 시퀀스 생성 및 초기화
        if (language === 'korean') {
            const fullTarget = this.state.targetText.join(' ');
            this.state.jamoSequence = this.buildJamoSequence(fullTarget);
            this.state.completedJamoCount = 0;
        }

        this.showNextJamoHighlight();
    },

    /**
     * 현재 세트의 단어 로드
     */
    loadCurrentSet() {
        const wp = this.state.wordPractice;
        const startIndex = wp.currentSet * wp.wordsPerSet;
        const endIndex = startIndex + wp.wordsPerSet;

        this.state.targetText = wp.allWords.slice(startIndex, endIndex);
        this.state.currentIndex = 0;
        this.state.typedText = '';
    },

    /**
     * 입력 언어 감지 및 경고 표시
     */
    checkInputLanguage(char) {
        const { language } = this.state;
        const isKoreanChar = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char);
        const isEnglishChar = /[a-zA-Z]/.test(char);

        if (!isKoreanChar && !isEnglishChar) return;

        if (language === 'korean' && isEnglishChar) {
            this.showLanguageWarning('한/영 키를 눌러 한글로 변경해주세요!');
        } else if (language === 'english' && isKoreanChar) {
            this.showLanguageWarning('한/영 키를 눌러 영어로 변경해주세요!');
        } else {
            this.hideLanguageWarning();
        }
    },

    showLanguageWarning(msg) {
        const warning = document.getElementById('languageWarning');
        if (warning) {
            warning.textContent = msg;
            warning.classList.remove('hidden');
        }
    },

    hideLanguageWarning() {
        const warning = document.getElementById('languageWarning');
        if (warning) {
            warning.classList.add('hidden');
        }
    },

    /**
     * 단어 연습 데이터 로드 (JSON)
     */
    async loadWordData(language, level) {
        let key;

        // 레벨 매핑 (UI 레벨값 -> JSON 키)
        switch (level) {
            case 'home': key = 'home'; break;
            case 'home-top': key = 'upper'; break;
            case 'home-bottom': key = 'lower'; break;
            case 'coding': key = 'coding'; break;
            default: key = 'all'; break;
        }

        try {
            if (language === 'korean') {
                if (typeof KOREAN_WORDS !== 'undefined') return KOREAN_WORDS[key] || [];
            } else {
                if (typeof ENGLISH_WORDS !== 'undefined') return ENGLISH_WORDS[key] || [];
            }
            return [];
        } catch (e) {
            console.error('Word data loading error:', e);
            return ['연결', '오류', '발생'];
        }
    },

    /**
     * 문장/장문 데이터 로드 (JSON)
     */
    async loadPracticeData(type, language) {
        try {
            if (type === 'sentence') {
                if (typeof SENTENCES !== 'undefined') return SENTENCES[language] || [];
            } else if (type === 'longtext') {
                if (typeof LONG_TEXTS !== 'undefined') return LONG_TEXTS[language] || [];
            }
            return [];
        } catch (e) {
            console.error('Practice data loading error:', e);
            return [];
        }
    },

    /**
     * 문장 연습 초기화
     */
    async initSentencePractice() {
        const sentences = await this.loadPracticeData('sentence', this.state.language);
        this.state.loadedSentences = sentences;

        this.generateTargetText();
        // 데이터가 없으면 generateTargetText에서 '로딩실패' 텍스트를 설정했을 것임.

        this.renderTargetText();

        // 초기화
        this.state.typedText = '';
        this.state.currentIndex = 0;
        this.state.isActive = true;

        // 한글 자소 시퀀스 생성
        if (this.state.language === 'korean') {
            const fullTarget = this.state.targetText.join(' ');
            this.state.jamoSequence = this.buildJamoSequence(fullTarget);
            this.state.completedJamoCount = 0;
        }

        this.showNextJamoHighlight();

        // 입력 포커스 (비동기라 다시 한 번 확인)
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    },

    /**
     * 장문 연습 초기화
     */
    async initLongTextPractice() {
        const longTexts = await this.loadPracticeData('longtext', this.state.language);
        this.state.loadedLongTexts = longTexts;

        this.generateTargetText();
        this.renderTargetText();

        // 초기화
        this.state.typedText = '';
        this.state.currentIndex = 0;
        this.state.isActive = true;

        // 한글 자소 시퀀스 생성
        if (this.state.language === 'korean') {
            const fullTarget = this.state.targetText.join(' ');
            this.state.jamoSequence = this.buildJamoSequence(fullTarget);
            this.state.completedJamoCount = 0;
        }

        this.showNextJamoHighlight();

        // 입력 포커스
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    },

    /**
     * 목표 텍스트 생성 (단어 연습 제외)
     */
    generateTargetText() {
        const { mode, language, level } = this.state;
        let text = [];

        switch (mode) {
            case 'position':
                // 자리 연습: 개별 문자
                text = Keyboard.generatePositionPractice(level, 30, language);
                break;

            case 'sentence':
                // 문장 연습
                const sentences = this.state.loadedSentences || [];
                if (sentences.length > 0) {
                    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
                    text = [randomSentence];
                } else {
                    text = ['데이터를 불러오는 중입니다...'];
                }
                break;

            case 'longtext':
                // 장문 연습
                const longTexts = this.state.loadedLongTexts || [];
                if (longTexts.length > 0) {
                    const randomLongText = longTexts[Math.floor(Math.random() * longTexts.length)];
                    text = [randomLongText];
                } else {
                    text = ['데이터를 불러오는 중입니다...'];
                }
                break;
        }

        this.state.targetText = text;
    },

    /**
     * 배열 셔플
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * 목표 텍스트 렌더링
     */
    renderTargetText() {
        const container = document.getElementById('targetText');
        if (!container) return;

        container.innerHTML = '';

        const { mode, targetText, currentIndex } = this.state;

        if (mode === 'position') {
            // 자리 연습: 개별 문자 표시
            targetText.forEach((char, index) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;

                if (index === currentIndex) {
                    span.classList.add('current');
                } else if (index < currentIndex) {
                    span.classList.add('correct');
                }

                container.appendChild(span);
            });
        } else if (mode === 'word') {
            // 단어 연습: 세트 정보 표시
            const wp = this.state.wordPractice;

            // 세트 진행 정보 표시
            const setInfo = document.createElement('div');
            setInfo.className = 'set-info';
            setInfo.innerHTML = `<span class="set-badge">세트 ${wp.currentSet + 1}/${wp.totalSets}</span> <span class="word-count">(${wp.completedWords}/100 단어)</span>`;
            container.appendChild(setInfo);

            // 현재 세트의 단어들 표시
            const wordsContainer = document.createElement('div');
            wordsContainer.className = 'words-container';

            const fullText = targetText.join(' ');
            fullText.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char === ' ' ? '\u00A0' : char;

                if (index === currentIndex) {
                    span.classList.add('current');
                } else if (index < currentIndex) {
                    const typedChar = this.state.typedText[index];
                    if (typedChar === char) {
                        span.classList.add('correct');
                    } else {
                        span.classList.add('incorrect');
                    }
                }

                wordsContainer.appendChild(span);
            });

            container.appendChild(wordsContainer);
        } else {
            // 문장/장문: 전체 텍스트를 문자 단위로 표시
            const fullText = targetText.join(' ');

            fullText.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char === ' ' ? '\u00A0' : char;

                if (index === currentIndex) {
                    span.classList.add('current');
                } else if (index < currentIndex) {
                    const typedChar = this.state.typedText[index];
                    if (typedChar === char) {
                        span.classList.add('correct');
                    } else {
                        span.classList.add('incorrect');
                    }
                }

                container.appendChild(span);
            });
        }
    },

    /**
     * 입력 처리
     */
    handleInput(e) {
        if (!this.state.isActive) return;
        if (this.state.isComposing) return;

        const input = e.target;
        const inputValue = input.value;

        // 언어 감지 및 경고
        if (inputValue.length > 0) {
            this.checkInputLanguage(inputValue[inputValue.length - 1]);
        } else {
            this.hideLanguageWarning();
        }

        // 첫 입력 시 타이머 시작
        if (!this.state.timerStarted && inputValue.length > 0) {
            this.state.timerStarted = true;
            this.state.startTime = Date.now();
            this.startTimer();
        }

        const { mode, targetText, currentIndex } = this.state;

        if (mode === 'position') {
            // 자리 연습: 한 글자씩 확인
            if (inputValue.length > 0) {
                const typedChar = inputValue[inputValue.length - 1];
                const targetChar = targetText[currentIndex];

                this.state.totalChars++;

                if (typedChar === targetChar) {
                    this.state.correctChars++;
                    this.state.currentIndex++;

                    this.updateCharDisplay(currentIndex, 'correct');

                    if (this.state.currentIndex < targetText.length) {
                        Keyboard.showNextKey(targetText[this.state.currentIndex]);
                        this.updateCharDisplay(this.state.currentIndex, 'current');
                    } else {
                        this.complete();
                    }
                } else {
                    this.state.incorrectChars++;
                    this.flashError();
                }

                input.value = '';
                this.updateStats();
            }
        } else if (mode === 'word') {
            // 단어 연습: 세트 기반 처리

            // 세트 시작 직후 공백 입력 방지 (이전 세트 완료를 위한 스페이스키 무시)
            if (inputValue === ' ') {
                input.value = '';
                return;
            }

            const fullTarget = targetText.join(' ');
            this.state.typedText = inputValue;
            this.state.currentIndex = inputValue.length;

            // 한글 모드이고 조합 중이 아닐 때, 전체 자소 수 재계산 (백스페이스/스페이스/붙여넣기 대응)
            if (this.state.language === 'korean' && !this.state.isComposing) {
                this.state.completedJamoCount = this.countJamos(inputValue);
            }

            // 통계 계산
            this.state.totalChars = inputValue.length;
            this.state.correctChars = 0;

            for (let i = 0; i < inputValue.length; i++) {
                if (i < fullTarget.length && inputValue[i] === fullTarget[i]) {
                    this.state.correctChars++;
                }
            }
            this.state.incorrectChars = this.state.totalChars - this.state.correctChars;

            // UI 업데이트
            this.renderTargetText();
            this.updateStats();

            // 다음 키 하이라이트 (첫 자소만)
            if (this.state.currentIndex < fullTarget.length) {
                this.showNextJamoHighlight();
            }

            // 현재 세트 완료 체크
            if (inputValue.length >= fullTarget.length) {
                this.completeCurrentSet();
            }
        } else {
            // 문장/장문: 전체 텍스트 비교
            const fullTarget = targetText.join(' ');
            this.state.typedText = inputValue;
            this.state.currentIndex = inputValue.length;

            this.state.totalChars = inputValue.length;
            this.state.correctChars = 0;

            for (let i = 0; i < inputValue.length; i++) {
                if (i < fullTarget.length && inputValue[i] === fullTarget[i]) {
                    this.state.correctChars++;
                }
            }
            this.state.incorrectChars = this.state.totalChars - this.state.correctChars;

            this.renderTargetText();
            this.updateStats();

            if (this.state.currentIndex < fullTarget.length) {
                this.showNextJamoHighlight();
            }

            if (inputValue.length >= fullTarget.length) {
                this.complete();
            }
        }
    },

    /**
     * 현재 세트 완료 처리
     */
    completeCurrentSet() {
        const wp = this.state.wordPractice;

        // 현재 세트의 통계를 누적에 더하기
        wp.cumulativeTotalChars += this.state.totalChars;
        wp.cumulativeCorrectChars += this.state.correctChars;

        wp.completedWords += wp.wordsPerSet;
        wp.currentSet++;

        // 입력 필드 초기화 (스페이스 제거 - 이벤트 루프 후 다시 확인)
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
            // 이벤트 루프 후 다시 초기화 (스페이스 잔류 방지)
            setTimeout(() => {
                input.value = '';
                input.focus();
            }, 0);
        }
        this.state.typedText = '';
        this.state.currentIndex = 0;
        // 현재 세트 통계 초기화 (누적은 유지)
        this.state.totalChars = 0;
        this.state.correctChars = 0;
        this.state.incorrectChars = 0;

        // 모든 세트 완료?
        if (wp.currentSet >= wp.totalSets) {
            this.complete();
        } else {
            // 다음 세트 로드
            this.loadCurrentSet();

            // 자소 시퀀스 재생성 및 카운터 초기화
            if (this.state.language === 'korean') {
                const fullTarget = this.state.targetText.join(' ');
                this.state.jamoSequence = this.buildJamoSequence(fullTarget);
                this.state.completedJamoCount = 0;
            }

            this.renderTargetText();

            // 다음 키 하이라이트 (첫 자소만)
            this.showNextJamoHighlight();
        }
    },

    /**
     * 문자 표시 업데이트
     */
    updateCharDisplay(index, status) {
        const chars = document.querySelectorAll('#targetText .char');
        if (chars[index]) {
            chars[index].className = 'char ' + status;
        }
    },

    /**
     * 오류 표시 (화면 깜빡임)
     */
    flashError() {
        const typingArea = document.querySelector('.typing-area');
        if (typingArea) {
            typingArea.classList.add('error-flash');
            setTimeout(() => {
                typingArea.classList.remove('error-flash');
            }, 200);
        }
    },

    /**
     * 타이머 시작
     */
    startTimer() {
        this.state.timerInterval = setInterval(() => {
            this.state.elapsedTime = Math.floor((Date.now() - this.state.startTime) / 1000);
            this.updateTimeDisplay();
        }, 1000);
    },

    /**
     * 타이머 정지
     */
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    },

    /**
     * 시간 표시 업데이트
     */
    updateTimeDisplay() {
        const timeEl = document.getElementById('timeElapsed');
        if (timeEl) {
            const minutes = Math.floor(this.state.elapsedTime / 60);
            const seconds = this.state.elapsedTime % 60;
            timeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    },

    /**
     * 통계 업데이트
     */
    updateStats() {
        const { totalChars, correctChars, elapsedTime, targetText, currentIndex, mode } = this.state;

        // 타수 계산 (분당 타수)
        const minutes = elapsedTime / 60;
        const speed = minutes > 0 ? Math.round(correctChars / minutes) : 0;

        // 정확도 계산
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

        // 진행률 계산
        let total, current;
        if (mode === 'position') {
            total = targetText.length;
            current = currentIndex;
        } else if (mode === 'word') {
            const wp = this.state.wordPractice;
            total = 100; // 총 100단어
            current = wp.completedWords + Math.floor(currentIndex / (targetText.join(' ').length / wp.wordsPerSet));
        } else {
            total = targetText.join(' ').length;
            current = currentIndex;
        }

        // UI 업데이트
        const speedEl = document.getElementById('typingSpeed');
        const accuracyEl = document.getElementById('accuracy');
        const progressEl = document.getElementById('progress');

        if (speedEl) speedEl.textContent = speed;
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';
        if (progressEl) {
            if (mode === 'word') {
                const wp = this.state.wordPractice;
                progressEl.textContent = `${wp.completedWords}/100`;
            } else {
                progressEl.textContent = `${current}/${total}`;
            }
        }
    },

    /**
     * 연습 완료
     */
    complete() {
        this.stopTimer();
        this.state.isActive = false;

        Keyboard.clearAllHighlights();

        // 최종 통계 계산
        const { elapsedTime, mode, language, level } = this.state;

        // 단어 연습 모드는 누적 통계 사용
        let totalChars, correctChars;
        if (mode === 'word') {
            const wp = this.state.wordPractice;
            // 마지막 세트 통계도 누적에 추가
            totalChars = wp.cumulativeTotalChars + this.state.totalChars;
            correctChars = wp.cumulativeCorrectChars + this.state.correctChars;
        } else {
            totalChars = this.state.totalChars;
            correctChars = this.state.correctChars;
        }

        const minutes = elapsedTime / 60;
        const speed = minutes > 0 ? Math.round(correctChars / minutes) : 0;
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

        // 결과 저장
        // 결과 저장 (비동기)
        Storage.addRecord({
            mode,
            language,
            level,
            duration: elapsedTime,
            typedChars: totalChars,
            correctChars,
            speed,
            accuracy
        }).then(result => {
            console.log('Record saved:', result);
        }).catch(err => {
            console.error('Failed to save record:', err);
        });

        // 결과 모달 표시
        this.showResult(elapsedTime, speed, accuracy);
    },

    /**
     * 결과 모달 표시
     */
    showResult(time, speed, accuracy) {
        const modal = document.getElementById('resultModal');
        if (!modal) return;

        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        document.getElementById('resultTime').textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('resultSpeed').textContent = `${speed} 타/분`;
        document.getElementById('resultAccuracy').textContent = `${accuracy}%`;

        modal.classList.remove('hidden');
    },

    /**
     * 결과 모달 숨기기
     */
    hideResult() {
        const modal = document.getElementById('resultModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    /**
     * 연습 중지
     */
    stop() {
        this.stopTimer();
        this.state.isActive = false;
        Keyboard.clearAllHighlights();

        // 입력 필드 초기화
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
        }
    },

    /**
     * 다시 하기
     */
    retry() {
        this.hideResult();
        this.start(this.state.mode, this.state.language, this.state.level);
    }
};

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    Practice.init();
});
