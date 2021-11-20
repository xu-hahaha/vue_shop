// 项目发布阶段需要babel插件，移出console
const prodPlugins = []
// 获取编译模式，mode值为production是值产品发布模式
if(process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时移出console的插件数组
    ...prodPlugins
  ]
}
