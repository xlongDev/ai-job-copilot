import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const interviewQuestions = [
  // ===== HR 面 (hr) =====
  { type: "hr", category: "self-intro", question: "请做一个简短的自我介绍，重点突出你的技术亮点和项目经验。", hint: "表达能力、自我认知、亮点提炼", difficulty: "easy", tags: "自我介绍,HR" },
  { type: "hr", category: "self-intro", question: "你为什么从前一家公司离职？", hint: "离职动机、稳定性评估", difficulty: "easy", tags: "离职原因,HR" },
  { type: "hr", category: "career-plan", question: "你对未来 3-5 年的职业规划是什么？", hint: "职业目标、成长意愿", difficulty: "medium", tags: "职业规划,HR" },
  { type: "hr", category: "career-plan", question: "你为什么选择我们公司？你对我们公司有什么了解？", hint: "求职动机、公司认知", difficulty: "medium", tags: "求职动机,HR" },
  { type: "hr", category: "salary", question: "你的期望薪资是多少？为什么？", hint: "薪资谈判、自我估值", difficulty: "medium", tags: "薪资,HR" },
  { type: "hr", category: "salary", question: "如果你拿到多个 Offer，你会如何选择？", hint: "决策能力、价值观", difficulty: "medium", tags: "Offer选择,HR" },
  { type: "hr", category: "behavior", question: "你最大的优点和缺点是什么？", hint: "自我认知、诚实度", difficulty: "easy", tags: "优缺点,HR" },
  { type: "hr", category: "behavior", question: "描述一次你与同事/领导意见不一致的经历，你是如何处理的？", hint: "沟通能力、冲突处理", difficulty: "medium", tags: "团队协作,冲突处理" },
  { type: "hr", category: "behavior", question: "你遇到过最大的挫折是什么？你是如何克服的？", hint: "抗压能力、成长心态", difficulty: "medium", tags: "挫折,抗压" },
  { type: "hr", category: "behavior", question: "你如何处理工作压力和紧迫的截止日期？", hint: "压力管理、时间管理", difficulty: "easy", tags: "压力管理,时间管理" },
  { type: "hr", category: "behavior", question: "描述一个你在团队中发挥领导作用的经历。", hint: "领导力、主动性", difficulty: "medium", tags: "领导力,团队" },
  { type: "hr", category: "behavior", question: "你如何保持对新技术的学习？最近学了什么？", hint: "学习能力、自驱力", difficulty: "easy", tags: "学习能力,自驱" },
  { type: "hr", category: "behavior", question: "如果你入职后发现工作内容与预期不符，你会怎么做？", hint: "适应能力、沟通", difficulty: "medium", tags: "适应能力,HR" },
  { type: "hr", category: "behavior", question: "你为什么认为自己适合这个岗位？", hint: "岗位匹配度、自我认知", difficulty: "easy", tags: "岗位匹配,HR" },
  { type: "hr", category: "behavior", question: "你有什么想问我的？", hint: "提问质量、兴趣度", difficulty: "easy", tags: "反问,HR" },

  // ===== 技术面 - React (tech/react) =====
  { type: "tech", category: "react", question: "请解释 React 的虚拟 DOM（Virtual DOM）是什么，它的工作原理是什么？", hint: "虚拟DOM、Diff算法、性能优化", difficulty: "medium", tags: "React,虚拟DOM,Diff" },
  { type: "tech", category: "react", question: "React 的 Diff 算法是如何工作的？它的时间复杂度是多少？", hint: "Diff算法、O(n)复杂度、key的作用", difficulty: "hard", tags: "React,Diff算法,性能" },
  { type: "tech", category: "react", question: "解释 React Fiber 架构是什么，它解决了什么问题？", hint: "Fiber、可中断渲染、优先级调度", difficulty: "hard", tags: "React,Fiber,架构" },
  { type: "tech", category: "react", question: "React Hooks 的闭包陷阱是什么？如何避免？", hint: "闭包陷阱、useEffect依赖、useRef", difficulty: "hard", tags: "React,Hooks,闭包" },
  { type: "tech", category: "react", question: "useEffect 和 useLayoutEffect 有什么区别？分别在什么场景下使用？", hint: "执行时机、阻塞渲染、性能影响", difficulty: "medium", tags: "React,Hooks,Effect" },
  { type: "tech", category: "react", question: "useMemo 和 useCallback 的区别是什么？过度使用会有什么问题？", hint: "缓存策略、性能开销、使用场景", difficulty: "medium", tags: "React,Hooks,性能" },
  { type: "tech", category: "react", question: "React 18 的并发特性（Concurrent Features）有哪些？useTransition 和 useDeferredValue 的区别？", hint: "并发渲染、useTransition、useDeferredValue", difficulty: "hard", tags: "React18,并发,性能" },
  { type: "tech", category: "react", question: "解释 React 的状态批量更新（Batching）机制，React 18 有什么改进？", hint: "批量更新、自动批处理、性能", difficulty: "medium", tags: "React18,状态更新" },
  { type: "tech", category: "react", question: "React Server Components 和 Client Components 有什么区别？各自的使用场景？", hint: "RSC、服务端组件、零客户端JS", difficulty: "hard", tags: "React,RSC,Next.js" },
  { type: "tech", category: "react", question: "Context 和状态管理库（如 Zustand、Redux）相比，有什么优缺点？", hint: "Context、状态管理、性能、重构", difficulty: "medium", tags: "React,状态管理,Context" },
  { type: "tech", category: "react", question: "React 的 key 属性有什么作用？为什么不能用 index 作为 key？", hint: "key、Diff算法、列表渲染", difficulty: "medium", tags: "React,key,列表" },
  { type: "tech", category: "react", question: "高阶组件（HOC）和自定义 Hooks，你更倾向于用哪个？为什么？", hint: "HOC、Hooks、代码复用、可测试性", difficulty: "medium", tags: "React,HOC,Hooks" },
  { type: "tech", category: "react", question: "React 的 refs 有哪些使用场景？forwardRef 和 useImperativeHandle 怎么用？", hint: "refs、forwardRef、useImperativeHandle", difficulty: "medium", tags: "React,refs" },
  { type: "tech", category: "react", question: "如何优化 React 应用的首屏加载性能？请列举至少 5 种方法。", hint: "代码分割、懒加载、SSR、预渲染、Tree Shaking", difficulty: "medium", tags: "React,性能优化" },
  { type: "tech", category: "react", question: "React 中的错误边界（Error Boundary）是什么？如何使用？", hint: "Error Boundary、componentDidCatch、getDerivedStateFromError", difficulty: "medium", tags: "React,错误处理" },

  // ===== 技术面 - CSS (tech/css) =====
  { type: "tech", category: "css", question: "解释 CSS 的 BFC（块级格式化上下文）是什么，如何触发，有什么应用场景？", hint: "BFC、清除浮动、margin折叠", difficulty: "medium", tags: "CSS,BFC,布局" },
  { type: "tech", category: "css", question: "Flexbox 和 Grid 的区别是什么？各自适合什么场景？", hint: "一维vs二维、布局选择", difficulty: "easy", tags: "CSS,Flex,Grid" },
  { type: "tech", category: "css", question: "CSS 的 position 有哪些值？sticky 和 fixed 的区别？", hint: "position、sticky、fixed、定位", difficulty: "easy", tags: "CSS,定位" },
  { type: "tech", category: "css", question: "如何实现一个 1px 边框？有哪些方案？", hint: "1px边框、transform scale、viewport", difficulty: "medium", tags: "CSS,移动端" },
  { type: "tech", category: "css", question: "CSS 的层叠上下文（Stacking Context）是什么？z-index 在什么情况下会失效？", hint: "层叠上下文、z-index、定位", difficulty: "hard", tags: "CSS,层叠上下文" },
  { type: "tech", category: "css", question: "如何实现垂直居中？请列举至少 3 种方法。", hint: "垂直居中、Flex、Grid、absolute", difficulty: "easy", tags: "CSS,布局" },
  { type: "tech", category: "css", question: "CSS 动画和 JS 动画相比有什么优缺点？如何优化动画性能？", hint: "GPU加速、will-change、transform", difficulty: "medium", tags: "CSS,动画,性能" },
  { type: "tech", category: "css", question: "响应式设计有哪些方案？rem、em、vw/vh 有什么区别？", hint: "响应式、rem、vw、媒体查询", difficulty: "medium", tags: "CSS,响应式" },

  // ===== 技术面 - JavaScript (tech/js) =====
  { type: "tech", category: "js", question: "解释 JavaScript 的事件循环（Event Loop）机制，宏任务和微任务的区别？", hint: "Event Loop、宏任务、微任务、执行顺序", difficulty: "hard", tags: "JS,Event Loop,异步" },
  { type: "tech", category: "js", question: "闭包是什么？请举一个实际应用场景。闭包会导致内存泄漏吗？", hint: "闭包、作用域链、内存泄漏", difficulty: "medium", tags: "JS,闭包,内存" },
  { type: "tech", category: "js", question: "原型链是什么？如何实现继承？class extends 的本质是什么？", hint: "原型链、prototype、继承", difficulty: "medium", tags: "JS,原型链,继承" },
  { type: "tech", category: "js", question: "this 的指向规则是什么？call、apply、bind 的区别？", hint: "this、call/apply/bind、箭头函数", difficulty: "medium", tags: "JS,this" },
  { type: "tech", category: "js", question: "Promise 的原理是什么？如何实现一个 Promise.all 和 Promise.race？", hint: "Promise、异步、链式调用", difficulty: "hard", tags: "JS,Promise,异步" },
  { type: "tech", category: "js", question: "async/await 的原理是什么？它和 Promise 有什么关系？", hint: "async/await、Generator、Promise", difficulty: "medium", tags: "JS,async,Promise" },
  { type: "tech", category: "js", question: "深拷贝和浅拷贝的区别？如何实现一个完整的深拷贝？", hint: "深拷贝、浅拷贝、递归、循环引用", difficulty: "medium", tags: "JS,深拷贝" },
  { type: "tech", category: "js", question: "防抖（debounce）和节流（throttle）的区别？请手写实现。", hint: "防抖、节流、性能优化", difficulty: "medium", tags: "JS,防抖,节流" },
  { type: "tech", category: "js", question: "解释 JavaScript 的垃圾回收机制，V8 的新生代和老生代是什么？", hint: "GC、标记清除、分代回收", difficulty: "hard", tags: "JS,GC,V8" },
  { type: "tech", category: "js", question: "TypeScript 的类型系统有哪些高级特性？泛型、条件类型、映射类型分别怎么用？", hint: "TS、泛型、条件类型、映射类型", difficulty: "hard", tags: "TS,类型系统" },

  // ===== 技术面 - 工程化 (tech/engineering) =====
  { type: "tech", category: "engineering", question: "Webpack 和 Vite 的区别是什么？Vite 为什么快？", hint: "Webpack、Vite、ESM、HMR", difficulty: "medium", tags: "工程化,Webpack,Vite" },
  { type: "tech", category: "engineering", question: "Tree Shaking 的原理是什么？什么情况下会失效？", hint: "Tree Shaking、ESM、副作用", difficulty: "medium", tags: "工程化,Tree Shaking" },
  { type: "tech", category: "engineering", question: "微前端是什么？有哪些实现方案？各有什么优缺点？", hint: "微前端、qiankun、Module Federation", difficulty: "hard", tags: "工程化,微前端" },
  { type: "tech", category: "engineering", question: "Monorepo 是什么？pnpm workspace 和 Turborepo 有什么优势？", hint: "Monorepo、pnpm、Turborepo", difficulty: "medium", tags: "工程化,Monorepo" },
  { type: "tech", category: "engineering", question: "CI/CD 流程是怎样的？你用过哪些 CI/CD 工具？", hint: "CI/CD、GitHub Actions、Jenkins", difficulty: "medium", tags: "工程化,CI/CD" },
  { type: "tech", category: "engineering", question: "前端监控体系包含哪些方面？如何实现错误监控和性能监控？", hint: "前端监控、错误监控、性能监控、SDK", difficulty: "hard", tags: "工程化,监控" },

  // ===== 技术面 - 网络 (tech/network) =====
  { type: "tech", category: "network", question: "HTTP/1.1、HTTP/2、HTTP/3 有什么区别？HTTP/2 的多路复用是什么？", hint: "HTTP版本、多路复用、QUIC", difficulty: "medium", tags: "网络,HTTP" },
  { type: "tech", category: "network", question: "浏览器缓存机制是什么？强缓存和协商缓存的区别？", hint: "缓存、Cache-Control、ETag、Last-Modified", difficulty: "medium", tags: "网络,缓存" },
  { type: "tech", category: "network", question: "跨域是什么？有哪些解决方案？CORS 的预检请求是什么？", hint: "跨域、CORS、代理、JSONP", difficulty: "medium", tags: "网络,跨域,CORS" },
  { type: "tech", category: "network", question: "HTTPS 的握手过程是什么？对称加密和非对称加密在哪里用到了？", hint: "HTTPS、TLS、对称加密、非对称加密", difficulty: "hard", tags: "网络,HTTPS,安全" },
  { type: "tech", category: "network", question: "从浏览器输入 URL 到页面渲染完成，发生了什么？", hint: "DNS、TCP、HTTP、渲染", difficulty: "medium", tags: "网络,浏览器" },

  // ===== 项目面 (project) =====
  { type: "project", category: "deep-dive", question: "请详细介绍一个你最有成就感的项目，包括你的角色、技术选型和最终成果。", hint: "项目深度、技术决策、量化成果", difficulty: "medium", tags: "项目,STAR" },
  { type: "project", category: "deep-dive", question: "在你的项目中遇到的最难的技术问题是什么？你是如何分析和解决的？", hint: "问题解决、技术深度、排查能力", difficulty: "hard", tags: "项目,问题解决" },
  { type: "project", category: "deep-dive", question: "你项目中的架构设计是怎样的？为什么这样设计？有没有考虑过替代方案？", hint: "架构设计、技术选型、权衡", difficulty: "hard", tags: "项目,架构" },
  { type: "project", category: "deep-dive", question: "项目中你是如何做性能优化的？优化前后的指标对比？", hint: "性能优化、量化数据、方法论", difficulty: "medium", tags: "项目,性能优化" },
  { type: "project", category: "deep-dive", question: "如果让你重新做这个项目，你会做哪些改进？", hint: "反思能力、持续改进", difficulty: "medium", tags: "项目,反思" },
  { type: "project", category: "deep-dive", question: "项目中你是如何保证代码质量的？有没有做单元测试和 E2E 测试？", hint: "代码质量、测试、CI", difficulty: "medium", tags: "项目,测试" },
  { type: "project", category: "deep-dive", question: "项目中团队有多少人？你是如何协作的？你的具体贡献是什么？", hint: "团队协作、个人贡献", difficulty: "easy", tags: "项目,团队" },
  { type: "project", category: "deep-dive", question: "项目上线后有没有遇到过线上故障？你是如何排查和修复的？", hint: "线上故障、排查能力、应急响应", difficulty: "hard", tags: "项目,故障排查" },

  // ===== 算法面 (algo) =====
  { type: "algo", category: "array", question: "给定一个整数数组和目标值，找出数组中和为目标值的两个数的位置。", hint: "哈希表、O(n)时间复杂度", difficulty: "easy", tags: "算法,哈希表,数组" },
  { type: "algo", category: "array", question: "实现一个函数，将数组中的 0 移动到末尾，保持非零元素的相对顺序。", hint: "双指针、原地操作", difficulty: "easy", tags: "算法,双指针" },
  { type: "algo", category: "string", question: "给定一个字符串，找出最长不重复子串的长度。", hint: "滑动窗口、哈希表", difficulty: "medium", tags: "算法,滑动窗口" },
  { type: "algo", category: "string", question: "判断一个字符串是否是回文，只考虑字母和数字字符。", hint: "双指针、字符处理", difficulty: "easy", tags: "算法,双指针" },
  { type: "algo", category: "linked-list", question: "反转一个单链表。要求迭代和递归两种实现。", hint: "链表反转、指针操作", difficulty: "medium", tags: "算法,链表" },
  { type: "algo", category: "linked-list", question: "判断链表是否有环，如果有环，找到环的入口节点。", hint: "快慢指针、Floyd算法", difficulty: "medium", tags: "算法,链表,快慢指针" },
  { type: "algo", category: "tree", question: "实现二叉树的层序遍历（BFS）。", hint: "BFS、队列", difficulty: "medium", tags: "算法,树,BFS" },
  { type: "algo", category: "tree", question: "给定前序遍历和中序遍历，重建二叉树。", hint: "递归、分治", difficulty: "hard", tags: "算法,树,递归" },
  { type: "algo", category: "dynamic-programming", question: "爬楼梯：每次可以爬 1 或 2 步，爬到第 n 阶有多少种方法？", hint: "动态规划、斐波那契", difficulty: "easy", tags: "算法,DP" },
  { type: "algo", category: "dynamic-programming", question: "最长递增子序列（LIS）的长度是多少？", hint: "动态规划、二分查找", difficulty: "medium", tags: "算法,DP" },
  { type: "algo", category: "sorting", question: "手写快速排序，并解释其时间复杂度。", hint: "快排、分治、O(nlogn)", difficulty: "medium", tags: "算法,排序" },
  { type: "algo", category: "sorting", question: "手写归并排序，和快排相比有什么优缺点？", hint: "归并排序、稳定排序", difficulty: "medium", tags: "算法,排序" },

  // ===== 行为面 (behavior) - STAR =====
  { type: "behavior", category: "leadership", question: "描述一次你主动承担额外责任的经历。（Situation-Task-Action-Result）", hint: "STAR法则、主动性", difficulty: "medium", tags: "行为,STAR,领导力" },
  { type: "behavior", category: "teamwork", question: "讲述一个你和团队成员合作完成困难任务的故事。", hint: "STAR法则、团队协作", difficulty: "medium", tags: "行为,STAR,团队" },
  { type: "behavior", category: "conflict", question: "描述一次你与同事产生技术分歧的经历，最终如何解决的？", hint: "STAR法则、冲突处理", difficulty: "medium", tags: "行为,STAR,冲突" },
  { type: "behavior", category: "failure", question: "讲述一个你失败的项目或经历，你从中学到了什么？", hint: "STAR法则、反思能力", difficulty: "medium", tags: "行为,STAR,失败" },
  { type: "behavior", category: "innovation", question: "描述一次你提出创新方案并成功落地的经历。", hint: "STAR法则、创新", difficulty: "hard", tags: "行为,STAR,创新" },
  { type: "behavior", category: "mentorship", question: "你有没有指导过新人？请分享一次帮助他人成长的经历。", hint: "STAR法则、导师精神", difficulty: "medium", tags: "行为,STAR,导师" },
  { type: "behavior", category: "priority", question: "多个紧急任务同时到来，你如何排优先级？请举例说明。", hint: "STAR法则、优先级管理", difficulty: "medium", tags: "行为,STAR,优先级" },
  { type: "behavior", category: "communication", question: "描述一次你需要向非技术人员解释技术问题的经历。", hint: "STAR法则、沟通能力", difficulty: "medium", tags: "行为,STAR,沟通" },

  // ===== 系统设计 (system) =====
  { type: "system", category: "frontend", question: "如何设计一个高性能的前端监控系统？需要采集哪些指标？", hint: "前端监控、性能指标、SDK设计", difficulty: "hard", tags: "系统设计,监控" },
  { type: "system", category: "frontend", question: "设计一个支持百万级 PV 的前端组件库，如何做版本管理和按需加载？", hint: "组件库、版本管理、Tree Shaking", difficulty: "hard", tags: "系统设计,组件库" },
  { type: "system", category: "frontend", question: "如何设计一个低代码平台的前端架构？", hint: "低代码、可视化编辑、DSL", difficulty: "hard", tags: "系统设计,低代码" },
  { type: "system", category: "frontend", question: "设计一个实时协作编辑器（如 Google Docs），如何解决冲突？", hint: "CRDT、OT算法、WebSocket", difficulty: "hard", tags: "系统设计,协同编辑" },
  { type: "system", category: "frontend", question: "如何设计一个大型 SPA 的状态管理架构？", hint: "状态管理、模块化、可维护性", difficulty: "hard", tags: "系统设计,状态管理" },
  { type: "system", category: "general", question: "设计一个短链系统，如何保证高可用和唯一性？", hint: "短链、哈希、Base62", difficulty: "hard", tags: "系统设计,短链" },
  { type: "system", category: "general", question: "设计一个消息推送系统，支持百万级并发。", hint: "WebSocket、消息队列、推送", difficulty: "hard", tags: "系统设计,推送" },
  { type: "system", category: "general", question: "如何设计一个限流系统？令牌桶和漏桶算法的区别？", hint: "限流、令牌桶、漏桶", difficulty: "hard", tags: "系统设计,限流" },
];

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "alex.chen@email.com" },
    update: {},
    create: {
      email: "alex.chen@email.com",
      name: "Alex Chen",
      avatar: "AC",
      role: "Senior Frontend Engineer",
      plan: "pro",
      credits: 1250,
    },
  });

  // Seed interview questions
  console.log(`Seeding ${interviewQuestions.length} interview questions...`);
  await prisma.interviewQuestion.deleteMany({});
  for (const q of interviewQuestions) {
    await prisma.interviewQuestion.create({ data: q });
  }

  // Create resumes
  await prisma.resume.createMany({
    data: [
      {
        userId: user.id,
        title: "前端工程师简历",
        content: "# Alex Chen\n\n## 联系方式\n- Email: alex.chen@email.com\n- Location: 深圳\n\n## 工作经历\n### 高级前端工程师 @ TechCorp (2022-至今)\n- 主导 React 性能优化项目，首屏加载时间减少 45%\n- 设计并实现微前端架构，支撑 5 个团队协作\n\n## 技能\nReact, TypeScript, Next.js, Node.js, GraphQL",
        format: "markdown",
        atsScore: 87,
        version: 3,
        isPrimary: true,
      },
      {
        userId: user.id,
        title: "全栈工程师简历",
        content: "# Alex Chen - Full Stack\n\n## 技能\nReact, Node.js, PostgreSQL, Docker",
        format: "markdown",
        atsScore: 82,
        version: 2,
      },
    ],
  });

  // Create applications
  await prisma.application.createMany({
    data: [
      { userId: user.id, company: "腾讯", position: "Staff 前端", location: "深圳", salary: "40-70K", status: "applied", priority: "high", matchScore: 92 },
      { userId: user.id, company: "字节跳动", position: "高级前端", location: "北京", salary: "35-60K", status: "tech1", priority: "high", matchScore: 88 },
      { userId: user.id, company: "美团", position: "前端架构师", location: "北京", salary: "45-80K", status: "offer", priority: "high", matchScore: 95 },
      { userId: user.id, company: "阿里巴巴", position: "高级前端", location: "杭州", salary: "30-55K", status: "rejected", priority: "medium", matchScore: 72 },
      { userId: user.id, company: "京东", position: "前端专家", location: "北京", salary: "35-65K", status: "applied", priority: "medium", matchScore: 81 },
      { userId: user.id, company: "拼多多", position: "高级前端", location: "上海", salary: "40-70K", status: "tech2", priority: "high", matchScore: 86 },
      { userId: user.id, company: "小红书", position: "前端工程师", location: "上海", salary: "30-50K", status: "applied", priority: "low", matchScore: 68 },
      { userId: user.id, company: "B站", position: "资深前端", location: "上海", salary: "35-60K", status: "offer", priority: "high", matchScore: 90 },
    ],
  });

  // Create learning tasks
  await prisma.learningTask.createMany({
    data: [
      { userId: user.id, title: "Next.js 16 App Router 深入", category: "frontend", status: "done", duration: 90 },
      { userId: user.id, title: "TypeScript 高级类型", category: "frontend", status: "done", duration: 60 },
      { userId: user.id, title: "前端性能优化实战", category: "frontend", status: "in-progress", duration: 180 },
      { userId: user.id, title: "Node.js 进阶：流与缓冲", category: "backend", status: "pending", duration: 150 },
      { userId: user.id, title: "PostgreSQL 索引优化", category: "backend", status: "pending", duration: 90 },
      { userId: user.id, title: "系统设计基础", category: "system", status: "in-progress", duration: 240 },
      { userId: user.id, title: "算法与数据结构刷题", category: "algo", status: "in-progress", duration: 300 },
    ],
  });

  // Create knowledge docs
  await prisma.knowledgeDoc.createMany({
    data: [
      { userId: user.id, name: "Alex_Chen_Resume_v3.pdf", type: "resume", content: "简历内容...", chunks: 12, size: 284000 },
      { userId: user.id, name: "React性能优化项目文档.md", type: "project", content: "项目文档...", chunks: 8, size: 45000 },
      { userId: user.id, name: "腾讯Offer_Letter.pdf", type: "offer", content: "Offer内容...", chunks: 3, size: 120000 },
      { userId: user.id, name: "系统设计学习笔记.md", type: "note", content: "笔记内容...", chunks: 15, size: 89000 },
    ],
  });

  console.log("Seed complete!");
  console.log(`- ${interviewQuestions.length} interview questions`);
  console.log(`- User: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
