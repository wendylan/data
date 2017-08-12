// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions : {
      sourceType : 'module'
  },
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: ['eslint:recommended'],// or 'plugin:vue/base']
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

    'no-console' : 0,

    //myself rule

     // 控制逗号前后的空格
     /* eslint comma-spacing: "off", curly: "error" */
    "comma-spacing": [2, { "before": false, "after": true }],

    // 控制逗号在行尾出现还是在行首出现
    "comma-style": [2, "last"],

    "no-multiple-empty-lines": [1, {"max": 2}],//空行最多不能超过2行

    "no-redeclare": 2,//禁止重复声明变量

    "no-spaced-func": 2,//函数调用时 函数名与()之间不能有空格

    "no-undef": 1//不能有未定义的变量

  }
}
