# Scholarship Selection System

A web-based scholarship allocation system that uses the 0/1 Knapsack Dynamic Programming algorithm to select students whose scholarships maximize total priority score without exceeding the available budget.

This is a team-based college project focused on applying Data Structures and Algorithms concepts to a practical resource-allocation problem.

## Problem Statement

A university has a limited scholarship budget. Each student requires a certain scholarship amount and has a priority score. The system determines which students should receive scholarships to maximize the total priority score without exceeding the available budget.

## Problem Interpretation

The project models scholarship allocation as a 0/1 Knapsack problem.

Each student is treated as an indivisible selection:

- Selected: the student receives the full requested scholarship amount.
- Not selected: the student receives no scholarship.

Partial scholarship allocation is not considered in this model.

## Algorithm

### 0/1 Knapsack using Dynamic Programming

For each student and possible budget state, the algorithm determines the maximum priority score achievable.

For a student with:

- Scholarship amount = `w`
- Priority score = `v`

the DP transition considers:

- Skipping the student
- Selecting the student, if the remaining budget allows it

The implementation uses a space-optimized DP value array and stores reconstruction information so the selected students can be recovered.

## Complexity

**Time Complexity:** `O(n × W)`

**Space Complexity:** `O(W)` for the DP value array plus `O(n × W)` for reconstruction data.

Where:

- `n` = number of students
- `W` = scholarship budget in rupees

## Features

- Add student scholarship data
- Edit student information
- Remove students
- Set the total scholarship budget
- Run exact 0/1 Knapsack optimization
- Display selected students
- Display total allocated scholarship
- Display remaining budget
- Display total priority score
- Visualize DP results
- Display reconstruction steps
- Handle large scholarship budgets without rendering every budget state as an individual table cell
- Input validation and edge-case handling

## Technology Stack

- React
- Vite
- JavaScript
- CSS
- D3.js

No backend or database is required.

## Project Structure

```text
src/
├── algorithm/
│   ├── knapsack.js
│   ├── knapsack.test.js
│   └── validation.js
├── components/
│   └── DpTable.jsx
├── data/
│   └── sampleStudents.js
├── visualization/
│   └── dpTable.js
├── App.jsx
├── main.jsx
└── styles/
    └── app.css
```

## Running the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite.

### 3. Run tests

```bash
npm test
```

### 4. Create a production build

```bash
npm run build
```

## Testing

The project includes algorithm tests covering normal and boundary cases for the scholarship allocation problem.

The system should be tested with:

- Small budgets
- Large budgets
- Zero budget
- No selectable students
- Multiple optimal selections
- Students whose scholarship amount exceeds the available budget
- Realistic scholarship amounts

## Assumptions

The current model assumes that a selected student receives the full scholarship amount they require.

Partial scholarships are outside the scope of this implementation.

## Project Purpose

This project demonstrates the application of Dynamic Programming to a practical scholarship allocation problem while providing an interactive interface for understanding the algorithm and its resulting decisions.
