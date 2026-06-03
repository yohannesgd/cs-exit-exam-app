// src/services/api.js - Local questions version (no API call)
export async function fetchCSQuestions(count = 15, difficulty = 'medium') {
  // Return local questions immediately (no API delay)
  return getLocalQuestions(count);
}

function getLocalQuestions(count) {
  const allQuestions = [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      correctAnswer: "O(log n)",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      category: "Algorithms",
      explanation: "Binary search has O(log n) time complexity because it divides the search space in half each iteration."
    },
    {
      id: 2,
      question: "What does CPU stand for?",
      correctAnswer: "Central Processing Unit",
      options: ["Computer Processing Unit", "Central Processing Unit", "Central Program Unit", "Computer Program Unit"],
      category: "Hardware",
      explanation: "The CPU (Central Processing Unit) is the brain of the computer that executes instructions."
    },
    {
      id: 3,
      question: "Which of the following is a programming language?",
      correctAnswer: "Python",
      options: ["HTML", "CSS", "Python", "XML"],
      category: "Programming",
      explanation: "Python is a high-level programming language. HTML, CSS, and XML are markup languages."
    },
    {
      id: 4,
      question: "What does RAM stand for?",
      correctAnswer: "Random Access Memory",
      options: ["Read Access Memory", "Random Access Memory", "Random Allocated Memory", "Readily Available Memory"],
      category: "Hardware",
      explanation: "RAM (Random Access Memory) is temporary storage that the CPU uses to store data temporarily."
    },
    {
      id: 5,
      question: "What is an algorithm?",
      correctAnswer: "A step-by-step procedure for solving a problem",
      options: [
        "A programming language",
        "A type of computer",
        "A step-by-step procedure for solving a problem",
        "A data structure"
      ],
      category: "Algorithms",
      explanation: "An algorithm is a well-defined sequence of steps to solve a specific problem."
    },
    {
      id: 6,
      question: "What is the main purpose of an operating system?",
      correctAnswer: "Manage computer hardware and software resources",
      options: [
        "Browse the internet",
        "Manage computer hardware and software resources",
        "Create documents",
        "Play games"
      ],
      category: "Operating Systems",
      explanation: "An operating system manages hardware resources and provides services for computer programs."
    },
    {
      id: 7,
      question: "What does SQL stand for?",
      correctAnswer: "Structured Query Language",
      options: [
        "Structured Query Language",
        "Simple Query Language",
        "System Query Language",
        "Standard Query Language"
      ],
      category: "Databases",
      explanation: "SQL (Structured Query Language) is used to communicate with databases."
    },
    {
      id: 8,
      question: "Which data structure uses LIFO (Last In First Out)?",
      correctAnswer: "Stack",
      options: ["Queue", "Stack", "Array", "Linked List"],
      category: "Data Structures",
      explanation: "A stack follows LIFO principle - the last element added is the first one removed."
    },
    {
      id: 9,
      question: "What is the default port for HTTP?",
      correctAnswer: "80",
      options: ["21", "22", "80", "443"],
      category: "Networking",
      explanation: "HTTP typically uses port 80, while HTTPS uses port 443."
    },
    {
      id: 10,
      question: "What does OOP stand for?",
      correctAnswer: "Object-Oriented Programming",
      options: [
        "Object-Oriented Programming",
        "Order of Operations Programming",
        "Object-Oriented Protocol",
        "Online Operations Protocol"
      ],
      category: "Programming",
      explanation: "OOP (Object-Oriented Programming) is a programming paradigm based on objects containing data and code."
    },
    {
      id: 11,
      question: "What is the binary representation of decimal 5?",
      correctAnswer: "101",
      options: ["100", "101", "110", "111"],
      category: "Computer Science Basics",
      explanation: "5 in binary is 101 (4 + 0 + 1)."
    },
    {
      id: 12,
      question: "Which of these is a version control system?",
      correctAnswer: "Git",
      options: ["Docker", "Git", "Jenkins", "Node.js"],
      category: "Development Tools",
      explanation: "Git is a distributed version control system for tracking changes in source code."
    },
    {
      id: 13,
      question: "What does HTTPS stand for?",
      correctAnswer: "HyperText Transfer Protocol Secure",
      options: [
        "HyperText Transfer Protocol Secure",
        "High Transfer Protocol Secure",
        "Hyper Transfer Protocol System",
        "High Transfer Protocol System"
      ],
      category: "Networking",
      explanation: "HTTPS is HTTP with encryption (SSL/TLS) for secure communication."
    },
    {
      id: 14,
      question: "Which of these is a NoSQL database?",
      correctAnswer: "MongoDB",
      options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
      category: "Databases",
      explanation: "MongoDB is a NoSQL database. MySQL, PostgreSQL, and SQLite are relational databases."
    },
    {
      id: 15,
      question: "What is the primary purpose of a firewall?",
      correctAnswer: "Monitor and control network traffic",
      options: [
        "Speed up internet connection",
        "Monitor and control network traffic",
        "Store data securely",
        "Compress files"
      ],
      category: "Security",
      explanation: "A firewall monitors incoming and outgoing network traffic based on security rules."
    }
  ];
  
  // Return the first 'count' questions
  return allQuestions.slice(0, Math.min(count, allQuestions.length));
}

// Keep the shuffle function for future use
function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
