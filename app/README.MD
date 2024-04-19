项目开发时，一个好的 Commit Message 至关重要：
    1. 可以使自己或者其他开发人员能够清晰地知道每个 commit 的变更内容，方便快速浏览变更历史，比如可以直接略过文档类型或者格式化类型的代码变更。
    2. 可以基于这些 Commit Message 进行过滤查找，比如只查找某个版本新增的功能：git log --oneline --grep "^feat|^fix"。

一个比较好的Commit信息，应当包含必要的修改内容的信息:  type、subject
git commit -m "type: subject"
type用于说明commit的类别，只允许使用下面7个标识
> feat：新功能（feature）
> fix：修补bug 
> docs：文档（documentation）
> style： 格式（不影响代码运行的变动）
> refactor：重构（即不是新增功能，也不是修改bug的代码变动）
> test：增加测试
> chore：构建过程或辅助工具的变动

subject是 commit 目的的简短描述，不超过50个字符。

为了确保不同开发人员使用不同工具时，代码格式保持一致，请使用 Prettier 来统一代码风格。
在 prettierrc.json 的同级目录下执行
```
prettier --write .
```