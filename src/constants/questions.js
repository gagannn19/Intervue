// The DSA question bank the mock AI interviewer scripts itself from.
// Keyed by difficulty so aiService.buildScript() can look one up directly.
export const QUESTION_BANK = {
  easy: {
    title: "Two Sum",
    statement:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Assume exactly one solution exists, and you can't use the same element twice.",
    followUps: [
      "Walk me through your approach before you write any code — what's the brute-force idea first?",
      "That works, but what's the time complexity? Can we do better than O(n²)?",
      "Good — a hash map gets us to O(n). What's the space tradeoff there?",
      "What happens if the array is empty, or has only one element?",
    ],
  },
  medium: {
    title: "Longest Substring Without Repeating Characters",
    statement: "Given a string s, find the length of the longest substring without repeating characters.",
    followUps: [
      "Before coding — what's your high-level strategy? Sliding window, brute force, something else?",
      "How do you decide when to shrink the window from the left?",
      "What data structure are you using to track characters in the current window, and why that one?",
      "What's the time and space complexity of your final solution?",
      "What if the string contains unicode or emoji — does your approach still hold?",
    ],
  },
  hard: {
    title: "Median of Two Sorted Arrays",
    statement:
      "Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
    followUps: [
      "This one's tricky — what's your instinct for getting to log time instead of just merging?",
      "Talk me through how binary search applies here. What are you searching over?",
      "How do you handle the partition when one array is much smaller than the other?",
      "What edge cases around empty arrays or even/odd total length are you accounting for?",
      "Can you state the final complexity and defend it?",
    ],
  },
};

export const LANGUAGES = ["JavaScript", "Python", "Java", "C++"];

export const STARTER_CODE = {
  JavaScript: "function solve(nums, target) {\n  // your code here\n}",
  Python: "def solve(nums, target):\n    # your code here\n    pass",
  Java: "class Solution {\n    public int[] solve(int[] nums, int target) {\n        // your code here\n    }\n}",
  "C++": "vector<int> solve(vector<int>& nums, int target) {\n    // your code here\n}",
};
