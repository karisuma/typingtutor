/**
 * 타자 연습 프로그램 - Google Apps Script API
 * Google Sheets를 데이터베이스로 활용
 * 
 * 사용법:
 * 1. Google Sheets 생성 후 시트 이름을 'users', 'records'로 설정
 * 2. 이 스크립트를 Google Apps Script에 복사
 * 3. 웹 앱으로 배포 (액세스: 모든 사용자)
 * 4. 발급된 URL을 프론트엔드에서 사용
 */

// ========================================
// 설정
// ========================================

/**
 * 스프레드시트 ID 설정
 * Google Sheets URL에서 확인: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
 */
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// 시트 이름
const SHEETS = {
  USERS: 'users',
  RECORDS: 'records'
};

// ========================================
// 웹 앱 엔드포인트
// ========================================

/**
 * GET 요청 처리
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * POST 요청 처리
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * 요청 라우팅
 */
function handleRequest(e) {
  const params = e.parameter;
  const action = params.action;
  
  let result;
  
  try {
    switch (action) {
      // 사용자 관련
      case 'getUsers':
        result = getUsers();
        break;
      case 'getUserByEmail':
        result = getUserByEmail(params.email);
        break;
      case 'createUser':
        result = createUser(JSON.parse(params.data));
        break;
      case 'updateUser':
        result = updateUser(params.id, JSON.parse(params.data));
        break;
      case 'deleteUser':
        result = deleteUser(params.id);
        break;
      case 'login':
        result = login(params.email, params.password);
        break;
        
      // 연습 기록 관련
      case 'getRecords':
        result = getRecords();
        break;
      case 'getRecordsByUser':
        result = getRecordsByUser(params.userId);
        break;
      case 'addRecord':
        result = addRecord(JSON.parse(params.data));
        break;
        
      // 초기화
      case 'init':
        result = initializeSheets();
        break;
        
      default:
        result = { success: false, message: 'Unknown action: ' + action };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// 스프레드시트 초기화
// ========================================

/**
 * 스프레드시트 초기화 - 헤더 행 생성
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // users 시트
  let usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(SHEETS.USERS);
  }
  
  // users 헤더
  const usersHeaders = ['id', 'name', 'email', 'password', 'role', 'createdAt', 'updatedAt'];
  usersSheet.getRange(1, 1, 1, usersHeaders.length).setValues([usersHeaders]);
  
  // 기본 관리자 계정 생성
  const adminExists = findRowByColumn(usersSheet, 3, 'admin@typingtutor.com');
  if (!adminExists) {
    const adminData = [
      'admin_001',
      '관리자',
      'admin@typingtutor.com',
      'admin123',
      'admin',
      new Date().toISOString(),
      ''
    ];
    usersSheet.appendRow(adminData);
  }
  
  // records 시트
  let recordsSheet = ss.getSheetByName(SHEETS.RECORDS);
  if (!recordsSheet) {
    recordsSheet = ss.insertSheet(SHEETS.RECORDS);
  }
  
  // records 헤더
  const recordsHeaders = ['id', 'userId', 'userName', 'mode', 'language', 'level', 'duration', 'typedChars', 'correctChars', 'speed', 'accuracy', 'createdAt'];
  recordsSheet.getRange(1, 1, 1, recordsHeaders.length).setValues([recordsHeaders]);
  
  return { success: true, message: 'Sheets initialized successfully' };
}

// ========================================
// 사용자 관리
// ========================================

/**
 * 모든 사용자 조회
 */
function getUsers() {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return { success: true, users: [] };
  }
  
  const headers = data[0];
  const users = data.slice(1).map(row => {
    const user = {};
    headers.forEach((header, index) => {
      if (header !== 'password') {  // 비밀번호 제외
        user[header] = row[index];
      }
    });
    return user;
  });
  
  return { success: true, users };
}

/**
 * 이메일로 사용자 조회
 */
function getUserByEmail(email) {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIndex] === email) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = data[i][index];
      });
      return { success: true, user };
    }
  }
  
  return { success: false, message: 'User not found' };
}

/**
 * 사용자 생성
 */
function createUser(userData) {
  const sheet = getSheet(SHEETS.USERS);
  
  // 이메일 중복 확인
  const existing = getUserByEmail(userData.email);
  if (existing.success) {
    return { success: false, message: '이미 사용 중인 이메일입니다.' };
  }
  
  const newUser = [
    'user_' + Date.now(),
    userData.name,
    userData.email,
    userData.password,
    userData.role || 'student',
    new Date().toISOString(),
    ''
  ];
  
  sheet.appendRow(newUser);
  
  return { 
    success: true, 
    user: {
      id: newUser[0],
      name: newUser[1],
      email: newUser[2],
      role: newUser[4],
      createdAt: newUser[5]
    }
  };
}

/**
 * 사용자 정보 수정
 */
function updateUser(userId, updates) {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === userId) {
      // 업데이트할 필드 적용
      headers.forEach((header, index) => {
        if (updates[header] !== undefined) {
          data[i][index] = updates[header];
        }
      });
      
      // updatedAt 갱신
      const updatedAtIndex = headers.indexOf('updatedAt');
      data[i][updatedAtIndex] = new Date().toISOString();
      
      // 시트에 다시 쓰기
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      
      return { success: true, message: 'User updated' };
    }
  }
  
  return { success: false, message: 'User not found' };
}

/**
 * 사용자 삭제
 */
function deleteUser(userId) {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === userId) {
      sheet.deleteRow(i + 1);
      
      // 해당 사용자의 연습 기록도 삭제
      deleteRecordsByUser(userId);
      
      return { success: true, message: 'User deleted' };
    }
  }
  
  return { success: false, message: 'User not found' };
}

/**
 * 로그인
 */
function login(email, password) {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');
  const passwordIndex = headers.indexOf('password');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIndex] === email) {
      if (data[i][passwordIndex] === password) {
        const user = {};
        headers.forEach((header, index) => {
          if (header !== 'password') {
            user[header] = data[i][index];
          }
        });
        return { success: true, user };
      } else {
        return { success: false, message: '비밀번호가 일치하지 않습니다.' };
      }
    }
  }
  
  return { success: false, message: '사용자를 찾을 수 없습니다.' };
}

// ========================================
// 연습 기록 관리
// ========================================

/**
 * 모든 연습 기록 조회
 */
function getRecords() {
  const sheet = getSheet(SHEETS.RECORDS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return { success: true, records: [] };
  }
  
  const headers = data[0];
  const records = data.slice(1).map(row => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  });
  
  return { success: true, records };
}

/**
 * 사용자별 연습 기록 조회
 */
function getRecordsByUser(userId) {
  const sheet = getSheet(SHEETS.RECORDS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIndex = headers.indexOf('userId');
  
  const records = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdIndex] === userId) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index];
      });
      records.push(record);
    }
  }
  
  return { success: true, records };
}

/**
 * 연습 기록 추가
 */
function addRecord(recordData) {
  const sheet = getSheet(SHEETS.RECORDS);
  
  const newRecord = [
    'record_' + Date.now(),
    recordData.userId || 'guest',
    recordData.userName || '게스트',
    recordData.mode,
    recordData.language,
    recordData.level,
    recordData.duration,
    recordData.typedChars,
    recordData.correctChars,
    recordData.speed,
    recordData.accuracy,
    new Date().toISOString()
  ];
  
  sheet.appendRow(newRecord);
  
  return { 
    success: true, 
    record: {
      id: newRecord[0],
      userId: newRecord[1],
      userName: newRecord[2],
      mode: newRecord[3],
      language: newRecord[4],
      level: newRecord[5],
      duration: newRecord[6],
      typedChars: newRecord[7],
      correctChars: newRecord[8],
      speed: newRecord[9],
      accuracy: newRecord[10],
      createdAt: newRecord[11]
    }
  };
}

/**
 * 사용자의 모든 연습 기록 삭제
 */
function deleteRecordsByUser(userId) {
  const sheet = getSheet(SHEETS.RECORDS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIndex = headers.indexOf('userId');
  
  // 역순으로 삭제 (인덱스 유지)
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][userIdIndex] === userId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 시트 가져오기
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  
  return sheet;
}

/**
 * 특정 컬럼에서 값으로 행 찾기
 */
function findRowByColumn(sheet, columnIndex, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex - 1] === value) {
      return i + 1;
    }
  }
  return null;
}
