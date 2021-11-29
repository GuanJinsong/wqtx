// components/barchart/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    data: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    creatData() {
      const count = 29
      let data = []

      for (let index = 0; index < count; index++) {
        let random = Math.random()
        data.push({
          width: `${1 / (2 * count - 1) * 100}%`,
          height: `${random * 100}%`,
          backgroundImage: `linear-gradient(#88D0CF -${(1 - random) / random  * 100}%, #2727D5)`
        })  
        
      }

      this.setData({
        data: data
      })
    }
  },

  lifetimes: {
    ready() {
      this.creatData()
    }
  }
})