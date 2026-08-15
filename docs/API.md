# API Contract

This document defines the API endpoints for the Quiz & Assessment Platform. 
**Note:** The team must strictly adhere to these interfaces so the frontend and backend can integrate seamlessly.

---

## 1. Authentication (Member 1)

### POST `/api/auth/register`
* **Role:** Public
* **Request:** `{ "name": "...", "email": "...", "password": "...", "role": "student|admin" }`
* **Response:** `{ "success": true, "token": "...", "user": { "id": 1, "role": "student" } }`

### POST `/api/auth/login`
* **Role:** Public
* **Request:** `{ "email": "...", "password": "..." }`
* **Response:** `{ "success": true, "token": "...", "user": { "id": 1, "role": "student" } }`

### GET `/api/auth/me`
* **Role:** Authenticated
* **Headers:** `Authorization: Bearer <token>`
* **Response:** `{ "success": true, "user": { "id": 1, "name": "...", "role": "student" } }`

---

## 2. Quiz Management (Member 2)

### POST `/api/quizzes`
* **Role:** Admin
* **Request:** `{ "title": "...", "description": "...", "duration": 30, "negativeMarking": false }`
* **Response:** `{ "success": true, "quiz": { "id": 1, ... } }`

### GET `/api/quizzes`
* **Role:** Authenticated (Students see published, Admins see all)
* **Response:** `{ "success": true, "quizzes": [...] }`

*(Add more endpoints here for questions, editing, etc.)*

---

## 3. Quiz Taking & Evaluation (Member 3)

### POST `/api/quizzes/:id/start`
* **Role:** Student
* **Request:** `{}`
* **Response:** `{ "success": true, "attemptId": 123, "quiz": { "duration": 30, "questions": [...] } }`

### POST `/api/attempts/:id/submit`
* **Role:** Student
* **Request:** `{ "answers": [ { "questionId": 1, "selectedAnswer": "A" } ] }`
* **Response:** `{ "success": true, "result": { "score": 10, "totalMarks": 15 } }`

---

## 4. Leaderboard & Analytics (Member 4)

### GET `/api/leaderboard/:quizId`
* **Role:** Authenticated
* **Response:** `{ "success": true, "leaderboard": [ { "rank": 1, "name": "...", "score": 10 } ] }`

### GET `/api/admin/dashboard`
* **Role:** Admin
* **Response:** `{ "success": true, "totalStudents": 50, "totalQuizzes": 5, "averageScore": 75.5 }`
