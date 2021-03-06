// https://leetcode-cn.com/problems/valid-parentheses/
// 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。
// 用栈解
// 洋葱模型
// if loop recursion

/**
 * 1. 暴力：不断的 replace匹配括号 -> ""
 *      a. ()[]{} 
 *      c. ((({[{[]}]}))) n^2
 * 2. Stack 洋葱模型 
 *    左括号进栈 右括号匹配抵消出栈
 **/ 
let str = '({()})'


