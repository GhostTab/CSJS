# CSJS Learn — System Flowcharts & Data Flow Diagrams (Revised)

**System:** Colegio de San Juan Samar Multimedia Animation Learning Platform  
**Document version:** 2.0 (revised after Supabase auth, rankings, and Teacher Admin)  
**Stack:** React (Vite) · Supabase Auth · PostgreSQL · Supabase Storage · JSON lessons · localStorage  

---

## 1. System overview flowchart

```mermaid
flowchart TD
  start([Start]) --> openApp[Open CSJS Learn]
  openApp --> home[Home]
  home --> authChoice{Account?}

  authChoice -->|Register| register[Email and password signup]
  register --> authSvc[Supabase Auth]
  authSvc --> profile[profiles row role student]
  profile --> appHome[Dashboard or Home]

  authChoice -->|Login| login[Email and password login]
  login --> authSvc2[Supabase Auth session]
  authSvc2 --> loadRole[Load profiles.role]
  loadRole --> roleGate{role equals teacher?}
  roleGate -->|Yes| teacherNav[Show Teacher Admin nav]
  roleGate -->|No| studentNav[Student navigation]
  teacherNav --> appHome
  studentNav --> appHome

  authChoice -->|Guest| guest[Browse without account]
  guest --> choosePath
  appHome --> choosePath{Select feature}

  choosePath --> lessons[Grade Subject Lesson]
  choosePath --> practice[Practice Quizzes]
  choosePath --> rankings[Student Rankings]
  choosePath --> dash[Personal Dashboard]
  choosePath --> teacherAdmin[Teacher Admin]

  lessons --> learn[Sections Activity Lesson Quiz]
  learn --> localProg[Save progress localStorage]
  learn --> quizSync{Logged in?}
  quizSync -->|Yes| attempts[Upsert quiz_attempts points]
  quizSync -->|No| loginHint[Prompt login for rankings]
  attempts --> rankings

  practice --> noRank[No ranking points]
  noRank --> choosePath

  teacherAdmin --> teacherGate{Is teacher?}
  teacherGate -->|No| denied[Access denied]
  teacherGate -->|Yes| manageVideos[Add link or upload local video]
  manageVideos --> storage[(Supabase Storage lesson-videos)]
  manageVideos --> extras[(lesson_extra_videos)]
  storage --> extras
  extras --> learn

  rankings --> endNode([Continue or Exit])
  dash --> endNode
  denied --> endNode
```

---

## 2. Authentication & role flowchart

```mermaid
flowchart TD
  start([Auth]) --> choice{Login or Register?}

  choice -->|Register| signUp[signUp email password]
  signUp --> ok1{Success?}
  ok1 -->|No| err1[Show error]
  err1 --> choice
  ok1 -->|Yes| trigger[DB trigger creates profiles]
  trigger --> studentRole[role equals student by default]
  studentRole --> session1[AuthContext session]

  choice -->|Login| signIn[signInWithPassword]
  signIn --> ok2{Success?}
  ok2 -->|No| err2[Show error]
  err2 --> choice
  ok2 -->|Yes| session2[AuthContext session]
  session2 --> fetchProfile[SELECT profiles]
  fetchProfile --> isTeacher{role equals teacher?}
  isTeacher -->|Yes| teacherUI[Teacher menu and /teacher]
  isTeacher -->|No| studentUI[Student menus only]

  session1 --> fetchProfile

  note[Promote teacher only via SQL Editor update profiles set role]
  note -.-> fetchProfile
```

---

## 3. Lesson learning, media & ranking flowchart

```mermaid
flowchart TD
  start([Open lesson]) --> json[Load lesson JSON]
  json --> merge[Merge local media overrides]
  merge --> extras[Fetch lesson_extra_videos]
  extras --> sections[Study sections]
  sections --> hub[Media Learning Hub]

  hub --> mediaType{Video sources}
  mediaType -->|Curriculum JSON video if approved| primary[Embed YouTube or Vimeo]
  mediaType -->|Teacher link| linkVid[Embed YouTube or Vimeo]
  mediaType -->|Teacher upload| fileVid[HTML5 video from Storage URL]

  primary --> activity[Interactive activity]
  linkVid --> activity
  fileVid --> activity

  activity --> quizKind{Quiz type}

  quizKind -->|Lesson quiz| lessonQuiz[Score answers]
  lessonQuiz --> localSave[ProgressContext localStorage]
  localSave --> pts[points equals score times 5]
  pts --> authed{Authenticated?}
  authed -->|Yes| upsert[Upsert quiz_attempts]
  authed -->|No| guestMsg[Login to appear on rankings]
  upsert --> board[Rankings SUM points]

  quizKind -->|Practice quiz| practice[Local score only]
  practice --> skip[Do not write quiz_attempts]
```

---

## 4. Teacher Admin — add / remove videos flowchart

```mermaid
flowchart TD
  start([Open /teacher]) --> check{Authenticated and role teacher?}
  check -->|No| block[Redirect or access denied]
  check -->|Yes| list[List all lessons with filters]
  list --> expand[Expand one lesson]

  expand --> showStatic[Show curriculum video read-only]
  showStatic --> choice{Add how?}

  choice -->|Paste URL| validateLink[Validate YouTube or Vimeo]
  validateLink --> insertLink[INSERT lesson_extra_videos source_type link]

  choice -->|Upload from laptop| sizeCheck{File size under Free plan limit 50MB?}
  sizeCheck -->|No| sizeErr[Show size error]
  sizeCheck -->|Yes| upload[Upload to Storage bucket lesson-videos]
  upload --> okUp{Upload OK?}
  okUp -->|No| upErr[Show Storage error]
  okUp -->|Yes| insertFile[INSERT lesson_extra_videos url storage_path source_type upload]

  insertLink --> students[Students see video in hub]
  insertFile --> students

  expand --> remove{Remove teacher video?}
  remove -->|Yes| delRow[DELETE lesson_extra_videos]
  delRow --> delFile{Has storage_path?}
  delFile -->|Yes| delObj[Delete Storage object]
  delFile -->|No| done([Done])
  delObj --> done
  students --> done
```

---

## 5. Ranking aggregation flowchart

```mermaid
flowchart TD
  start([Open /rankings]) --> auth{Logged in?}
  auth -->|No| gate[Prompt to log in]
  auth -->|Yes| fetch[SELECT quiz_attempts with profiles]
  fetch --> group[Group by user_id]
  group --> sum[SUM points]
  sum --> count[Count quizzes]
  count --> sort[Sort points descending]
  sort --> rank[Assign rank]
  rank --> table[Render leaderboard]
```

---

## 6. DFD — Level 0 (Context)

```mermaid
flowchart LR
  student[Student]
  teacher[Teacher]
  system((0 CSJS Learn System))
  supabase[(Supabase Auth DB Storage)]
  youtube[YouTube or Vimeo]

  student -->|Register login quiz answers| system
  system -->|Lessons progress rankings media| student

  teacher -->|Login manage lesson videos| system
  system -->|Teacher Admin UI| teacher

  system -->|Auth profiles attempts extras files| supabase
  supabase -->|Session data public video URLs| system

  system -->|Embed request| youtube
  youtube -->|Stream| student
```

| External entity | Role |
|-----------------|------|
| **Student** | Learns, takes lesson quizzes, views rankings |
| **Teacher** | Manages additional lesson videos (link or upload) |
| **Supabase** | Auth, `profiles`, `quiz_attempts`, `lesson_extra_videos`, Storage |
| **YouTube / Vimeo** | External streaming for link-based videos |

---

## 7. DFD — Level 1 (Major processes)

```mermaid
flowchart TB
  student[Student]
  teacher[Teacher]
  supabaseAuth[(Supabase Auth)]
  db[(PostgreSQL profiles attempts extras)]
  store[(Storage lesson-videos)]
  json[(Lesson JSON files)]
  local[(Browser localStorage)]
  cdn[YouTube or Vimeo]

  p1((1.0 Authenticate and Authorize))
  p2((2.0 Deliver Lessons))
  p3((3.0 Assess and Score))
  p4((4.0 Rank Students))
  p5((5.0 Manage Extra Videos))

  student -->|credentials| p1
  teacher -->|credentials| p1
  p1 -->|session| supabaseAuth
  supabaseAuth -->|user session| p1
  p1 -->|role student or teacher| student
  p1 -->|role teacher| teacher

  student -->|select lesson| p2
  json -->|lesson content| p2
  db -->|extra video metadata| p2
  store -->|uploaded file URL| p2
  local -->|progress overrides| p2
  p2 -->|sections hub activity| student
  p2 -->|embed URL| cdn
  cdn -->|video| student

  student -->|quiz answers| p3
  p3 -->|scores| local
  p3 -->|quiz_attempts| db
  p3 -->|feedback| student

  student -->|view rankings| p4
  db -->|attempts profiles| p4
  p4 -->|leaderboard| student

  teacher -->|URL or video file| p5
  p5 -->|object file| store
  p5 -->|extra video row| db
  p5 -->|confirmation| teacher
  store -->|public URL| p5
```

### Level 1 process catalog

| ID | Process | Description |
|----|---------|-------------|
| **1.0** | Authenticate and Authorize | Register/login; load `profiles.role` (`student` / `teacher`) |
| **2.0** | Deliver Lessons | Serve JSON lessons; show curriculum + teacher videos in Media Hub |
| **3.0** | Assess and Score | Grade lesson quizzes; local progress; sync points when logged in |
| **4.0** | Rank Students | Aggregate `SUM(points)` from lesson quizzes only |
| **5.0** | Manage Extra Videos | Teacher adds/edits/removes links or uploaded files (JSON curriculum stays) |

### Data stores

| Store | Type | Contents |
|-------|------|----------|
| Lesson JSON | Bundled static | Grades, subjects, lessons, curriculum `video` |
| localStorage | Browser | Progress, optional media overrides |
| PostgreSQL | Supabase | `profiles`, `quiz_attempts`, `lesson_extra_videos` |
| Storage `lesson-videos` | Supabase | Teacher-uploaded video files (Free plan ≈ 50 MB max) |

---

## 8. DFD — Level 2 for Process 5.0 (Manage Extra Videos)

```mermaid
flowchart LR
  teacher[Teacher]
  db[(lesson_extra_videos)]
  bucket[(Storage lesson-videos)]

  p51((5.1 Browse Lessons))
  p52((5.2 Validate Input))
  p53((5.3 Store File))
  p54((5.4 Persist Metadata))
  p55((5.5 Remove Extra))

  teacher -->|filters selection| p51
  p51 -->|lesson context| teacher
  teacher -->|URL or file| p52
  p52 -->|valid link| p54
  p52 -->|valid file under size limit| p53
  p53 -->|storage_path public URL| p54
  p54 -->|insert or update row| db
  p54 -->|status| teacher
  teacher -->|delete id| p55
  p55 -->|delete row| db
  p55 -->|delete object if uploaded| bucket
```

---

## 9. DFD — Level 2 for Process 3.0 (Assess and Score)

```mermaid
flowchart LR
  student[Student]
  local[(localStorage)]
  cloud[(quiz_attempts)]

  p31((3.1 Present Lesson Quiz))
  p32((3.2 Evaluate Answers))
  p33((3.3 Persist Local Progress))
  p34((3.4 Sync Ranking Points))

  student -->|start quiz| p31
  p31 -->|questions| student
  student -->|answers| p32
  p32 -->|score total| student
  p32 -->|score| p33
  p33 -->|completedLessons quizScores| local
  p32 -->|if authenticated| p34
  p34 -->|upsert points equals score times 5| cloud
```

---

## 10. Data dictionary (revised)

| Data flow | From → To | Description |
|-----------|-----------|-------------|
| email, password | User → 1.0 | Credentials |
| role | profiles → 1.0 → UI | `student` or `teacher` |
| lesson content | JSON → 2.0 | Sections, activity, quiz, curriculum video |
| extra video metadata | DB → 2.0 | url, title, source_type, storage_path |
| uploaded file | Teacher → 5.3 → Storage | MP4/WebM/MOV (respect Free plan 50 MB) |
| public video URL | Storage → 2.0 → Student | HTML5 `<video>` playback |
| quiz answers | Student → 3.0 | Lesson quiz selections |
| points | 3.4 → quiz_attempts | `score × 5` per lesson (best kept) |
| leaderboard | 4.0 → Student | Rank, name, quizzes, total points |

---

## 11. Notes for documentation / thesis

1. **Practice quizzes do not enter Process 4.0** (Rank Students).  
2. **Curriculum videos** live in static JSON and are not deleted by Teacher Admin.  
3. **Teacher extras** are additive: link (`source_type = link`) or upload (`source_type = upload`).  
4. **Supabase Free plan** enforces a **50 MB** global upload limit — larger files must use external links.  
5. Guests may study and quiz locally; ranking sync requires authentication.  
6. Export diagrams via [Mermaid Live Editor](https://mermaid.live) for Word/PDF figures.
