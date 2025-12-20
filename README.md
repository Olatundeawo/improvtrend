# ImprovTrend — Collaborative Storytelling App

ImprovTrend is a collaborative, turn-based storytelling platform where users collectively build stories in real time. Each participant contributes one turn at a time, plays characters within a shared narrative, and engages through upvotes and comments — all while following simple improv rules.

The app is built with **React Native + Expo**, enabling a **single codebase** for **iOS, Android, and Web**, backed by **Express js** **PostgreSQL** database.

---

## Features (Version 1)

### Core Storytelling
- Create stories with a title, prompt, and genre
- Turn-based contributions (no consecutive turns by the same user)
- Stories progress linearly and cannot be edited

### Characters
- Character labeling per turn
- Characters belong to stories, not users
- Users may play different characters across turns

### Engagement
- Upvote individual turns (no downvotes)
- One upvote per user per turn
- Flat comments per story (no replies)

### Feed
- Discover active and trending stories
- Ranking based on engagement and participation

---

## Tech Stack

### Frontend
- **React Native**
- **Expo**
- **Expo Router**
- **React Native Web**

### Backend
- **PostgreSQL**
- REST API (Node.js)

### State Management
- React Context API

---

## Project Structure

