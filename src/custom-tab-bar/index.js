const tabs = [
  { pagePath: 'pages/gallery/index', number: '01', text: '展厅' },
  { pagePath: 'pages/category/index', number: '02', text: '分类' },
  { pagePath: 'pages/contact/index', number: '03', text: '联系' }
]

Component({
  data: { selected: 0, tabs },
  lifetimes: {
    attached() { this.syncSelected() }
  },
  pageLifetimes: {
    show() { this.syncSelected() }
  },
  methods: {
    syncSelected() {
      const pages = getCurrentPages()
      const route = pages[pages.length - 1]?.route
      const selected = tabs.findIndex(tab => tab.pagePath === route)
      if (selected >= 0 && selected !== this.data.selected) this.setData({ selected })
    },
    switchPage(event) {
      const selected = Number(event.currentTarget.dataset.index)
      if (selected === this.data.selected || !tabs[selected]) return
      const previous = this.data.selected
      this.setData({ selected })
      wx.switchTab({
        url: `/${tabs[selected].pagePath}`,
        fail: () => this.setData({ selected: previous })
      })
    }
  }
})
