# Google Sheets 데이터베이스 설정 가이드

이 문서는 타자 연습 프로그램을 Google Sheets와 연동하기 위한 설정 방법을 안내합니다.

## 1단계: Google Sheets 생성

1. [Google Sheets](https://sheets.google.com)에 접속
2. **새 스프레드시트** 생성
3. 스프레드시트 이름을 `타자연습_DB`로 변경
4. **중요**: URL에서 스프레드시트 ID를 복사
   - URL 형식: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - `{SPREADSHEET_ID}` 부분을 복사해 둡니다

## 2단계: Google Apps Script 생성

1. [Google Apps Script](https://script.google.com)에 접속
2. **새 프로젝트** 클릭
3. 프로젝트 이름을 `타자연습_API`로 변경
4. `script/api.gs` 파일의 전체 내용을 복사하여 붙여넣기
5. **중요**: 상단의 `SPREADSHEET_ID` 값을 1단계에서 복사한 ID로 교체
   ```javascript
   const SPREADSHEET_ID = '여기에_스프레드시트_ID_붙여넣기';
   ```
6. **저장** (Ctrl+S)

## 3단계: 스프레드시트 초기화

1. Apps Script 편집기에서 함수 선택 드롭다운 클릭
2. `initializeSheets` 선택
3. **실행** 버튼 클릭
4. 권한 승인 요청이 나타나면 **권한 검토** → 계정 선택 → **허용**
5. Google Sheets를 열어 `users`, `records` 시트가 생성되었는지 확인

## 4단계: 웹 앱으로 배포

1. Apps Script 편집기에서 **배포** → **새 배포**
2. 유형 선택: **웹 앱**
3. 설정:
   - 설명: `타자연습 API v1`
   - 실행 사용자: **나**
   - 액세스 권한: **모든 사용자**
4. **배포** 클릭
5. **웹 앱 URL**을 복사 (중요!)
   - 형식: `https://script.google.com/macros/s/AKfyc.../exec`

## 5단계: 프론트엔드 설정

1. `src/js/api-config.js` 파일 열기
2. `API_URL` 값을 4단계에서 복사한 URL로 교체
   ```javascript
   const API_URL = '여기에_웹앱_URL_붙여넣기';
   ```

## 6단계: 테스트

브라우저에서 다음 URL로 테스트:
```
{웹앱URL}?action=getUsers
```

정상 응답 예시:
```json
{
  "success": true,
  "users": [
    {
      "id": "admin_001",
      "name": "관리자",
      "email": "karisuma@gmail.com",
      "role": "admin"
    }
  ]
}
```

---

## API 엔드포인트 목록

### 사용자 관리

| 액션 | 파라미터 | 설명 |
|------|---------|------|
| `getUsers` | - | 모든 사용자 조회 |
| `getUserByEmail` | `email` | 이메일로 사용자 조회 |
| `createUser` | `data` (JSON) | 사용자 생성 |
| `updateUser` | `id`, `data` (JSON) | 사용자 정보 수정 |
| `deleteUser` | `id` | 사용자 삭제 |
| `login` | `email`, `password` | 로그인 |

### 연습 기록

| 액션 | 파라미터 | 설명 |
|------|---------|------|
| `getRecords` | - | 모든 연습 기록 조회 |
| `getRecordsByUser` | `userId` | 사용자별 기록 조회 |
| `addRecord` | `data` (JSON) | 연습 기록 추가 |

### 초기화

| 액션 | 파라미터 | 설명 |
|------|---------|------|
| `init` | - | 스프레드시트 초기화 |

---

## 문제 해결

### "권한이 거부되었습니다" 오류
- Apps Script에서 **배포** → **배포 관리** → **편집** → 액세스 권한이 "모든 사용자"인지 확인

### CORS 오류
- Google Apps Script는 자동으로 CORS를 처리합니다. 프론트엔드에서 `mode: 'no-cors'` 사용 불필요

### 데이터가 저장되지 않음
- 스프레드시트 ID가 올바른지 확인
- Apps Script 실행 로그 확인 (보기 → 로그)
