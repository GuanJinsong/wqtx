<!-- 报警规则定义 -->
<template>
   <div class="man_alaParnet">
     <!-- 分呗报警智能分析 -->
     <div class="smallTitle">音量智能报警设置</div>
     <!-- 单一语音事件触发 -->
     <alarmRulesSingle v-bind:scopeSelection="scopeSelection"/>
     <!-- 公共语音事件触发 -->
     <alarmRulesPublic v-bind:scopeSelection="scopeSelection"/>
     <!-- 实时功率检测 -->
     <alarmRulesRealPower/>
     <!-- 人体检测 -->
     <alarmRulesBody v-bind:scopeSelection="scopeSelection"/>
     <!-- 流明度检测 -->
     <alarmRulesLumen v-bind:scopeSelection="scopeSelection"/>
     <!-- 报警提示设置 -->
     <alarmVoiceAndAlert />
   </div>
</template>

<script>
import WeekSelecttion from '../publicComponemts/WeekSelecttion.vue'
import RegionSelection from '../publicComponemts/RegionSelection.vue'
import alarmRulesSingle from './Man-alarmRulesSingle.vue'
import alarmRulesRealPower from './Man-alarmRulesRealPower.vue'
import alarmRulesPublic from './Man-alarmRulesPublic.vue'
import alarmRulesBody from './Man-alarmRulesBody.vue'
import alarmRulesLumen from './Man-alarmRulesLumen.vue'
import alarmVoiceAndAlert from './Man-alarmVoiceAndAlert.vue'
export default{
  name: 'Man-alarmRules',
  components: {
    RegionSelection: RegionSelection,
    WeekSelecttion: WeekSelecttion,
    alarmRulesSingle: alarmRulesSingle,
    alarmRulesRealPower: alarmRulesRealPower,
    alarmRulesPublic: alarmRulesPublic,
    alarmRulesBody: alarmRulesBody,
    alarmRulesLumen: alarmRulesLumen,
    alarmVoiceAndAlert: alarmVoiceAndAlert
  },
  data() {
    return {
      scopeSelection: [{value: '00000', label: '全部'}] // 范围可选择值
    }
  },
  created() {
    this.getUnitAndFloor()
  },
  methods: {
    // 获取可选择的栋数
    getUnitAndFloor: function() {
      var self = this
      var url = '/sdm/unit/getUnitFloor'
      self.$http.post(url).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            for (var i = 0; i < result.data.rows.length; i++) {
              var list = {value: '', label: ''}
              list.value = result.data.rows[i].unitCode
              list.label = result.data.rows[i].unitName
              self.scopeSelection.push(list)
            }
          }
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    }
  }
}
</script>

<style>
  @import url("../../../static/css/Management/Man-alarmRules.css");
</style>
