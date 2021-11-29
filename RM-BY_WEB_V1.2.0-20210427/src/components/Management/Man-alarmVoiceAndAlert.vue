<template>
  <div class="man_ala_RuBodyBox" style="padding-bottom: 40px">
      <div class="smallTitle"><p>报警提示</p></div>
      <div class="man_alaParnetAfter">
        <el-row>
          <el-col :span="8">
            <p>报警提示音</p>
            <el-switch
              style="display: block"
              v-model="voice"
              @change="voiceChanged"
              active-color="#19BEAE"
              active-text="开启"
              inactive-text="关闭"></el-switch>
          </el-col>
          <el-col :span="8">
            <p>报警弹窗</p>
            <el-switch
              style="display: block"
              v-model="alert"
              @change="alertChanged"
              active-color="#19BEAE"
              active-text="开启"
              inactive-text="关闭"></el-switch>
          </el-col>
        </el-row>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Man-alarm-voice-alert',
  data() {
    return {
      voice: 0,
      voiceId: 0,
      alert: 0,
      alertId: 0,
      requestTypeSet: new Set()
    }
  },
  created() {
    this.getAlarmStatus(9)
    this.getAlarmStatus(8)
  },
  methods: {
    getAlarmStatus(type) {
      let url = '/sdm/alarm/getAlarmList'
      let data = {
        pageNo: 1,
        pageSize: 10,
        alarmType: type
      }
      this.$http.post(url, data).then(res => {
        if (res.data.flag) {
          if (res.data.dataList.length) {
            let obj = res.data.dataList[0]
            if (type === 9) {
              this.alert = Boolean(obj.alarmState)
              this.alertId = obj.alarmId
            } else {
              this.voice = Boolean(obj.alarmState)
              this.voiceId = obj.alarmId
            }
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    voiceChanged(value) {
      this.requestTypeSet.has(8) || this.changeStatus(8, this.voiceId, value ? 1 : 0)
    },
    alertChanged(value) {
      this.requestTypeSet.has(9) || this.changeStatus(9, this.alertId, value ? 1 : 0)
    },
    /**
     * 设置失败后重置回原来的状态
     */
    resetStatus(type, value) {
      setTimeout(() => {
        type === 9 ? this.alert = !value : this.voice = !value
      }, 0.5 * 1000)
    },
    changeStatus(type, id, value) {
      let url = '/sdm/alarm/editAlarm'
      let data = {
        alarmType: type,
        alarmState: value,
        alarmId: id
      }
      this.requestTypeSet.add(type)
      this.$http.post(url, data).then(res => {
        if (res.data.flag) {
          this.$eventBus.$emit('AlarmAlertStatusChanged')
        } else {
          this.$message({message: res.data.msg, type: 'warning'})
          this.resetStatus(type, value)
        }
      }).catch(err => {
        console.log(err)
        this.resetStatus(type, value)
      }).finally(() => {
        this.requestTypeSet.delete(type)
      })
    }
  }
}
</script>

<style>
</style>
