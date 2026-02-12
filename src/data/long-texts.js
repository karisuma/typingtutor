const LONG_TEXTS = {
    "korean": [
        // 문학 작품
        "별 헤는 밤\n\n계절이 지나가는 하늘에는\n가을로 가득 차 있습니다.\n나는 아무 걱정도 없이\n가을 속의 별들을 다 헤일 듯합니다.\n\n가슴 속에 하나 둘 새겨지는 별을\n이제 다 못 헤는 것은\n쉬이 아침이 오는 까닭이요,\n내일 밤이 남은 까닭이요,\n아직 나의 청춘이 다하지 않은 까닭입니다.",
        "소나기\n\n소년은 개울가에서 소녀를 보자 곧 윤 초시네 증손녀딸이라는 걸 알 수 있었다.\n소녀는 개울에 다리를 뻗고 앉아 있었다.\n비단 조개 같은 하얀 발을 물에 담그고 있다가 소리를 내며 발을 구르기도 했다.\n소년은 소녀가 징검다리 한가운데 앉아 있는 것을 보고 비켜달라는 말도 못 하고 둑에 앉아 기다렸다.",
        "진달래꽃\n\n나 보기가 역겨워\n가실 때에는\n말없이 고이 보내 드리오리다.\n영변에 약산\n진달래꽃\n아름 따다 가실 길에 뿌리오리다.\n가시는 걸음 걸음\n놓인 그 꽃을\n사뿐히 즈려밞고 가시옵소서.",
        "애국가\n\n동해물과 백두산이 마르고 닳도록\n하느님이 보우하사 우리나라 만세\n무궁화 삼천리 화려 강산\n대한 사람 대한으로 길이 보전하세\n남산 위에 저 소나무 철갑을 두른 듯\n바람 서리 불변함은 우리 기상일세",

        // 영화 대사 (긴 버전)
        "국제시장 - 아버지의 약속\n\n\"아버지, 약속 지켜서 이만큼 왔는데... 내 이만큼 살아온 거, 참 힘들었거든...\n근데 이거 내가 잘 살아온 거 맞나? 아버지... 야, 덕수야! 고생했다.\"\n\n우리 세대의 아버지들이 감내해야 했던 고통과 희생.\n가족을 위해 모든 것을 내려놓았던 그 시대의 기록.",
        "변호인 - 국가란 무엇인가\n\n\"국가란 뭡니까! 국가가 도대체 뭡니까!\n헌법 제1조 2항, 대한민국의 주권은 국민에게 있고, 모든 권력은 국민으로부터 나온다.\n국가란, 국민입니다.\"\n\n민주주의의 본질과 시민의 권리에 대한 깊은 성찰.",

        // 명언 모음
        "스티브 잡스 명언 모음\n\n\"Stay hungry, stay foolish. 항상 갈망하고, 우직하게 나아가라.\"\n\n\"삶에서 가장 중요한 것은 당신이 사랑하는 일을 찾는 것입니다.\n그리고 그것을 찾지 못했다면, 계속 찾으세요. 안주하지 마세요.\"\n\n\"혁신은 리더와 추종자를 구분 짓습니다.\n오늘이 인생의 마지막 날이라면, 지금 하려는 일을 할 것인가?\"",
        "마틴 루터 킹 - 나에게는 꿈이 있습니다\n\n\"나에게는 꿈이 있습니다.\n언젠가 이 나라가 일어나 그 신조의 진정한 의미를 실현하는 날이 오리라는 꿈입니다.\n모든 인간은 평등하게 태어났다는 진리를 자명한 것으로 받아들이는 그날이 오리라는 꿈입니다.\"",

        // 자바스크립트 기초 설명
        "자바스크립트 변수와 상수\n\n자바스크립트에서 데이터를 저장하려면 변수나 상수를 선언해야 합니다.\nlet 키워드는 값을 변경할 수 있는 변수를 선언할 때 사용합니다.\nconst 키워드는 값을 변경할 수 없는 상수를 선언할 때 사용합니다.\nvar 키워드는 오래된 방식이며, 현대 자바스크립트에서는 let과 const를 권장합니다.\n\n예시:\nlet age = 25;\nconst name = 'John';\nage = 26; // 가능\nname = 'Jane'; // 오류 발생",
        "자바스크립트 함수의 이해\n\n함수는 특정 작업을 수행하는 코드 블록입니다.\n함수를 정의하면 필요할 때마다 재사용할 수 있습니다.\n\n함수 선언 방식:\nfunction sayHello(name) {\n    return 'Hello, ' + name;\n}\n\n화살표 함수 방식:\nconst sayHello = (name) => {\n    return 'Hello, ' + name;\n};\n\n짧은 화살표 함수:\nconst sayHello = name => 'Hello, ' + name;",
        "자바스크립트 조건문과 반복문\n\n조건문은 특정 조건에 따라 다른 코드를 실행합니다.\nif (score >= 90) {\n    console.log('A학점');\n} else if (score >= 80) {\n    console.log('B학점');\n} else {\n    console.log('노력 필요');\n}\n\n반복문은 코드를 여러 번 실행합니다.\nfor (let i = 0; i < 5; i++) {\n    console.log(i);\n}\n\nwhile (condition) {\n    // 조건이 참인 동안 실행\n}"
    ],
    "english": [
        // Literature
        "The Road Not Taken\n\nTwo roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\nTo where it bent in the undergrowth;",
        "I Have a Dream\n\nI have a dream that one day this nation will rise up and live out the true meaning of its creed: 'We hold these truths to be self-evident, that all men are created equal.'\nI have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood.",
        "Little Prince\n\nIt is only with the heart that one can see rightly; what is essential is invisible to the eye.\nThe men where you live grow five thousand roses in the same garden... and they do not find in it what they are looking for.\nAnd yet what they are looking for could be found in one single rose, or in a little water.",
        "Steve Jobs Stanford Speech\n\nYour time is limited, so don't waste it living someone else's life.\nDon't be trapped by dogma - which is living with the results of other people's thinking.\nDon't let the noise of others' opinions drown out your own inner voice.\nAnd most important, have the courage to follow your heart and intuition.",

        // Movie quotes (long versions)
        "The Shawshank Redemption\n\n\"Hope is a good thing, maybe the best of things, and no good thing ever dies.\nI find I'm so excited, I can barely sit still or hold a thought in my head.\nI think it's the excitement only a free man can feel, a free man at the start of a long journey whose conclusion is uncertain.\nI hope I can make it across the border.\nI hope to see my friend and shake his hand.\nI hope the Pacific is as blue as it has been in my dreams.\nI hope.\"",
        "Dead Poets Society\n\n\"We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race.\nAnd the human race is filled with passion.\nMedicine, law, business, engineering, these are noble pursuits and necessary to sustain life.\nBut poetry, beauty, romance, love, these are what we stay alive for.\nCarpe diem. Seize the day, boys. Make your lives extraordinary.\"",
        "The Pursuit of Happyness\n\n\"Don't ever let somebody tell you that you can't do something. Not even me.\nYou got a dream, you gotta protect it.\nPeople can't do something themselves, they wanna tell you that you can't do it.\nYou want something? Go get it. Period.\"",
        "Forrest Gump\n\n\"My mama always said, 'Life was like a box of chocolates. You never know what you're gonna get.'\nStupid is as stupid does.\nMama says they was magic shoes. They could take me anywhere.\nI don't know if we each have a destiny, or if we're all just floating around accidental-like on a breeze.\nBut I think maybe it's both. Maybe both is happening at the same time.\"",
        "The Dark Knight\n\n\"Because he's the hero Gotham deserves, but not the one it needs right now.\nSo we'll hunt him. Because he can take it.\nBecause he's not our hero. He's a silent guardian, a watchful protector. A dark knight.\"\n\n\"You either die a hero, or you live long enough to see yourself become the villain.\"",

        // Famous quotes collection
        "Winston Churchill Quotes\n\n\"Success is not final, failure is not fatal: it is the courage to continue that counts.\"\n\n\"We make a living by what we get, but we make a life by what we give.\"\n\n\"The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.\"\n\n\"Never, never, never give up.\"",
        "Albert Einstein Quotes\n\n\"Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.\"\n\n\"In the middle of difficulty lies opportunity.\"\n\n\"Life is like riding a bicycle. To keep your balance, you must keep moving.\"\n\n\"The only source of knowledge is experience.\"",

        // JavaScript explanations
        "JavaScript Variables and Constants\n\nIn JavaScript, you store data using variables and constants.\nThe let keyword declares a variable that can be reassigned.\nThe const keyword declares a constant that cannot be changed.\nThe var keyword is an older way and modern JavaScript prefers let and const.\n\nExamples:\nlet age = 25;\nconst name = 'John';\nage = 26; // OK\nname = 'Jane'; // Error",
        "JavaScript Functions Explained\n\nFunctions are reusable blocks of code that perform specific tasks.\nYou can define a function once and call it multiple times.\n\nFunction declaration:\nfunction greet(name) {\n    return 'Hello, ' + name;\n}\n\nArrow function:\nconst greet = (name) => {\n    return 'Hello, ' + name;\n};\n\nShort arrow function:\nconst greet = name => 'Hello, ' + name;",
        "JavaScript Arrays and Objects\n\nArrays store ordered lists of values.\nconst fruits = ['apple', 'banana', 'orange'];\nfruits[0] // 'apple'\nfruits.push('grape'); // Add item\nfruits.length // 4\n\nObjects store key-value pairs.\nconst person = {\n    name: 'John',\n    age: 30,\n    greet: function() {\n        return 'Hello!';\n    }\n};\nperson.name // 'John'\nperson.age // 30",
        "JavaScript DOM Manipulation\n\nThe DOM (Document Object Model) allows JavaScript to interact with HTML.\n\nSelecting elements:\ndocument.getElementById('myId');\ndocument.querySelector('.myClass');\ndocument.querySelectorAll('p');\n\nModifying elements:\nelement.textContent = 'New text';\nelement.innerHTML = '<strong>Bold</strong>';\nelement.style.color = 'red';\n\nAdding event listeners:\nelement.addEventListener('click', function() {\n    console.log('Clicked!');\n});"
    ]
};
