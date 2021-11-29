// 定义一个新的Vue,这里的vue对象只用于承载数据的作用
// 主要用于当兄弟组件之间需要进行数据交互时，可以将这里的vue实例做为一个中转对象，便于传值
// 兄弟组件之前传值时可以通过 $emit触发(发送)  $on监听(接收)
import Vue from 'vue'
export default new Vue()
