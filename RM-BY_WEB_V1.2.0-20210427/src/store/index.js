//第一步:引入vue和vuex,并执行Vue.use(Vuex)
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);


//第二步：(初始定义)
//要设置的全局访问的state对象，所有的全局都可能用到的值都在这里进行定义
//在所有的组件里你都可以通过 this.$store.state.deviceDate 的这种方式取出state中定义的值
const state={
     deviceDate:"",     //定义一个全局的设备Imei码参数,
     pageData:"",       //定义分页数据,
};



//========================================================getters，mutations，actions 监听与修改Vuex的状态值开始 =====================================================
//第三步:（监听）
//vuex官方API提供了一个getters，和vue计算属性computed一样，来实时监听state值的变化(最新状态)
//你可以通过store.getters.getters下的函数名的方式访问getters下的方法
const getters = {
    //监听state中的deviceDate的变化
    G_newdeviceDate(state) {
       return state.deviceDate
    },
    //监听state中的pageData的变化
    G_newpageData(state) {
       return state.pageData
    }
};



//第四步:（修改）
//光有定义的state的初始值，不改变它不是我们想要的需求，
//接下来要说的就是mutations了，mutattions也是一个对象，这个对象里面可以放改变state的初始值的方法，
//具体的用法就是给里面的方法传入参数state或额外的参数,然后利用vue的双向数据驱动进行值的改变，
//同样的定义好之后也把这个mutations扔进Vuex.Store里面
const mutations = {
    //修改state中的deviceDate的值
    m_modifydeviceDate(state,data){
      state.deviceDate = data;
    },
    //修改state中的pageData的值
    m_modifypageData(state,data){
      state.pageData = data;
    }
};
//重点说明：
//在外部组件里进行全局执行mutations里面方法的时候，你只需要用执行
//this.$store.commit("mutations对象内的函数名")或this.$store.commit('mutations对象内的函数名'，'要传入的参数')
//这样就可以全局改变改变state的值了(这里的修改是全局修改，所有通用的地方都会改变)


//第五步:(异步修改)
//vuex官方API还提供了一个actions，这个actions也是个对象变量，
//最大的作用就是里面的Action方法 可以包含任意异步操作，这里面的方法是用来异步触发mutations里面的方法，
//actions里面自定义的函数接收一个context参数和要变化的形参，context与store实例具有相同的方法和属性，所以它可以执行context.commit(' '),
 const actions = {
    //控制mutations中的m_modifydeviceDate方法修改state中的deviceDate的值
    A_modifydeviceDate(context,txt){   //同上注释，txt为要变化的形参
       context.commit('m_modifydeviceDate',txt)
    },
    //控制mutations中的A_modifypageData方法修改state中的pageData的值
    A_modifypageData(context,txt){   //同上注释，txt为要变化的形参
       context.commit('m_modifypageData',txt)
    }
};
//重点说明:
//而在外部组件里进行全局执行actions里面方法的时候，你只需要用执行
//this.$store.dispatch('actions对象内的函数名')或this.$store.dispatch('actions对象内的函数名'，'要传入的参数')
//这样就可以全局改变改变state的值了(这里的修改是局部修改，指定的地方都会改变)

//========================================================getters，mutations，actions 监听与修改Vuex的状态值结束 =====================================================

//第六步：定义一个新的 Vuex对象，并将上面定义的全局变量值，放入新的Vuex对象中。如下：
const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
});

//第七步：暴露vuex对象，方便全局使用
export default store;
